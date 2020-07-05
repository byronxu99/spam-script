import { Epic, combineEpics } from "redux-observable";
import { Observable, of, from } from "rxjs";
import { ajax, AjaxRequest, AjaxResponse } from "rxjs/ajax";
import {
  map,
  filter,
  withLatestFrom,
  concatMap,
  race,
  take,
  delay,
  catchError,
} from "rxjs/operators";
import {
  SendStatus,
  selectSendStatuses,
  selectMessage,
  shouldSendMessage,
  setStatus,
  setError,
  sendOneMessage,
  sendAllMessages,
  cancelSending,
} from "./sendingSlice";
import { Message } from "../../utils/messageTypes";

// API call for sending a single message
function apiSendMessage(message: Message): Observable<AjaxResponse> {
  // whether we are viewing on scripts.mit.edu or 3rd party server
  const isMIT = window.location.hostname.includes("mit.edu");

  if (isMIT) {
    return apiSendMessageReal(message);
  } else {
    return apiSendMessageFake(message);
  }
}

// real API call for sending a single message
function apiSendMessageReal(message: Message): Observable<AjaxResponse> {
  return ajax({
    url: "./backend/sendmail.py",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: message,
    withCredentials: true,
  });
}

// fake API call for sending a single message
function apiSendMessageFake(message: Message): Observable<AjaxResponse> {
  const ajaxResponse = new AjaxResponse(
    new Event("Fake API Event"),
    new XMLHttpRequest(),
    {} as AjaxRequest
  );
  const isError = Math.random() < 0.5;
  const delayTime = 2000;

  ajaxResponse.response = {
    status: isError ? "error" : "success",
    message: isError ? "This is a fake error" : "",
  };

  return of(ajaxResponse).pipe(delay(delayTime));
}

// convert the API response to the appropriate action
function apiHandleResponse(index: number, ajaxResponse: AjaxResponse) {
  if (ajaxResponse.response.status === "success") {
    return setStatus({
      index: index,
      status: SendStatus.SUCCESS,
    });
  } else {
    const error = Error(ajaxResponse.response.message);
    error.name = "ServerError";
    return setError({
      index: index,
      error: error,
    });
  }
}

/*
DOCUMENTATION FOR MESSAGE SENDING ACTIONS
send all messages
  redux reducer:
    filter unsent/error messages
    set status to queued
  rxjs epic:
    create indices of messages to be sent
    emit stream of send one actions

send one message
  redux reducer:
    set status to sending
  rxjs epic:
    do ajax request
      on success: emit setStatus to success action
      on error: emit setError action

cancel
  redux reducer:
    filter queued messages
    set status to unsent
*/

// redux-observable rxjs epic for sending one message
const sendOneMessageEpic: Epic = (action$, state$) =>
  action$.pipe(
    filter(sendOneMessage.match),
    withLatestFrom(state$),
    concatMap(([action, state]) =>
      race(
        // select the message where index = action.payload
        // then send the message
        apiSendMessage(selectMessage(action.payload)(state)).pipe(
          map((ajaxResponse) =>
            // convert the api response into the desired action
            apiHandleResponse(action.payload, ajaxResponse)
          ),
          // if there's an ajax error
          catchError((error) =>
            // emit an observable containing the error handling action
            of(
              setError({
                index: action.payload,
                error: error,
              })
            )
          )
        ),

        // quit upon receiving a cancellation action
        action$.pipe(filter(cancelSending.match), take(1))
      )
    )
  );

// redux-observable rxjs epic for sending all messages
const sendAllMessagesEpic: Epic = (action$, state$) =>
  action$.pipe(
    filter(sendAllMessages.match),
    withLatestFrom(state$),
    concatMap(([action, state]) =>
      race(
        // create observable of message indices to be sent
        from(
          // create array of message indices to be sent
          selectSendStatuses(state)
            .map((status, index) => (shouldSendMessage(status) ? index : -1))
            .filter((index) => index !== -1)
        ).pipe(
          // convert each index to an action
          map((index) => sendOneMessage(index))
        ),

        // quit upon receiving a cancellation action
        action$.pipe(filter(cancelSending.match), take(1))
      )
    )
  );

export const sendingEpic = combineEpics(
  sendOneMessageEpic,
  sendAllMessagesEpic
);
