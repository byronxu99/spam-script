/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faQuestionCircle,
} from "@fortawesome/free-regular-svg-icons";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import NavBar from "../NavBar";
import Form from "./Form";
import PreviewTab from "./PreviewTab";
import HelpTab from "./HelpTab";
import AttachmentsTab from "./AttachmentsTab";

type MessagePageProps = {
  nextPage: () => void;
  prevPage: () => void;
};

// selects which tab is active
enum Tab {
  PREVIEW,
  HELP,
  ATTACHMENTS,
}
const defaultTab: Tab = Tab.PREVIEW;

export default function MessagePage(props: MessagePageProps) {
  const [currentTab, setCurrentTab] = useState(defaultTab);

  return (
    <>
      {/* nav bar */}
      <NavBar
        title="Write your message"
        nextPage={props.nextPage}
        prevPage={props.prevPage}
        showNext={true}
        showPrev={true}
      />

      <div className="fill-height">
        <div className="container px-3 pb-3 fullheight-container">
          <div className="columns is-desktop is-variable is-4 my-0 fullheight-container">
            {/* left panel: form for message template */}
            <div className="column">
              <div className="fullheight-column">
                <div className="scrollable">
                  <Form />
                </div>
              </div>
            </div>

            {/* right panel: preview etc */}
            <div className="column fullheight-container">
              <div className="card fullheight-card">
                {/* navigation tabs */}
                <nav className="card-footer">
                  <div className="card-footer-item tabs is-fullwidth pt-1">
                    <ul>
                      <li
                        className={
                          currentTab === Tab.PREVIEW ? "is-active" : ""
                        }
                      >
                        <a
                          onClick={(e) => {
                            setCurrentTab(Tab.PREVIEW);
                            e.preventDefault();
                          }}
                        >
                          <span className="icon">
                            <FontAwesomeIcon icon={faEnvelope} fixedWidth />
                          </span>
                          <span>Preview</span>
                        </a>
                      </li>
                      <li
                        className={currentTab === Tab.HELP ? "is-active" : ""}
                      >
                        <a
                          onClick={(e) => {
                            setCurrentTab(Tab.HELP);
                            e.preventDefault();
                          }}
                        >
                          <span className="icon">
                            <FontAwesomeIcon
                              icon={faQuestionCircle}
                              fixedWidth
                            />
                          </span>
                          <span>Help</span>
                        </a>
                      </li>
                      <li
                        className={
                          currentTab === Tab.ATTACHMENTS ? "is-active" : ""
                        }
                      >
                        <a
                          onClick={(e) => {
                            setCurrentTab(Tab.ATTACHMENTS);
                            e.preventDefault();
                          }}
                        >
                          <span className="icon">
                            <FontAwesomeIcon
                              icon={faPaperclip}
                              transform="shrink-1"
                              fixedWidth
                            />
                          </span>
                          <span>Attachments</span>
                        </a>
                      </li>
                    </ul>
                  </div>
                </nav>

                {/* render the desired element */}
                <div className="card-content pt-3 fill-height">
                  <div className="fullheight-column">
                    <div className="scrollable">
                      {currentTab === Tab.PREVIEW && <PreviewTab />}
                      {currentTab === Tab.HELP && <HelpTab />}
                      {currentTab === Tab.ATTACHMENTS && <AttachmentsTab />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
