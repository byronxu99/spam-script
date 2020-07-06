/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { MessageFormat } from "../../utils/messageTypes";
import {
  selectMessageFormat,
  setMessageFormat,
  selectRawBody,
  setRawBody,
  selectHeader,
  setHeader,
} from "./messageSlice";

export default function Form() {
  const [showExtra, setShowExtra] = useState(false);
  const dispatch = useDispatch();

  // headers
  const from = useSelector(selectHeader("from"));
  const to = useSelector(selectHeader("to"));
  const cc = useSelector(selectHeader("cc"));
  const bcc = useSelector(selectHeader("bcc"));
  const replyTo = useSelector(selectHeader("replyTo"));
  const sender = useSelector(selectHeader("sender"));
  const inReplyTo = useSelector(selectHeader("inReplyTo"));
  const subject = useSelector(selectHeader("subject"));

  // message body
  const messageFormat = useSelector(selectMessageFormat);
  const messageText = useSelector(selectRawBody);

  return (
    <>
      <div className="field">
        <div className="control">
          <label className="label">From</label>
          <input
            className="input"
            type="text"
            value={from || ""}
            placeholder="Your Name <example@mit.edu>"
            onChange={(e) =>
              dispatch(setHeader({ header: "from", value: e.target.value }))
            }
          />
          <p className="help">Should be an @mit.edu address</p>
        </div>
      </div>

      <div className="field">
        <div className="control">
          <label className="label">To</label>
          <input
            className="input"
            type="text"
            value={to || ""}
            placeholder={`\${SPAM.email}`}
            onChange={(e) =>
              dispatch(setHeader({ header: "to", value: e.target.value }))
            }
          />
          <p className="help">Main recipients of your message</p>
        </div>
      </div>

      <div className="field">
        <div className="control">
          <label className="label">Cc</label>
          <input
            className="input"
            type="text"
            value={cc || ""}
            placeholder="test1@example.com, test2@example.com"
            onChange={(e) =>
              dispatch(setHeader({ header: "cc", value: e.target.value }))
            }
          />
          <p className="help">Additional recipients of your message</p>
        </div>
      </div>

      {/* hide additional fields */}
      {!showExtra && (
        <div className="has-text-centered">
          <a
            onClick={(event) => {
              setShowExtra(true);
              event.preventDefault();
            }}
          >
            Show additional fields...
          </a>
        </div>
      )}

      {/* show additional fields */}
      {showExtra && (
        <>
          <div className="has-text-centered">
            <a
              onClick={(event) => {
                setShowExtra(false);
                event.preventDefault();
              }}
            >
              Hide additional fields...
            </a>
          </div>

          <div className="field">
            <div className="control">
              <label className="label">Bcc</label>
              <input
                className="input"
                type="text"
                value={bcc || ""}
                placeholder="test3@example.com"
                onChange={(e) =>
                  dispatch(setHeader({ header: "bcc", value: e.target.value }))
                }
              />
              <p className="help">
                Additional hidden recipients of your message
              </p>
            </div>
          </div>

          <div className="field">
            <div className="control">
              <label className="label">Reply-To</label>
              <input
                className="input"
                type="text"
                value={replyTo || ""}
                onChange={(e) =>
                  dispatch(
                    setHeader({ header: "replyTo", value: e.target.value })
                  )
                }
              />
              <p className="help">
                Optional email address that you want people to send replies to
              </p>
            </div>
          </div>

          <div className="field">
            <div className="control">
              <label className="label">Sender</label>
              <input
                className="input"
                type="text"
                value={sender || ""}
                onChange={(e) =>
                  dispatch(
                    setHeader({ header: "sender", value: e.target.value })
                  )
                }
              />
              <p className="help">
                If From is not an @mit.edu address, set this to an @mit.edu
                address to send on behalf of an external address
              </p>
            </div>
          </div>

          <div className="field">
            <div className="control">
              <label className="label">In-Reply-To</label>
              <input
                className="input"
                type="text"
                value={inReplyTo || ""}
                onChange={(e) =>
                  dispatch(
                    setHeader({ header: "inReplyTo", value: e.target.value })
                  )
                }
              />
              <p className="help">
                For replying to previous messages (leave blank if you don't know
                what this is)
              </p>
            </div>
          </div>
        </>
      )}

      {/* subject field */}
      <div className="field">
        <div className="control">
          <label className="label">Subject</label>
          <input
            className="input"
            type="text"
            value={subject || ""}
            placeholder={`Automated spam message for \${SPAM.name}`}
            onChange={(e) =>
              dispatch(setHeader({ header: "subject", value: e.target.value }))
            }
          />
        </div>
      </div>

      {/* message textbox */}
      <div className="field">
        <label className="label">Message</label>
        {/* message type selector */}
        <div className="tabs is-toggle is-small mb-3">
          <ul>
            <li
              className={
                messageFormat === MessageFormat.MARKDOWN ? "is-active" : ""
              }
            >
              <a
                onClick={(e) => {
                  dispatch(setMessageFormat(MessageFormat.MARKDOWN));
                  e.preventDefault();
                }}
              >
                Markdown
              </a>
            </li>
            <li
              className={
                messageFormat === MessageFormat.HTML ? "is-active" : ""
              }
            >
              <a
                onClick={(e) => {
                  dispatch(setMessageFormat(MessageFormat.HTML));
                  e.preventDefault();
                }}
              >
                HTML
              </a>
            </li>
            <li
              className={
                messageFormat === MessageFormat.PLAINTEXT ? "is-active" : ""
              }
            >
              <a
                onClick={(e) => {
                  dispatch(setMessageFormat(MessageFormat.PLAINTEXT));
                  e.preventDefault();
                }}
              >
                Plain text
              </a>
            </li>
          </ul>
        </div>

        <textarea
          className="textarea"
          value={messageText || ""}
          rows={20}
          placeholder={placeholderText}
          onChange={(e) => dispatch(setRawBody(e.target.value))}
        ></textarea>
      </div>
    </>
  );
}

export const placeholderText = `
Dear \${SPAM.name},

This is a friendly reminder that your appointment is scheduled for **tomorrow** at \${SPAM.time}.

If you have any questions, please visit [our website](https://example.com).

Sincerely,<br>
Your Name
`.trim();
