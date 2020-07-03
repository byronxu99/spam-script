// object representing an email message
export type Message = {
  // headers
  from?: string;
  sender?: string;
  to?: string;
  cc?: string;
  bcc?: string;
  replyTo?: string;
  inReplyTo?: string;
  references?: string;
  subject?: string;
  messageId?: string;
  date?: string;
  headers?: CustomHeaders;

  // body content, before and after processing
  bodyFormat: MessageFormat;
  raw?: string;
  text?: string;
  html?: string;

  // attachments
  attachments: Attachment[];

  // errors
  errors?: Error[];
};

export enum MessageFormat {
  MARKDOWN,
  HTML,
  PLAINTEXT,
  PROCESSED,
}

// object representing each email attachment
export type Attachment = {
  // attachement metadata
  filename: string;
  contentType?: string; // MIME type
  contentDisposition?: "inline" | "attachment";
  contentTransferEncoding?: string; // usually "base64"
  cid?: string; // unique identifier for each inline image
  headers?: CustomHeaders;

  // attachment data
  content: string;
};

// dictionary of additional custom headers
export type CustomHeaders = {
  [key: string]: string;
};

export type StandardHeaders =
  | "from"
  | "sender"
  | "to"
  | "cc"
  | "bcc"
  | "replyTo"
  | "inReplyTo"
  | "references"
  | "subject"
  | "messageId"
  | "date";
