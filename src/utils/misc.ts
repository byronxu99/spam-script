// whether we are running on scripts.mit.edu or 3rd party server
export const isMIT: boolean = window.location.hostname.includes("mit.edu");

// are we running in a dev environment?
export const isDevelopment: boolean =
  process?.env?.NODE_ENV && process.env.NODE_ENV === "development";

// confirm exiting of the page
// https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload
let isExitConfirmationSet: boolean = false;
export function setExitConfirmation() {
  if (!isExitConfirmationSet && !isDevelopment) {
    window.addEventListener("beforeunload", function (e) {
      e.preventDefault();
      e.returnValue = "";
    });
    isExitConfirmationSet = true;
  }
}
export function clearExitConfirmation() {
  if (isExitConfirmationSet) {
    window.addEventListener("beforeunload", function (e) {
      delete e["returnValue"];
    });
    isExitConfirmationSet = false;
  }
}
