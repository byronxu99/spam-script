import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { useSelector, useDispatch } from "react-redux";
import { selectSendObject, setShowPreview } from "./sendingSlice";
import MessagePreview from "../message/MessagePreview";

export default function MessageSendCard(props: { index: number }) {
  // get data from redux store
  const sendObject = useSelector(selectSendObject(props.index));
  const dispatch = useDispatch();

  // function to toggle the expanded/collapsed state
  const togglePreview = () => {
    dispatch(
      setShowPreview({
        index: props.index,
        showPreview: !sendObject.showPreview,
      })
    );
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-header-title">
          <span className="icon">
            <FontAwesomeIcon icon={faEnvelope} fixedWidth />
          </span>
          &nbsp; To: {sendObject.message.to || "(empty)"}
        </div>

        <div className="card-header-icon" onClick={togglePreview}>
          <span className="icon">
            <FontAwesomeIcon icon={faAngleDown} fixedWidth />
          </span>
        </div>
      </div>

      {sendObject.showPreview && (
        <div className="card-content">
          <MessagePreview message={sendObject.message} />
        </div>
      )}
    </div>
  );
}
