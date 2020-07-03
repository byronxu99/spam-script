import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";

type NavBarProps = {
  title: string;
  nextPage?: () => void;
  prevPage?: () => void;
  showNext: boolean;
  showPrev: boolean;
};

const defaultProps = {
  title: "",
  nextPage: () => {
    return false;
  },
  prevPage: () => {
    return false;
  },
  showNext: false,
  showPrev: false,
};

export default function NavBar(props: NavBarProps = defaultProps) {
  return (
    <div>
      <nav className="container pt-5">
        <div className="level is-mobile">
          {/* previous page button */}
          <div className="level-left has-text-centered">
            <button
              onClick={props.prevPage}
              className={
                "button is-success " + (props.showPrev ? "" : "is-invisible")
              }
            >
              <span className="icon">
                <FontAwesomeIcon icon={faAngleLeft} transform="down-1" />
              </span>
              &nbsp;Back
            </button>
          </div>

          {/* main title */}
          <div className="level-item">
            <div className="title is-3 py-1">{props.title}</div>
          </div>

          {/* next page button */}
          <div className="level-right has-text-centered">
            <button
              onClick={props.nextPage}
              className={
                "button is-success " + (props.showNext ? "" : "is-invisible")
              }
            >
              Next&nbsp;
              <span className="icon">
                <FontAwesomeIcon icon={faAngleRight} transform="down-1" />
              </span>
            </button>
          </div>
        </div>
      </nav>
      <hr />
    </div>
  );
}
