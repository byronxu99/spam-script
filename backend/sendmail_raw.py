#!/usr/bin/env python3

"""
This script reads a raw RFC 2822 formatted email message from stdin
and sends it to an outgoing SMTP server.
"""

import sys
import email.parser
import email.utils
from email.errors import MessageError
from smtplib import SMTP
from common_utils import get_login, exit_with_success, exit_with_error
from common_utils import SMTP_HOST, USER_TRACKING_HEADER


def main():
    # get user login
    user_email = get_login()
    if not user_email:
        exit_with_error("Unauthorized")

    # read stdin and parse to message object
    input_bytes = sys.stdin.buffer.read()
    parser = email.parser.BytesParser()
    try:
        message = parser.parsebytes(input_bytes)
    except MessageError as e:
        exit_with_error(str(e))

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