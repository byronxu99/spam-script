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
  const icon = getIcon(status);
  const iconStyle = getIconStyle(status);
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
          {/* error in message */}
          {message.errors && message.errors.length > 0 && (
            <>
              &nbsp;
              <span className="tag is-warning is-light">Message error</span>
            </>
          )}
          {/* error in sending process */}
          {status === SendStatus.ERROR && (
            <>
              &nbsp;
              <span className="tag is-danger is-light">Sending error</span>
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

function getIcon(status: SendStatus) {
  switch (status) {
    case SendStatus.UNSENT:
      return faEnvelope;
    case SendStatus.QUEUED:
      return faSpinner;
    case SendStatus.SENDING:
      return faSpinner;
    case SendStatus.SUCCESS:
      return faCheck;
    case SendStatus.ERROR:
      return faTimes;
  }
}

function getIconStyle(status: SendStatus) {
  switch (status) {
    case SendStatus.SUCCESS:
      return "has-text-success";
    case SendStatus.ERROR:
      return "has-text-danger";
    case SendStatus.SENDING:
      return "has-text-info";
    default:
      return "";
  }
}
