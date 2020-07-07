# Spam Script
Bulk email sender/mail merge app using scripts.mit.edu

## Links
* **Live demo on Github Pages: https://byronxu99.github.io/spam-script/**
  * Demo only. It doesn't actually send emails.
* Use it for real: https://esp.scripts.mit.edu:444/spam-script/
  * MIT certificate authentication required
* Old spam script: https://github.com/wnavarre/email-dictator

## About
### Frontend
Made with Typescript and React.
* CSV parsing with [PapaParse](https://www.papaparse.com/)
* Templating with Javascript template literals (no fancy libraries here)
* Markdown parsing with [Marked](https://github.com/markedjs/marked)
* HTML sanitization with [DOMPurify](https://github.com/cure53/DOMPurify)
* HTML to plain text conversion with [html-to-text](https://github.com/werk85/node-html-to-text)
* Async email sending with [RxJS](https://github.com/ReactiveX/rxjs) and [redux-observable](https://github.com/redux-observable/redux-observable)

### Backend
The backend (files in [public/backend/](https://github.com/byronxu99/spam-script/tree/master/public/backend)) consists of a few Python scripts running on [scripts.mit.edu](https://scripts.mit.edu/web/).

* `sendmail.py` implementes a stateless JSON API. It takes in a JSON object describing an email message, generates the message, and attempts to send it.
* `sendmail_raw.py` (not currently used) takes in a raw RFC 2822 formatted message and attempts to send it.

These scripts send messages "as-is" without further modification. All of the actual templating and formatting take place on the frontend.

### Deployment on scripts.mit.edu
SSH into Athena and go to your `web_scripts/` directory. Clone this repository, `cd` into it, and run `git checkout gh-pages`.

To update, simply run `git pull` to pull the latest version from Github.

Make sure that the backend scripts are marked as executable, or else the scripts.mit.edu server will return an error when sending emails!

# Development
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), using the [Redux](https://redux.js.org/) and [Redux Toolkit](https://redux-toolkit.js.org/) template.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run deploy`
Deploys the build to the `gh-pages` branch.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
