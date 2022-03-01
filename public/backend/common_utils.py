import os
import sys
import json
import smtplib


# SMTP server to send outgoing messages
SMTP_HOST = "outgoing.mit.edu"

# Custom email header with user login info
USER_TRACKING_HEADER = "X-Scripts-SSL-Client-Email"

# Custom email header with scripts.mit.edu server hostname
SCRIPTS_HOSTNAME_HEADER = "X-Scripts-Hostname"


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


def send_email(message, host=SMTP_HOST):
    """
    This is the function called to send an email. It takes in an
    email.message.Message object.

    If authentication information can be found in the file "authentication.py",
    we use SMTP_SSL and send authenticated messages. Otherwise, we use SMTP
    and send unauthenticated messages, which outgoing.mit.edu rate-limits to
    1000 per day: http://kb.mit.edu/confluence/pages/viewpage.action?pageId=155282952

    When this limit is exceeded, you get a strange "Bobo with your canned meat"
    error message: http://kb.mit.edu/confluence/pages/viewpage.action?pageId=151093401
    """
    try:
        from authentication import SMTP_USERNAMES, SMTP_PASSWORDS
        username = SMTP_USERNAMES[host]
        password = SMTP_PASSWORDS[host]
    except:
        # no authentication.py file
        # send unauthenticated email
        with smtplib.SMTP(host) as smtp:
            smtp.send_message(message)
    else:
        # username/password successfully imported
        # send authenticated email
        with smtplib.SMTP_SSL(host) as smtp:
            smtp.login(username, password)
            smtp.send_message(message)
