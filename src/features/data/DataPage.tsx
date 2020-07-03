import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { loadData, selectRawData, selectParsedData } from "./dataSlice";
import { MessageFormat } from "../../utils/messageTypes";
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
  return (
    <>
      {/* return nothing if headers is empty */}
      {!!headers?.length && (
        <div className="pt-3 pb-3">
          <p className="label pt-3">Preview</p>

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

          <p>Number of emails: {rows?.length || 0}</p>
        </div>
      )}
    </>
  );
}

// load sample data and message
// type of dispatch should actually be Dispatch from react-redux
function loadExample(dispatch: any) {
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
