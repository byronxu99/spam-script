import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { Attachment } from "../../utils/messageTypes";
import { addAttachments, selectAttachments } from "./messageSlice";

export default function AttachmentsTab() {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const attachments = useSelector(selectAttachments);

  /* converts a file to an attachment; returns a promise. */
  const fileToAttachment = (file: File) =>
    new Promise<Attachment>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result === "string") {
          resolve({
            filename: file.name,
            contentType: file.type,
            contentTransferEncoding: "base64",
            // RFC 2045 says the "@" is required
            cid: `${file.name.replace(/[^a-z0-9.]/gi, "")}@esp.mit.edu`,
            // starts with data:*/*;base64,
            content: result.split(",")[1],
          });
        } else {
          reject();
        }
      };
      reader.readAsDataURL(file);
    });

  return (
    <>
      <div className="field">
        <div className="file">
          <label className="file-label">
            <input
              className="file-input"
              type="file"
              multiple={true}
              onChange={(e) => {
                const newFiles = e.target.files;
                if (!newFiles) return;
                setIsLoading(true);
                Promise.all([...newFiles].map(fileToAttachment)).then(
                  (results) => {
                    dispatch(addAttachments(results));
                    setIsLoading(false);
                  }
                );
              }}
            />
            <span className="file-cta">
              <span className="file-icon">
                <FontAwesomeIcon icon={faUpload} fixedWidth />
              </span>
              <span className="file-label">Choose files…</span>
            </span>
          </label>
        </div>
      </div>
      {/* check if CIDs are distinct */}
      {new Set(attachments.map((file) => file.cid)).size !==
      attachments.length ? (
        <div className="message is-warning">
          <div className="message-header">
            <p>Warning</p>
          </div>
          <div className="message-body">
            Filenames should be distinct! No promises what'll happen when they
            aren't.
          </div>
        </div>
      ) : null}
      <div className="content">
        <h3>Filenames:</h3>
        <ul>
          {isLoading ? (
            <li className="has-text-grey-light">(loading...)</li>
          ) : attachments.length === 0 ? (
            <li className="has-text-grey-light">(none selected)</li>
          ) : (
            attachments.map((file, i) => <li key={i}>{file.filename}</li>)
          )}
        </ul>
      </div>
    </>
  );
}
