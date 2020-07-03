import mimetypes
import email.message
from email.mime.base import MIMEBase
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

"""
https://stackoverflow.com/questions/40389103/create-html-mail-with-inline-image-and-pdf-attachment?noredirect=1&lq=1
+-------------------------------------------------------+
| multipart/mixed                                       |
|                                                       |
|  +-------------------------------------------------+  |
|  |   multipart/related                             |  |
|  |                                                 |  |
|  |  +-------------------------------------------+  |  |
|  |  | multipart/alternative                     |  |  |
|  |  |                                           |  |  |
|  |  |  +-------------------------------------+  |  |  |
|  |  |  | text can contain [cid:logo.png]     |  |  |  |
|  |  |  +-------------------------------------+  |  |  |
|  |  |                                           |  |  |
|  |  |  +-------------------------------------+  |  |  |
|  |  |  | html can contain src="cid:logo.png" |  |  |  |
|  |  |  +-------------------------------------+  |  |  |
|  |  |                                           |  |  |
|  |  +-------------------------------------------+  |  |
|  |                                                 |  |
|  |  +-------------------------------------------+  |  |
|  |  | image logo.png  "inline" attachment       |  |  |
|  |  +-------------------------------------------+  |  |
|  |                                                 |  |
|  +-------------------------------------------------+  |
|                                                       |
|  +-------------------------------------------------+  |
|  | pdf ("download" attachment, not inline)         |  |
|  +-------------------------------------------------+  |
|                                                       |
+-------------------------------------------------------+
"""

def make_email_message(request):
    # create an email message from a JSON-style API request
    attachments = request.get("attachments", [])
    (attach_inline, attach_download) = split_attachments(attachments)
    
    # just the two text parts
    text = request.get("text", "")
    html = request.get("html", "")
    multipart_alternative = make_text_alternatives(text, html)

    # text plus inline images
    multipart_related = make_multipart("related", multipart_alternative, attach_inline)

    # this is the top level message
    message = make_multipart("mixed", multipart_related, attach_download)

    # add header fields to the message object
    add_header(message, "From", request.get("from", None))
    add_header(message, "Sender", request.get("sender", None))
    add_header(message, "To", request.get("to", None))
    add_header(message, "Cc", request.get("cc", None))
    add_header(message, "Bcc", request.get("bcc", None))
    add_header(message, "Reply-To", request.get("replyTo", None))
    add_header(message, "In-Reply-To", request.get("inReplyTo", None))
    add_header(message, "References", request.get("references", None), " ")
    add_header(message, "Subject", request.get("subject", None))
    add_header(message, "Message-ID", request.get("messageId", None))
    add_header(message, "Date", request.get("date", None))

    custom_headers = request.get("headers", {})
    add_header_dict(message, custom_headers)

    return message


def add_header(message, header_name, data, list_sep=", "):
    if not data:
        return
    if type(data) is list or type(data) is tuple:
        data = list_sep.join(data)
    message.add_header(header_name, data)


def add_header_dict(message, headers):
    if type(headers) is not dict:
        return
    for (key, val) in headers.items():
        add_header(message, key, val)
    

def make_multipart(subtype, part, attachments=[]):
    # create a multipart object from a main part and list of attachment objects
    if not attachments:
        return part
    
    multipart = MIMEMultipart(subtype)
    multipart.attach(part)

    for attachment in attachments:
        # get the content type, defaulting to binary stream
        filename = attachment.get("filename", "file")
        content_type = attachment.get("contentType", None)
        if not content_type:
            (guess, _) = mimetypes.guess_type(filename, strict=False)
            content_type = guess if guess else "application/octet-stream"

        # get content id and disposition
        cid = attachment.get("cid", None)
        content_disposition = attachment.get(
            "contentDisposition",
            "inline" if cid else "attachment",
        )
        if cid:
            # add angle brackets
            cid = "<" + cid + ">"

        # create object with the computed content type
        (content_maintype, content_subtype) = content_type.split("/", 1)
        content_transfer_encoding = attachment.get(
            "contentTransferEncoding",
            "base64" if content_maintype != "text" else None
        )
        mime_obj = MIMEBase(content_maintype, content_subtype)
        mime_obj.add_header("Content-Disposition", content_disposition, filename=filename)
        add_header(mime_obj, "Content-Transfer-Encoding", content_transfer_encoding)
        add_header(mime_obj, "Content-ID", cid)

        # add custom headers
        custom_headers = attachment.get("headers", {})
        add_header_dict(mime_obj, custom_headers)

        # add attachment body
        payload = attachment.get("content", "")
        charset = "utf-8" if content_maintype == "text" else None
        mime_obj.set_payload(payload, charset=charset)

        # attach to multipart object
        multipart.attach(mime_obj)

    return multipart


def make_text_alternatives(plain, html):
    # when both text formats given, return a multipart/alternative object
    mime_plain = MIMEText(plain, "plain")
    mime_html = MIMEText(html, "html")

    if not html:
        return mime_plain
    if not plain:
        return mime_html

    multipart = MIMEMultipart("alternative")
    multipart.attach(mime_plain)
    multipart.attach(mime_html)
    return multipart


def split_attachments(attachments=[]):
    # split the list of all attachments into a tuple of (inline, download)
    attach_inline = []
    attach_download = []

    for attachment in attachments:
        # if contentDisposition is given, use it
        # otherwise default to "inline" if and only if cid is given
        cid = attachment.get("cid", None)
        content_disposition = attachment.get(
            "contentDisposition",
            "inline" if cid else "attachment",
        )

        if content_disposition == "inline":
            attach_inline.append(attachment)
        else:
            attach_download.append(attachment)

    return (attach_inline, attach_download)