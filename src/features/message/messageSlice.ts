import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import {
  Message,
  MessageFormat,
  StandardHeaders,
} from "../../utils/messageTypes";

// what goes into the redux store
const initialState: Message = {
  bodyFormat: MessageFormat.MARKDOWN,
  attachments: [],
};

// create the slice
export const messageSlice = createSlice({
  name: "template",
  initialState,
  reducers: {
    setMessageFormat: (
      state: Message,
      action: PayloadAction<MessageFormat>
    ) => {
      state.bodyFormat = action.payload;
    },
    setRawBody: (state: Message, action: PayloadAction<string>) => {
      state.raw = action.payload;
    },
    setHeader: (
      state: Message,
      action: PayloadAction<{ header: StandardHeaders; value: string }>
    ) => {
      state[action.payload.header] = action.payload.value;
    },
  },
});
export default messageSlice.reducer;

// exported actions
export const { setMessageFormat, setRawBody, setHeader } = messageSlice.actions;

// selectors
export function selectMessageTemplate(state: RootState) {
  return state.template;
}

export function selectMessageFormat(state: RootState) {
  return state.template.bodyFormat;
}

export function selectRawBody(state: RootState) {
  return state.template.raw;
}

export function selectHeader(field: StandardHeaders) {
  return function (state: RootState) {
    return state.template[field];
  };
}

export function selectCustomHeader(field: string) {
  return function (state: RootState) {
    return state.template.headers ? state.template.headers[field] : undefined;
  };
}
