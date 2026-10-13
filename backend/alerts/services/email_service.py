import logging

from django.conf import settings
from django.core.mail import send_mail


logger = logging.getLogger(__name__)


def send_alert_email(alert):
    """
    Send email notifications for HIGH or CRITICAL security alerts.

    Returns:
        True: Email was successfully submitted.
        False: Email was not sent or an error occurred.
    """

    # Send emails only for HIGH and CRITICAL alerts.
    if alert.severity not in ["HIGH", "CRITICAL"]:
        return False

    # Check whether an alert recipient is configured.
    recipient = getattr(
        settings,
        "SECURITY_ALERT_EMAIL",
        None,
    )

    if not recipient:
        logger.warning(
            "Security alert email not sent. "
            "SECURITY_ALERT_EMAIL is not configured."
        )
        return False

    subject = f"[Security Alert] {alert.title}"

    message = (
        "Security Alert\n"
        "====================\n\n"
        f"Title: {alert.title}\n"
        f"Severity: {alert.severity}\n"
        f"Status: {alert.status}\n"
        f"Message: {alert.message}\n\n"
        "Please investigate this security event."
    )

    try:
        result = send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient],
            fail_silently=False,
        )

    except Exception:
        # Log the error without stopping threat detection.
        logger.exception(
            "Failed to send email for alert ID %s.",
            alert.id,
        )

        return False

    # Django's send_mail() returns 1 when the email
    # is successfully submitted and 0 when it is not.
    if result == 1:
        alert.email_sent = True
        alert.save(update_fields=["email_sent"])

        logger.info(
            "Security alert email submitted successfully "
            "for alert ID %s.",
            alert.id,
        )

        return True

    logger.warning(
        "Security alert email was not submitted "
        "for alert ID %s.",
        alert.id,
    )

    return False