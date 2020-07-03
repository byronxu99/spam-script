import React from "react";
import { Message } from "../../utils/messageTypes";

// renders an in-browser preview of an email message
export default function MessagePreview(props: { message: Message }) {
  const headerStyle = "has-text-weight-bold";
  const emptyStyle = "has-text-grey-light";
  const mandatory = {
    from: props.message.from || "(empty)",
    fromClass: props.message.from ? "" : emptyStyle,
    to: props.message.to || "(empty)",
    toClass: props.message.to ? "" : emptyStyle,
    subject: props.message.subject || "(empty)",
    subjectClass: props.message.subject ? "" : emptyStyle,
  };

  return (
    <div>
      {/* headers */}
      <div className="add-paragraph-spacing">
        <p>
          <span className={headerStyle}>From:</span>{" "}
          <span className={mandatory.fromClass}>{mandatory.from}</span>
        </p>

        <p>
          <span className={headerStyle}>To:</span>{" "}
          <span className={mandatory.toClass}>{mandatory.to}</span>
        </p>

        {props.message.cc && (
          <p>
            <span className={headerStyle}>Cc:</span> {props.message.cc}
          </p>
        )}

        {props.message.bcc && (
          <p>
            <span className={headerStyle}>Bcc:</span> {props.message.bcc}
          </p>
        )}

        {props.message.replyTo && (
          <p>
            <span className={headerStyle}>Reply-To:</span>{" "}
            {props.message.replyTo}
          </p>
        )}

        {props.message.sender && (
          <p>
            <span className={headerStyle}>Sender:</span> {props.message.sender}
          </p>
        )}

        {props.message.inReplyTo && (
          <p>
            <span className={headerStyle}>In-Reply-To:</span>{" "}
            {props.message.inReplyTo}
          </p>
        )}

        {props.message.references && (
          <p>
            <span className={headerStyle}>References:</span>{" "}
            {props.message.references}
          </p>
        )}

        <p>
          <span className={headerStyle}>Subject:</span>{" "}
          <span className={mandatory.subjectClass}>{mandatory.subject}</span>
        </p>

        {props.message.messageId && (
          <p>
            <span className={headerStyle}>Message-ID:</span>{" "}
            {props.message.messageId}
          </p>
        )}

        {props.message.date && (
          <p>
            <span className={headerStyle}>Date:</span> {props.message.date}
          </p>
        )}
      </div>

      {/* body */}
      <div className="pt-3 break-overflow">
        {/* HTML body, if it exists */}
        {props.message.html && (
          <div
            className="content"
            dangerouslySetInnerHTML={{ __html: props.message.html }}
          />
        )}

        {/* plain text body, if HTML does not exist */}
        {!props.message.html && props.message.text && (
          <pre className="wrap-text">{props.message.text}</pre>
        )}

        {/* missing email body */}
        {!props.message.html && !props.message.text && (
          <p className={emptyStyle}>(message is blank)</p>
        )}
      </div>

      {/* errors */}
      {props.message.errors && props.message.errors.length > 0 && (
        <div className="pt-5">
          {props.message.errors.map((error, index) => {
            return (
              <div key={index} className="message is-danger">
                <div className="message-body">
                  {error.name && (
                    <span className={headerStyle}>[{error.name}] </span>
                  )}
                  {error.message}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
