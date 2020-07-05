import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";
import {
  faAngleDown,
  faSpinner,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useSelector, useDispatch } from "react-redux";
import { SendStatus, selectSendObject, setShowPreview } from "./sendingSlice";
import MessagePreview from "../message/MessagePreview";

export default function MessageSendCard(props: { index: number }) {
  // get data from redux store
  const { message, status, showPreview } = useSelector(
    selectSendObject(props.index)
  );
  const dispatch = useDispatch();

  // function to toggle the expanded/collapsed state
  const togglePreview = () => {
    dispatch(
      setShowPreview({
        index: props.index,
        showPreview: !showPreview,
      })
    );
  };

  // list of all recipients
  const recipients: string = [message.to, message.cc, message.bcc]
    .filter((x) => x?.trim())
    .join(", ");

  // icon
  const icon =
    status === SendStatus.UNSENT
      ? faEnvelope
      : status === SendStatus.QUEUED
      ? faSpinner
      : status === SendStatus.SENDING
      ? faSpinner
      : status === SendStatus.SUCCESS
      ? faCheck
      : faTimes;
  const iconStyle =
    status === SendStatus.SUCCESS
      ? "has-text-success"
      : status === SendStatus.ERROR
      ? "has-text-danger"
      : status === SendStatus.SENDING
      ? "has-text-info"
      : "";
  const iconSpin =
    status === SendStatus.QUEUED || status === SendStatus.SENDING;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-header-title">
          {/* icon */}
          <span className={`icon mr-3 ${iconStyle}`}>
            <FontAwesomeIcon icon={icon} fixedWidth pulse={iconSpin} />
          </span>
          {/* recipients */}
          {recipients}
          {!recipients && (
            <span className="has-text-danger">Message has no recipients!</span>
          )}
          {/* errors */}
          {message.errors && message.errors.length > 0 && (
            <>
              &nbsp;
              <span className="tag is-warning is-light">
                Message has errors
              </span>
            </>
          )}
        </div>

        {/* toggle expand/collapse button */}
        <div className="card-header-icon" onClick={togglePreview}>
          <span className="icon">
            <FontAwesomeIcon icon={faAngleDown} fixedWidth />
          </span>
        </div>
      </div>

      {/* show message preview when expanded */}
      {showPreview && (
        <div className="card-content">
          <MessagePreview message={message} />
        </div>
      )}
    </div>
  );
}
