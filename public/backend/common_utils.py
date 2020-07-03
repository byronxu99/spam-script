import os
import sys
import json


# SMTP server to send outgoing messages
SMTP_HOST = "localhost"

# Custom email header with user login info
USER_TRACKING_HEADER = "X-Scripts-SSL-Client-Email"


def get_login():
    """
    The SSL_CLIENT_S_DN_Email environment variable is populated
    by the cgi server with information from the user's MIT certificate:
    https://scripts.mit.edu/faq/15/can-i-authenticate-clients-using-mit-certificates

    Manually set this value when testing scripts locally:
        $ SSL_CLIENT_S_DN_Email=test@mit.edu ./sendmail.py --debug < tests/message1.json
    """
    # if logged in with certificates, return the user's MIT email
    return os.environ.get("SSL_CLIENT_S_DN_Email", False)


def exit_cgi(message="", status=""):
    """
    To give the client a valid response and avoid an Internal Server Error,
    the script must always give the cgi server a clean exit regardless
    of any errors encountered.

    The response consists of headers, a blank line, and the actual content.
    https://docs.python.org/3/library/cgi.html
    For this script, all communication is done through JSON objects.
    """
    # print the http header and mandatory blank line
    print("Content-Type: application/json")
    print()

    # return the response
    response = {
        "command": os.path.basename(sys.argv[0]),
        "status": status,
        "message": message,
    }
    print(json.dumps(response))
    sys.exit(0)


def exit_with_error(message=""):
    exit_cgi(message=message, status="error")


def exit_with_success(message=""):
    exit_cgi(message=message, status="success")