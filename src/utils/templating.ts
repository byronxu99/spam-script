import marked from "marked";
import DOMPurify from "dompurify";
import htmlToText from "html-to-text";
import { ParsedData } from "../features/data/dataSlice";
import { Message, MessageFormat, StandardHeaders } from "./messageTypes";

// settings for libraries
const MARKED_OPTIONS = {
  smartLists: true,
  smartypants: true,
  xhtml: true,
};

const HTML_TO_TEXT_OPTIONS = {
  hideLinkHrefIfSameAsText: true,
  tables: true,
};

// reserved keywords that can't be used as header variable names
export const RESERVED_KEYWORDS: string[] = ["ARGV"];

// type definitions
type SpamDataObject = {
  [key: string]: string | string[];
};
type MessageTemplater = (spam: SpamDataObject) => Message;
type FieldTemplater = (spam: SpamDataObject) => string;

// escape a regex string
function escapeRegex(string: string): string {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
}

// convert ParsedData format into a list of SpamDataObject
// to be used with templating functions
export function makeSpamObjectArray(data: ParsedData): SpamDataObject[] {
  return data.rows.map((row, index) => makeSpamObject(data, index));
}

// convert a single row of data into SpamDataObject
export function makeSpamObject(
  data: ParsedData,
  index: number
): SpamDataObject {
  const { headers, rows } = data;
  const row = rows[index] || [];
  const spamObj: SpamDataObject = {};

  // data entries indexed by header name
  headers.forEach((name, index) => {
    if (name) {
      spamObj[name] = row[index] || "";
    }
  });

  // all data entries as an array
  spamObj["ARGV"] = row;

  return spamObj;
}

// given a message template, create a function that takes in a
// SpamDataObject and returns a templated, processed message
export function makeMessageTemplater(template: Message): MessageTemplater {
  const headerTemplaters: Record<StandardHeaders, FieldTemplater | Error> = {
    from: makeFieldTemplater(template.from),
    sender: makeFieldTemplater(template.sender),
    to: makeFieldTemplater(template.to),
    cc: makeFieldTemplater(template.cc),
    bcc: makeFieldTemplater(template.bcc),
    replyTo: makeFieldTemplater(template.replyTo),
    inReplyTo: makeFieldTemplater(template.inReplyTo),
    references: makeFieldTemplater(template.references),
    subject: makeFieldTemplater(template.subject),
    messageId: makeFieldTemplater(template.messageId),
    date: makeFieldTemplater(template.date),
  };
  const bodyTemplater = makeFieldTemplater(template.raw);
  const attachmentNameTemplater = makeFieldTemplater(template.attachmentNames);

  return function (spam) {
    const templatedMessage: Message = {
      host: template.host,
      bodyFormat: template.bodyFormat,
      attachments: [],
      errors: template.errors || [],
    };

    // templating the message headers
    for (const key in headerTemplaters) {
      const field = key as StandardHeaders;
      const templater = headerTemplaters[field];
      if (typeof templater === "function") {
        try {
          const result = templater(spam);
          // skip blank headers
          if (result) {
            templatedMessage[field] = result;
          }
        } catch (e) {
          // error occured while templating
          templatedMessage.errors?.push(
            renameError(e, `Error in field "${key}"`)
          );
        }
      } else {
        // error occured while creating templater function
        templatedMessage.errors?.push(
          renameError(templater, `Error in field "${key}"`)
        );
      }
    }

    // templating the raw message body
    if (typeof bodyTemplater === "function") {
      try {
        templatedMessage.raw = bodyTemplater(spam);
      } catch (e) {
        // error occured while templating
        templatedMessage.errors?.push(renameError(e, "Error in message body"));
      }
    } else {
      // error occured while creating templater function
      templatedMessage.errors?.push(
        renameError(bodyTemplater, "Error in message body")
      );
    }

    // attempt to add filename attachments
    template.attachments.forEach((file) => {
      const htmlRegex = new RegExp(
        `(<img[^<>]*)"${escapeRegex(file.filename)}"([^<>]*>)`,
        "g"
      );
      const markdownRegex = new RegExp(
        `!\\[([^[\\]]*)\\]\\(${escapeRegex(file.filename)}\\)`,
        "g"
      );

      if (htmlRegex.test(templatedMessage.raw!)) {
        templatedMessage.raw = templatedMessage.raw?.replaceAll(
          htmlRegex,
          `$1"cid:${file.cid}"$2`
        );
        templatedMessage.attachments.push({
          ...file,
          contentDisposition: "inline",
        });
      }

      if (markdownRegex.test(templatedMessage.raw!)) {
        templatedMessage.raw = templatedMessage.raw?.replaceAll(
          markdownRegex,
          `![$1](cid:${file.cid})`
        );
        templatedMessage.attachments.push({
          ...file,
          contentDisposition: "inline",
        });
      }
    });

    // copying over custom headers
    if (template.headers) {
      templatedMessage.headers = template.headers;
    }

    // template attachment names
    if (typeof attachmentNameTemplater === "function") {
      try {
        const result = attachmentNameTemplater(spam);
        if (result) {
          templatedMessage.attachmentNames = result;
        }
      } catch (e) {
        // error occured while templating
        templatedMessage.errors?.push(
          renameError(e, "Error in attachment names")
        );
      }
    } else {
      // error occured while creating templater function
      templatedMessage.errors?.push(
        renameError(attachmentNameTemplater, "Error in attachment names")
      );
    }

    // match attachmentNames to attachments with attachment disposition
    if (templatedMessage.attachmentNames) {
      templatedMessage.attachmentNames
        .split(",")
        .map((name) => name.trim())
        .forEach((name) => {
          const file = template.attachments.find(
            (file) => file.filename === name
          );
          if (!file) {
            templatedMessage.errors?.push(
              Error(`Could not find attachment with name ${name}`)
            );
          } else {
            templatedMessage.attachments.push({
              ...file,
              contentDisposition: "attachment",
            });
          }
        });
    }

    // convert from raw to processed message
    return postprocess(templatedMessage);
  };
}

