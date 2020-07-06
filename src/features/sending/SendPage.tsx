import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import {
  SendStatus,
  selectSendStatuses,
  loadMessagesToSend,
  setShowPreview,
  sendMessages,
  cancelSending,
} from "./sendingSlice";
import MessageSendCard from "./MessageSendCard";
import NavBar from "../NavBar";
import { isMIT, clearExitConfirmation } from "../../utils/misc";

type SendPageProps = {
  prevPage: () => void;
};

export default function SendPage(props: SendPageProps) {
  // data from redux store
  const sendStatuses = useSelector(selectSendStatuses);
  const dispatch = useDispatch();

  // counts of various message types
  const numMessages = sendStatuses.length;
  const numSuccess = sendStatuses.filter((x) => x === SendStatus.SUCCESS)
    .length;
  const numUnsent = numMessages - numSuccess;
  const numError = sendStatuses.filter((x) => x === SendStatus.ERROR).length;

  // when no messages have been sent, allow going back for further edits
  const canGoBack = sendStatuses.every((x) => x === SendStatus.UNSENT);
  // done sending when all messages are successfully sent
  const isDoneSending = numSuccess === numMessages;
  // in progress if any message is queued or sending
  const isInProgress = sendStatuses.some(
    (x) => x === SendStatus.QUEUED || x === SendStatus.SENDING
  );

  // update messages on component mount
  useEffect(() => {
    dispatch(loadMessagesToSend());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when done, clear the page leaving notification
  useEffect(() => {
    if (isDoneSending) {
      clearExitConfirmation();
    }
  }, [isDoneSending]);

  return (
    <>
      {/* no messages */}
      {numMessages === 0 && (
        <div className="hero is-fullheight">
          <div className="hero-header">
            <NavBar
              title="Send your spam"
              prevPage={props.prevPage}
              showNext={false}
              showPrev={canGoBack}
            />
          </div>

          <div className="hero-body">
            <div className="container has-text-centered pb-6">
              <div className="huge-icon">
                <span role="img" aria-label="icon">
                  📭
                </span>
              </div>
              <p className="title has-text-grey-dark">No messages to send!</p>
            </div>
          </div>
        </div>
      )}

      {/* with messages */}
      {numMessages > 0 && (
        <div>
          <NavBar
            title="Send your spam"
            prevPage={props.prevPage}
            showNext={false}
            showPrev={canGoBack}
          />

          <div>
            <div className="container px-3 pb-5">
              {/* notification for fake sending when running in demo mode */}
              {!isMIT && (
                <div className="message is-warning">
                  <div className="message-body">
                    <strong>You are using a non-functional demo.</strong> All
                    results here are simulated, and no actual emails will be
                    sent.
                  </div>
                </div>
              )}

              {/* progress stats and send/pause button */}
              <div className="level pb-2">
                {/* count of messages not yet successfully sent */}
                <div className="level-item has-text-centered">
                  <div>
                    <p className="title is-1">{numUnsent}</p>
                    <p className="heading">Not sent</p>
                  </div>
                </div>
                {/* count of messages successfully sent */}
                <div className="level-item has-text-centered">
                  <div>
                    <p className="title is-1">{numSuccess}</p>
                    <p className="heading">Delivered</p>
                  </div>
                </div>
                {/* number of errors that occurred while sending */}
                <div className="level-item has-text-centered">
                  <div>
                    <p
                      className={`title is-1 ${
                        numError > 0 ? "has-text-danger" : ""
                      }`}
                    >
                      {numError}
                    </p>
                    <p className="heading">Errors</p>
                  </div>
                </div>
                {/* button to send/pause */}
                <div className="level-item has-text-centered">
                  {isDoneSending && (
                    <div>
                      <span className="icon is-large has-text-success">
                        <FontAwesomeIcon icon={faCheck} size="3x" />
                      </span>
                      <p className="heading pt-1">All done!</p>
                    </div>
                  )}
                  {isInProgress && (
                    <div>
                      <button
                        className="button is-medium is-outlined is-warning"
                        onClick={() => dispatch(cancelSending())}
                      >
                        Pause
                      </button>
                      <p className="heading pt-1">Click to pause</p>
                    </div>
                  )}
                  {!isDoneSending && !isInProgress && (
                    <div>
                      <button
                        className="button is-medium is-success"
                        onClick={() => dispatch(sendMessages())}
                      >
                        Spam!
                      </button>
                      <p className="heading pt-1">
                        {numError > 0 ? "Click to (re)send" : "Click to send"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* label and buttons for expanding/collapsing cards */}
              <div className="level is-mobile mb-2">
                <div className="level-left">
                  <p className="subtitle is-5 mt-1">{`You have ${numMessages} email message${
                    numMessages > 1 ? "s" : ""
                  }.`}</p>
                </div>
                <div className="level-right">
                  <div className="buttons has-addons">
                    <button
                      className="button is-small"
                      onMouseDown={(e) => {
                        dispatch(setShowPreview({ showPreview: true }));
                        e.preventDefault();
                      }}
                    >
                      Expand all
                    </button>
                    <button
                      className="button is-small"
                      onMouseDown={(e) => {
                        dispatch(setShowPreview({ showPreview: false }));
                        e.preventDefault();
                      }}
                    >
                      Collapse all
                    </button>
                  </div>
                </div>
              </div>

              {/* generate a card for each array index */}
              {sendStatuses.map((message, index) => {
                return <MessageSendCard key={index} index={index} />;
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
