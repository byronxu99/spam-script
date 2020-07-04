import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../../app/store";
import { Message } from "../../utils/messageTypes";

enum SendStatus {
  UNSENT,
  QUEUED,
  SENDING,
  SUCCESS,
  ERROR,
}

type MessageSendObject = {
  index: number;
  message: Message;
  status: SendStatus;
};

type SendingState = MessageSendObject[];
const initialState: SendingState = [];

export const sendingSlice = createSlice({
  name: "sending",
  initialState,
  reducers: {},
});

// exported actions
export function loadMessagesToSend(): AppThunk {
  return (dispatch, getState) => {
    const state: RootState = getState();
  };
}
