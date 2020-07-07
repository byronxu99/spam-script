import { Epic } from "redux-observable";
import { of, from, concat } from "rxjs";
import {
  map,
  filter,
  withLatestFrom,
  concatMap,
  takeUntil,
  catchError,
} from "rxjs/operators";
import {
  SendStatus,
  SendError,
  selectSendStatuses,
  selectMessage,
  setStatus,
  setError,
  sendMessages,
  cancelSending,
} from "./sendingSlice";
import { apiSendMessage, apiHandleResponse } from "../../utils/api";

/*
DOCUMENTATION FOR MESSAGE SENDING ACTIONS
sendMessages action:
  redux reducer:
    filter unsent/error messages
    set status to queued
  rxjs epic:
    create indices of messages to be sent
    map over message indices
      set status to sending
      do the API call to send messsage

cancelSending action:
  redux reducer:
    filter queued/sending messages
    set status to unsent
  rxjs epic:
    stop the stream
*/

export const sendingEpic: Epic = (action$, state$) =>
  action$.pipe(
    // only listen to actions of type sendMessages
    filter(sendMessages.match),

    // loop over each sendMessages action
    withLatestFrom(state$),
    concatMap(([action, state]) =>
      // create observable of message indices to be sent
      from(
        // create array of message indices to be sent
        selectSendStatuses(state)
          .map((status, index) => (status === SendStatus.QUEUED ? index : -1))
          .filter((index) => index !== -1)
      ).pipe(
        // loop over each index
        withLatestFrom(state$),
        concatMap(([index, state]) =>
          concat(
            // notify that the message is sending
            of(
              setStatus({
                index: index,
                status: SendStatus.SENDING,
              })
            ),

            // do the api call
            apiSendMessage(selectMessage(index)(state)).pipe(
              // convert the api response into the desired response action
              map((response) => apiHandleResponse(index, response)),

              // if there's an ajax error,
              // emit an observable containing the error handling action
              catchError((error: Error) =>
                of(
                  setError({
                    index: index,
                    error: {
                      name: error.name,
                      message: error.message,
                    } as SendError,
                  })
                )
              )
            )
          )
        ),

        // quit upon receiving a cancellation action
        takeUntil(action$.pipe(filter(cancelSending.match)))
      )
    )
  );
