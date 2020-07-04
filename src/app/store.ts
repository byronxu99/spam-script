import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import dataReducer from "../features/data/dataSlice";
import templateReducer from "../features/message/messageSlice";

export const store = configureStore({
  reducer: {
    data: dataReducer, // the array of data
    template: templateReducer, // the message template
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
