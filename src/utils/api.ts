import { Observable, of } from "rxjs";
import { ajax } from "rxjs/ajax";
import { delay, tap, map } from "rxjs/operators";
import { Message } from "./messageTypes";
import { isMIT } from "./misc";
import {
  SendStatus,
  SendError,
  setStatus,
  setError,
} from "../features/sending/sendingSlice";

// url for the sending API
const API_URL = "./backend/sendmail.py";

// response from the message sending API on scripts.mit.edu
type ApiResponse = {
  // status should be "success" or "error"
  status: string;
  // optional string for an error message
  message?: string;
  // optional string for the command name, e.g. "sendmail.py"
  command?: string;
};

// real API call for sending a single message
function apiSendMessageReal(message: Message): Observable<ApiResponse> {
  return ajax({
    url: API_URL,
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
          message: "Did not receive valid response from API",
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

// API call for sending a single message
export function apiSendMessage(message: Message): Observable<ApiResponse> {
  if (isMIT) {
    return apiSendMessageReal(message);
  } else {
    return apiSendMessageFake(message);
  }
}

// convert the API response to the appropriate redux action
export function apiHandleResponse(index: number, response: ApiResponse) {
  if (response.status === "success") {
    // message has been sent successfully
    return setStatus({
      index: index,
      status: SendStatus.SUCCESS,
    });
  } else {
    // server encountered an error while sending the message
    const errorMessage = response.message || response.status;
    return setError({
      index: index,
      error: {
        name: `Server responded with ${response.status}`,
        message: errorMessage,
      } as SendError,
    });
  }
}
