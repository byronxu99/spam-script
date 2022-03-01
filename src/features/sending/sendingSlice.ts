import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../../store";
import { Message } from "../../utils/messageTypes";
import { selectMessageTemplate } from "../message/messageSlice";
import { selectParsedData } from "../data/dataSlice";
import {
  makeSpamObjectArray,
  makeMessageTemplater,
} from "../../utils/templating";

export enum SendStatus {
  UNSENT,
  QUEUED,
  SENDING,
  SUCCESS,
  ERROR,
}

export type MessageSendObject = {
  message: Message;
  status: SendStatus;
  showPreview: boolean;
  error?: SendError;
};

export type SendError = {
  name: string;
  message: string;
};

// what goes into the redux store
type SendingState = MessageSendObject[];
const initialState: SendingState = [];

// create the slice
export const sendingSlice = createSlice({
  name: "sending",
  initialState,
  reducers: {
    setSendingState: (
      state: SendingState,
      action: PayloadAction<SendingState>
    ) => {
      // we want to do state = action.payload
      // except we must modify state in place
      state.length = 0;
      state.push(...action.payload);
    },

    setMessage: (
      state: SendingState,
      action: PayloadAction<{ index: number; message: Message }>
    ) => {
      if (state[action.payload.index]) {
        state[action.payload.index].message = action.payload.message;
      }
    },

    setStatus: (
      state: SendingState,
      action: PayloadAction<{ index: number; status: SendStatus }>
    ) => {
      if (state[action.payload.index]) {
        state[action.payload.index].status = action.payload.status;
        // if status is success, clear any errors
        if (action.payload.status === SendStatus.SUCCESS) {
          state[action.payload.index].error = undefined;
        }
      }
    },

    setError: (
      state: SendingState,
      action: PayloadAction<{ index: number; error: SendError }>
    ) => {
      if (state[action.payload.index]) {
        state[action.payload.index].status = SendStatus.ERROR;
        state[action.payload.index].error = action.payload.error;
      }
    },

    setShowPreview: (
      state: SendingState,
      action: PayloadAction<{ index?: number; showPreview: boolean }>
    ) => {
      if (action.payload.index === undefined) {
        // index unspecified, set value for all objects
        state.forEach((x) => (x.showPreview = action.payload.showPreview));
      } else {
        // index specified, only modify the given index
        if (state[action.payload.index]) {
          state[action.payload.index].showPreview = action.payload.showPreview;
        }
      }
    },

    sendMessages: (state: SendingState) => {
      // find indices of all sendable messages
      const sendIndices = state
        .map((x) => x.status)
        .map((status, index) => (shouldSendMessage(status) ? index : -1))
        .filter((index) => index !== -1);

      // set state to queued
      sendIndices.forEach((index) => (state[index].status = SendStatus.QUEUED));

      // actual sending is done in sendingEpic
    },

    cancelSending: (state: SendingState) => {
      // find indices of all messages awaiting sending
      const queuedIndices = state
        .map((x) => x.status)
        .map((status, index) =>
          status === SendStatus.QUEUED || status === SendStatus.SENDING
            ? index
            : -1
        )
        .filter((index) => index !== -1);

      // set state to unsent
      queuedIndices.forEach(
        (index) => (state[index].status = SendStatus.UNSENT)
      );

      // sendingEpic will cancel ongoing processes
    },
  },
});
export default sendingSlice.reducer;

// exported actions
export const {
  setSendingState,
  setMessage,
  setStatus,
  setError,
  setShowPreview,
  sendMessages,
  cancelSending,
} = sendingSlice.actions;

// create MessageSendObject array from data in redux store
export function loadMessagesToSend(): AppThunk {
  return (dispatch, getState) => {
    // get data from redux store
    const state: RootState = getState();
    const template = selectMessageTemplate(state);
    const data = selectParsedData(state);

    // convert data into spam objects and templating function
    const templater = makeMessageTemplater(template);
    const spams = makeSpamObjectArray(data);

    // create message sending objects
    const messages = spams.map(templater);
    const sendObjects: SendingState = messages.map((m) => {
      return {
        message: m,
        status: SendStatus.UNSENT,
        showPreview: false,
      };
    });

    // put result into redux store
    dispatch(setSendingState(sendObjects));
  };
}

// selectors
export function selectMessageHost(state: RootState) {
  return state.sending[0]?.message?.host;
}

export function selectSendStatuses(state: RootState): SendStatus[] {
  return state.sending.map((x) => x.status);
}

export function selectSendObject(index: number) {
  return function (state: RootState): MessageSendObject {
    return state.sending[index];
  };
}

export function selectMessage(index: number) {
  return function (state: RootState): Message {
    return state.sending[index].message;
  };
}

// test if a message should be sent
export function shouldSendMessage(status: SendStatus) {
  return status === SendStatus.UNSENT || status === SendStatus.ERROR;
}
