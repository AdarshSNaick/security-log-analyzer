from incidents.models import Incident


def create_incident_for_alert(alert):
    """
    Create an incident for a HIGH or CRITICAL alert.
    """

    if alert.severity not in ["HIGH", "CRITICAL"]:
        return None

    detection = alert.detection

    if not detection:
        return None

    log_entry = detection.log_entry

    # Check whether this alert is already part of an incident.
    existing_incident = Incident.objects.filter(
        alerts=alert
    ).first()

    if existing_incident:
        return existing_incident

    incident = Incident.objects.create(
        title=alert.title,
        description=(
            f"Security incident created from alert: "
            f"{alert.title}. {alert.message}"
        ),
        severity=alert.severity,
        status="OPEN",
        source_ip=log_entry.source_ip,
        affected_asset="Security Log Analyzer Host",
        detected_at=detection.detected_at,
    )

    incident.alerts.add(alert)

    return incident