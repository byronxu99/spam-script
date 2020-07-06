import { Epic } from "redux-observable";
import { Observable, of, from, concat } from "rxjs";
import { ajax } from "rxjs/ajax";
import {
  map,
  filter,
  withLatestFrom,
  concatMap,
  takeUntil,
  delay,
  tap,
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
import { Message } from "../../utils/messageTypes";
import { isMIT } from "../../utils/misc";

// response from the message sending API on scripts.mit.edu
type ApiResponse = {
  status: string;
  message?: string;
  command?: string;
};

// API call for sending a single message
function apiSendMessage(message: Message): Observable<ApiResponse> {
  if (isMIT) {
    return apiSendMessageReal(message);
  } else {
    return apiSendMessageFake(message);
  }
}

// real API call for sending a single message
function apiSendMessageReal(message: Message): Observable<ApiResponse> {
  return ajax({
    url: "./backend/sendmail.py",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: message,
    withCredentials: true,
  }).pipe(
    // extract the response object inside the AjaxResponse
    map((ajaxResponse) => {
      if (!ajaxResponse.response.status) {
        return {
          status: "error",
          message: `Did not receive valid response from API (server responded with status: ${ajaxResponse.response.status})`,
        };
      }
      return ajaxResponse.response as ApiResponse;
    })
  );
}

// simulated API call for sending a single message
function apiSendMessageFake(message: Message): Observable<ApiResponse> {
  const isError = Math.random() < 0.5;
  const delayTime = 1000;
  const recipients: string = [message.to, message.cc, message.bcc]
    .filter((x) => x?.trim())
    .join(", ");

  return of({
    status: isError ? "error" : "success",
    message: isError
      ? "This is a fake error that occurs with 50% probability"
      : "",
  }).pipe(
    delay(delayTime),
    tap(() => {
      if (isError) {
        console.log(`Fake API: encountered a fake error`);
      } else {
        console.log(`Fake API: sent message to ${recipients}`);
      }
    })
  );
}

// convert the API response to the appropriate action
function apiHandleResponse(index: number, response: ApiResponse) {
  if (response.status === "success") {
    // message has been sent successfully
    return setStatus({
      index: index,
      status: SendStatus.SUCCESS,
    });
  } else {
    // server encountered an error while sending the message
    return setError({
      index: index,
      error: {
        name: "ServerError",
        message: response.message || "",
      } as SendError,
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
    map over message indices
      set status to sending
      do the API call to send messsage

cancel
  redux reducer:
    filter queued/sending messages
    set status to unsent
  rxjs epic:
    stop the stream
*/

export const sendingEpic: Epic = (action$, state$) =>
  action$.pipe(
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
        // send the message
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