// create a per-field templating function
function makeFieldTemplater(field?: string): FieldTemplater | Error {
  if (!field) {
    return () => "";
  }
  try {
    // eslint-disable-next-line no-new-func
    return Function("SPAM", `return \`${field}\``) as FieldTemplater;
  } catch (e) {
    // an error occured while creating the function
    return e;
  }
}

// rename an error to include a more helpful message
function renameError(error: Error, name: string): Error {
  const newError = Error(error.toString());
  newError.name = name;
  return newError;
}

// postprocess raw message body into html/text format
function postprocess(message: Message): Message {
  const output = { ...message };

  // message is in Markdown format
  if (message.raw && message.bodyFormat === MessageFormat.MARKDOWN) {
    const unsanitizedHtml = marked(message.raw, MARKED_OPTIONS);
    output.html = DOMPurify.sanitize(unsanitizedHtml);
    output.text = htmlToText.fromString(output.html, HTML_TO_TEXT_OPTIONS);
  }

  // message is in raw HTML format
  if (message.raw && message.bodyFormat === MessageFormat.HTML) {
    output.html = DOMPurify.sanitize(message.raw);
    output.text = htmlToText.fromString(output.html, HTML_TO_TEXT_OPTIONS);
  }

  // message is in plain text format
  if (message.raw && message.bodyFormat === MessageFormat.PLAINTEXT) {
    output.text = message.raw;
  }

  // missing raw message body
  if (!message.raw) {
    output.text = "";
  }

  if (output.html) {
    // pictures we couldn't find attachments for
    [...output.html.matchAll(/src="(?!cid:)([^"]*)"/g)].forEach((match) => {
      output.errors?.push(
        Error(`Could not find attachment with name ${match[1]}`)
      );
    });
  }

  output.bodyFormat = MessageFormat.PROCESSED;
  return output;
}
