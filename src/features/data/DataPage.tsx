import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";
import { loadData, selectRawData, selectParsedData } from "./dataSlice";
import { MessageFormat } from "../../utils/messageTypes";
import { RESERVED_KEYWORDS } from "../../utils/templating";
import {
  setMessageFormat,
  setRawBody,
  setHeader,
} from "../message/messageSlice";
import { placeholderText as messageBodyPlaceholder } from "../message/Form";
import NavBar from "../NavBar";

type DataPageProps = {
  nextPage: () => void;
  prevPage: () => void;
};

const placeholderText = `
email, name, time
aphacker@mit.edu, Alyssa P. Hacker, 9:00 AM
bitdiddle@mit.edu, Ben Bitdiddle, 11:00 AM
pembroke@mit.edu, Edward S. Pembroke, 2:00 PM
`.trim();

export default function DataPage(props: DataPageProps) {
  const inputStr = useSelector(selectRawData);
  const dispatch = useDispatch();

  return (
    <>
      {/* nav bar */}
      <NavBar
        title="Enter your data"
        nextPage={props.nextPage}
        prevPage={props.prevPage}
        showNext={true}
        showPrev={true}
      />

      <div>
        <div className="container px-3 pb-3">
          {/* text entry box */}
          <div className="field">
            <label className="label">
              Enter data as a tab- or comma-separated array. The first line
              should be a header row with variable names.
            </label>
            <textarea
              className="textarea"
              value={inputStr || ""}
              placeholder={placeholderText}
              onChange={(e) => dispatch(loadData(e.target.value))}
              rows={20}
              autoFocus={true}
              spellCheck="false"
              wrap="off"
            />
            {!inputStr && (
              <p className="pt-1">
                ({/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a
                  onClick={(e) => {
                    loadExample(dispatch);
                    e.preventDefault();
                  }}
                >
                  Click here to load sample data and message
                </a>
                )
              </p>
            )}
          </div>

          {/* data preview table */}
          <DataTable />
        </div>
      </div>
    </>
  );
}

// generate a html table displaying parsed data
function DataTable() {
  const { headers, rows } = useSelector(selectParsedData);
  const forbiddenHeaders = headers.filter((x) => RESERVED_KEYWORDS.includes(x));

  return (
    <>
      {/* return nothing if headers is empty */}
      {!!headers?.length && (
        <div className="py-3">
          <p className="label">Preview</p>

          {/* table */}
          <div className="table-container mb-2">
            <table className="table is-bordered is-hoverable">
              {/* header row */}
              <thead className="has-background-light">
                <tr>
                  {headers.map((item, index) => {
                    return <th key={index}>{item}</th>;
                  })}
                </tr>
              </thead>

              {/* data rows */}
              <tbody>
                {rows?.map((row, index) => {
                  return (
                    <tr key={index}>
                      {row.map((item, index) => {
                        return <td key={index}>{item}</td>;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* message count */}
          <p>Number of emails: {rows?.length || 0}</p>

          {/* errors */}
          {forbiddenHeaders.length > 0 && (
            <div className="pt-5">
              {forbiddenHeaders.map((h, index) => {
                return (
                  <div key={index} className="message is-danger">
                    <div className="message-body">
                      <span className="has-text-weight-bold">{h}</span> is a
                      special keyword. Please choose a different variable name.
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}

// load sample data and message
function loadExample(dispatch: AppDispatch) {
  dispatch(loadData(placeholderText));
  dispatch(setHeader({ header: "from", value: "Your Name <example@mit.edu>" }));
  dispatch(setHeader({ header: "to", value: `\${SPAM.email}` }));
  dispatch(
    setHeader({
      header: "subject",
      value: `Automated spam message for \${SPAM.name}`,
    })
  );
  dispatch(setMessageFormat(MessageFormat.MARKDOWN));
  dispatch(setRawBody(messageBodyPlaceholder));
}
