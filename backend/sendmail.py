#!/usr/bin/env python3

"""
This script reads a JSON object describing an email message,
creates the message, and sends it to an outgoing SMTP server.

The JSON input format is loosely based on Nodemailer:
https://nodemailer.com/extras/mailcomposer/
See make_email_message.py for how it's implemented
"""

import sys
import json
import email.utils
from smtplib import SMTP
from common_utils import get_login, exit_with_success, exit_with_error
from common_utils import SMTP_HOST, USER_TRACKING_HEADER
from make_email_message import make_email_message


def main():
    # get user login
    user_email = get_login()
    if not user_email:
        exit_with_error("Unauthorized")

    # read json input from stdin
    try:
        request = json.load(sys.stdin)
    except json.JSONDecodeError as e:
        exit_with_error(str(e))

    # create email.message.Message object
    message = make_email_message(request)

    # add a header with the user's email
    message[USER_TRACKING_HEADER] = user_email

    # add date if missing
    if "Date" not in message:
        message["Date"] = email.utils.formatdate()

    if "--debug" in sys.argv:
        # print the email without sending
        print(message.as_string(maxheaderlen=78))
    else:
        # send the email
        with SMTP(SMTP_HOST) as smtp:
            smtp.send_message(message)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        exit_with_error(str(e))
    exit_with_success()