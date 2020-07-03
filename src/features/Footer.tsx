import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="level has-text-centered">
          <div className="level-item">
            <a
              href="https://esp.mit.edu"
              target="_blank"
              rel="noopener noreferrer"
              className="has-text-grey-dark"
            >
              MIT ESP Email Spam Script
            </a>
          </div>

          <div className="level-item">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="has-text-grey-dark"
            >
              <span className="icon">
                <FontAwesomeIcon
                  icon={faGithub}
                  fixedWidth
                  transform="down-1"
                />
              </span>{" "}
              Open Source
            </a>
          </div>

          <div className="level-item">
            <a
              href="https://scripts.mit.edu"
              target="_blank"
              rel="noopener noreferrer"
              className="has-text-grey-dark"
            >
              Powered by scripts.mit.edu
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
