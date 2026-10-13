from datetime import timedelta

from django.utils import timezone

from logs.models import LogEntry
from detection.models import ThreatDetection
from alerts.models import Alert

from alerts.services.email_service import send_alert_email
from incidents.services.incident_service import create_incident_for_alert


def detect_brute_force(log_entry):
    """
    Detect brute-force login attempts.

    Rule:
    5 or more failed login attempts from the same IP
    within the last 60 seconds.
    """

    if log_entry.event_type != "LOGIN_FAILED":
        return None

    if not log_entry.source_ip:
        return None

    time_limit = log_entry.timestamp - timedelta(seconds=60)

    failed_attempts = LogEntry.objects.filter(
        source_ip=log_entry.source_ip,
        event_type="LOGIN_FAILED",
        timestamp__gte=time_limit,
        timestamp__lte=log_entry.timestamp,
    ).count()

    # Trigger detection after 5 failed attempts
    if failed_attempts < 5:
        return None

    # Avoid creating duplicate detections for the same attack window
    existing_detection = ThreatDetection.objects.filter(
        log_entry__source_ip=log_entry.source_ip,
        threat_type="BRUTE_FORCE",
        status__in=["OPEN", "INVESTIGATING"],
        log_entry__timestamp__gte=time_limit,
        log_entry__timestamp__lte=log_entry.timestamp,
    ).first()

    if existing_detection:
        return existing_detection

    detection = ThreatDetection.objects.create(
        log_entry=log_entry,
        threat_type="BRUTE_FORCE",
        severity="HIGH",
        description=(
            f"Possible brute-force attack detected from "
            f"{log_entry.source_ip}. "
            f"{failed_attempts} failed login attempts were "
            f"recorded within 60 seconds."
        ),
        status="OPEN",
    )

    alert = Alert.objects.create(
        detection=detection,
        title="Brute Force Attack Detected",
        message=(
            f"Multiple failed login attempts detected from "
            f"{log_entry.source_ip}."
        ),
        severity="HIGH",
        status="OPEN",
    )

    send_alert_email(alert)
    create_incident_for_alert(alert)

    return detection

def detect_sql_injection(log_entry):
    """
    Detect possible SQL injection attempts.

    Looks for common SQL injection patterns in the log message.
    """

    if log_entry.event_type != "SUSPICIOUS_REQUEST":
        return None

    message = log_entry.message.lower()

    sql_patterns = [
        "' or '",
        "' or 1=1",
        "union select",
        "union all select",
        "'--",
        "--",
        "drop table",
        "insert into",
        "delete from",
        "update set",
        "select * from",
    ]

    matched_pattern = None

    for pattern in sql_patterns:
        if pattern in message:
            matched_pattern = pattern
            break

    if not matched_pattern:
        return None

    # Avoid creating duplicate SQL injection detections
    # for the same source IP while an existing detection is open.
    existing_detection = ThreatDetection.objects.filter(
        log_entry__source_ip=log_entry.source_ip,
        threat_type="SQL_INJECTION",
        status__in=["OPEN", "INVESTIGATING"],
        log_entry__timestamp__gte=log_entry.timestamp - timedelta(seconds=60),
        log_entry__timestamp__lte=log_entry.timestamp,
    ).first()

    if existing_detection:
        return existing_detection

    detection = ThreatDetection.objects.create(
        log_entry=log_entry,
        threat_type="SQL_INJECTION",
        severity="CRITICAL",
        description=(
            f"Possible SQL injection attempt detected from "
            f"{log_entry.source_ip}. "
            f"Matched pattern: {matched_pattern}"
        ),
        status="OPEN",
    )

    alert = Alert.objects.create(
        detection=detection,
        title="SQL Injection Attempt Detected",
        message=(
            f"A possible SQL injection attempt was detected "
            f"from {log_entry.source_ip}."
        ),
        severity="CRITICAL",
        status="OPEN",
    )

    send_alert_email(alert)
    create_incident_for_alert(alert)

    return detection

