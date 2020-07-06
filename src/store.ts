import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { Epic, createEpicMiddleware, combineEpics } from "redux-observable";
import { catchError } from "rxjs/operators";
import dataReducer from "./features/data/dataSlice";
import templateReducer from "./features/message/messageSlice";
import sendingReducer from "./features/sending/sendingSlice";
import { sendingEpic } from "./features/sending/sendingEpic";

// list of all redux-observable epics
const epics: Epic[] = [sendingEpic];

// create redux-observable epicMiddleware and root epic
const epicMiddleware = createEpicMiddleware();
const rootEpic: Epic = (action$, store$, dependencies) =>
  combineEpics(...epics)(action$, store$, dependencies).pipe(
    catchError((error, source) => {
      console.error(error);
      return source;
    })
  );

// create the redux store, add epic middleware, and run the rootEpic
function createStoreWithEpicMiddleware() {
  const store = configureStore({
    // root reducer will be the combination of these functions
    reducer: {
      data: dataReducer, // the array of data
      template: templateReducer, // the message template
      sending: sendingReducer, // per-message sending status
    },

    // add redux-observable epicMiddleware to default middleware
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(epicMiddleware),
  });

  epicMiddleware.run(rootEpic);
  return store;
}
export const store = createStoreWithEpicMiddleware();

// exported types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
