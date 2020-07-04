import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { Message } from "../../utils/messageTypes";
import MessagePreview from "../message/MessagePreview";

export default function MessageSendCard(props: { message: Message }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-header-title">
          <span className="icon">
            <FontAwesomeIcon icon={faEnvelope} fixedWidth />
          </span>
          &nbsp; To: {props.message.to || "(empty)"}
        </div>

        <div className="card-header-icon" onClick={() => setOpen(!open)}>
          <span className="icon">
            <FontAwesomeIcon icon={faAngleDown} fixedWidth />
          </span>
        </div>
      </div>

      {open && (
        <div className="card-content">
          <MessagePreview message={props.message} />
        </div>
      )}
    </div>
  );
}
