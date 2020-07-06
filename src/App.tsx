import React, { useState } from "react";
import MainPage from "./features/MainPage";
import DataPage from "./features/data/DataPage";
import MessagePage from "./features/message/MessagePage";
import SendPage from "./features/sending/SendPage";
import { setExitConfirmation } from "./utils/misc";

enum UiState {
  MAIN_PAGE,
  DATA_PAGE,
  MESSAGE_PAGE,
  SEND_PAGE,
}
const initialUiState: UiState = UiState.MAIN_PAGE;

// the App itself is a simple router that returns the desired
// component depending on an internal state
export default function App() {
  // which component to show
  const [uiState, setUiState] = useState(initialUiState);

  // return the desired component
  switch (uiState) {
    case UiState.MAIN_PAGE:
      return (
        <MainPage
          nextPage={() => {
            // add the "are you sure you want to leave" notification
            setExitConfirmation();
            setUiState(UiState.DATA_PAGE);
          }}
        />
      );

    case UiState.DATA_PAGE:
      return (
        <DataPage
          prevPage={() => setUiState(UiState.MAIN_PAGE)}
          nextPage={() => setUiState(UiState.MESSAGE_PAGE)}
        />
      );

    case UiState.MESSAGE_PAGE:
      return (
        <MessagePage
          prevPage={() => setUiState(UiState.DATA_PAGE)}
          nextPage={() => setUiState(UiState.SEND_PAGE)}
        />
      );

    case UiState.SEND_PAGE:
      return <SendPage prevPage={() => setUiState(UiState.MESSAGE_PAGE)} />;
  }
}
