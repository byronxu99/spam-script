import React from "react";
import Footer from "./Footer";

type MainPageProps = {
  nextPage: () => void;
};

export default function MainPage(props: MainPageProps) {
  // whether we are viewing on scripts.mit.edu or 3rd party server
  const isMIT = window.location.hostname.includes("mit.edu");

  return (
    <>
      <section className="hero is-fullheight">
        <div className="hero-body">
          <div className="container">
            {/* main title */}
            <div className="title is-1 has-text-centered">
              Welcome to the new spam script!
            </div>

            {/* the 3 steps */}
            <div className="columns is-desktop py-5">
              <div className="column has-text-centered px-2">
                <div className="huge-icon">
                  <span role="img" aria-label="icon">
                    📋
                  </span>
                </div>
                <p className="title is-3 py-1">Enter your data</p>
                <p className="subtitle is-5 py-2 px-5">
                  Copy and paste tab-separated or comma-separated values from a
                  spreadsheet.
                </p>
              </div>

              <div className="column has-text-centered px-2">
                <div className="huge-icon">
                  <span role="img" aria-label="icon">
                    ✏️
                  </span>
                </div>
                <p className="title is-3 py-1">Write your message</p>
                <p className="subtitle is-5 py-2 px-5">
                  Draft a Markdown, HTML, or plain-text email template. Now with
                  live preview!
                </p>
              </div>

              <div className="column has-text-centered px-2">
                <div className="huge-icon">
                  <span role="img" aria-label="icon">
                    ✉️
                  </span>
                </div>
                <p className="title is-3 py-1">Send your spam</p>
                <p className="subtitle is-5 py-2 px-5">
                  Not yet implemented :(
                </p>
              </div>
            </div>

            {/* button */}
            <div className="has-text-centered py-4">
              <button
                onClick={props.nextPage}
                className="button is-success is-large px-6"
              >
                Get started
              </button>
            </div>

            {/* link to old spam script */}
            {isMIT && (
              <div className="has-text-centered py-1">
                <a href="https://esp.scripts.mit.edu:444/esp-publicity/email/email-dictator/web/edit.cgi">
                  Looking for the old spam script? Click here.
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
