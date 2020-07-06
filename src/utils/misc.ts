// whether we are running on scripts.mit.edu or 3rd party server
export const isMIT: boolean = window.location.hostname.includes("mit.edu");

// are we running in a dev environment?
export const isDevelopment: boolean =
  process?.env?.NODE_ENV && process.env.NODE_ENV === "development";
