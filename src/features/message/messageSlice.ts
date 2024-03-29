import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import {
  Message,
  MessageFormat,
  StandardHeaders,
  Attachment,
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
    setHost: (state: Message, action: PayloadAction<string>) => {
      state.host = action.payload;
    },
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
    setAttachmentNames: (state: Message, action: PayloadAction<string>) => {
      state.attachmentNames = action.payload;
    },
    addAttachments: (state: Message, action: PayloadAction<Attachment[]>) => {
      state.attachments.push(...action.payload);
    },
  },
});
export default messageSlice.reducer;

// exported actions
export const {
  setHost,
  setMessageFormat,
  setRawBody,
  setHeader,
  setAttachmentNames,
  addAttachments,
} = messageSlice.actions;

// selectors
export function selectHost(state: RootState) {
  return state.template.host;
}

export function selectMessageTemplate(state: RootState) {
  return state.template;
}

export function selectMessageFormat(state: RootState) {
  return state.template.bodyFormat;
}

export function selectRawBody(state: RootState) {
  return state.template.raw;
}

export function selectAttachmentNames(state: RootState) {
  return state.template.attachmentNames;
}

export function selectAttachments(state: RootState) {
  return state.template.attachments;
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