def detect_suspicious_http(log_entry):
    """
    Detect suspicious HTTP requests to sensitive paths.
    """

    if log_entry.event_type != "SUSPICIOUS_REQUEST":
        return None

    message = log_entry.message.lower()

    suspicious_paths = [
        "/admin",
        "/admin/login",
        "/config",
        "/backup",
        "/.env",
        "/phpmyadmin",
    ]

    matched_path = None

    for path in suspicious_paths:
        if path in message:
            matched_path = path
            break

    if not matched_path:
        return None

    # Avoid duplicate detections from the same IP
    existing_detection = ThreatDetection.objects.filter(
        log_entry__source_ip=log_entry.source_ip,
        threat_type="UNAUTHORIZED_ACCESS",
        status__in=["OPEN", "INVESTIGATING"],
        log_entry__timestamp__gte=log_entry.timestamp - timedelta(seconds=60),
        log_entry__timestamp__lte=log_entry.timestamp,
    ).first()

    if existing_detection:
        return existing_detection

    detection = ThreatDetection.objects.create(
        log_entry=log_entry,
        threat_type="UNAUTHORIZED_ACCESS",
        severity="HIGH",
        description=(
            f"Suspicious HTTP access detected from "
            f"{log_entry.source_ip}. "
            f"Sensitive path accessed: {matched_path}"
        ),
        status="OPEN",
    )

    alert = Alert.objects.create(
        detection=detection,
        title="Suspicious HTTP Access Detected",
        message=(
            f"Suspicious access to {matched_path} was detected "
            f"from {log_entry.source_ip}."
        ),
        severity="HIGH",
        status="OPEN",
    )

    send_alert_email(alert)
    create_incident_for_alert(alert)

    return detection

def detect_port_scan(log_entry):
    """
    Detect possible port scanning activity.

    Rule:
    5 or more different ports attempted from the same IP.
    """

    if log_entry.event_type != "SUSPICIOUS_REQUEST":
        return None

    message = log_entry.message.lower()

    # Check whether the log contains a port number.
    import re

    port_match = re.search(r"\bport\s+(\d+)\b", message)

    if not port_match:
        return None

    port = port_match.group(1)

    # Find recent suspicious requests from the same IP.
    recent_entries = LogEntry.objects.filter(
        source_ip=log_entry.source_ip,
        event_type="SUSPICIOUS_REQUEST",
        timestamp__gte=log_entry.timestamp - timedelta(seconds=60),
        timestamp__lte=log_entry.timestamp,
    )

    ports = set()

    for entry in recent_entries:
        match = re.search(r"\bport\s+(\d+)\b", entry.message.lower())

        if match:
            ports.add(match.group(1))

    # Trigger after 5 different ports
    if len(ports) < 5:
        return None

    # Avoid duplicate port-scan detections
    existing_detection = ThreatDetection.objects.filter(
        log_entry__source_ip=log_entry.source_ip,
        threat_type="PORT_SCAN",
        status__in=["OPEN", "INVESTIGATING"],
        log_entry__timestamp__gte=log_entry.timestamp - timedelta(seconds=60),
        log_entry__timestamp__lte=log_entry.timestamp,
    ).first()

    if existing_detection:
        return existing_detection

    detection = ThreatDetection.objects.create(
        log_entry=log_entry,
        threat_type="PORT_SCAN",
        severity="HIGH",
        description=(
            f"Possible port scan detected from "
            f"{log_entry.source_ip}. "
            f"{len(ports)} different ports were accessed "
            f"within 60 seconds."
        ),
        status="OPEN",
    )

    alert = Alert.objects.create(
        detection=detection,
        title="Port Scan Detected",
        message=(
            f"Possible port scanning activity detected from "
            f"{log_entry.source_ip}."
        ),
        severity="HIGH",
        status="OPEN",
    )

    send_alert_email(alert)
    create_incident_for_alert(alert)

    return detection


def analyze_log_entry(log_entry):
    """
    Main detection engine.

    Runs all available detection rules.
    """

    detection = detect_brute_force(log_entry)

    if detection:
        return detection

    detection = detect_sql_injection(log_entry)

    if detection:
        return detection

    detection = detect_suspicious_http(log_entry)

    if detection:
        return detection

    detection = detect_port_scan(log_entry)

    if detection:
        return detection

    return None