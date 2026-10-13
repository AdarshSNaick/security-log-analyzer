from datetime import timedelta

from django.db.models import Count
from django.utils import timezone

from alerts.models import Alert
from detection.models import ThreatDetection
from incidents.models import Incident
from logs.models import LogEntry


def get_dashboard_stats():
    """
    Calculate dashboard statistics from real database records.
    """

    now = timezone.now()
    today = now.date()
    last_24_hours = now - timedelta(hours=24)

    # Basic statistics
    total_logs = LogEntry.objects.count()
    total_threats = ThreatDetection.objects.count()

    critical_alerts = Alert.objects.filter(
        severity="CRITICAL"
    ).count()

    high_alerts = Alert.objects.filter(
        severity="HIGH"
    ).count()

    today_events = LogEntry.objects.filter(
        timestamp__date=today
    ).count()

    # Distinct usernames represent active operators/users
    active_users = (
        LogEntry.objects
        .exclude(username__isnull=True)
        .exclude(username="")
        .values("username")
        .distinct()
        .count()
    )

    # Login statistics
    success_logins = LogEntry.objects.filter(
        event_type="LOGIN_SUCCESS"
    ).count()

    failed_logins = LogEntry.objects.filter(
        event_type="LOGIN_FAILED"
    ).count()

    # Threats grouped by severity
    severity_counts = dict(
        ThreatDetection.objects
        .values("severity")
        .annotate(total=Count("id"))
        .values_list("severity", "total")
    )

    threats_by_severity = [
        {
            "name": "Critical",
            "count": severity_counts.get("CRITICAL", 0),
            "color": "#ff3b5c",
        },
        {
            "name": "High",
            "count": severity_counts.get("HIGH", 0),
            "color": "#ff8c00",
        },
        {
            "name": "Medium",
            "count": severity_counts.get("MEDIUM", 0),
            "color": "#ffd166",
        },
        {
            "name": "Low",
            "count": severity_counts.get("LOW", 0),
            "color": "#00f2fe",
        },
    ]

    # Logs over the last 24 hours, grouped into 4-hour periods
    logs_over_time = []

    for hour in range(0, 24, 4):
        period_start = now - timedelta(hours=24 - hour)
        period_end = period_start + timedelta(hours=4)

        log_count = LogEntry.objects.filter(
            timestamp__gte=period_start,
            timestamp__lt=period_end,
        ).count()

        threat_count = ThreatDetection.objects.filter(
            detected_at__gte=period_start,
            detected_at__lt=period_end,
        ).count()

        logs_over_time.append(
            {
                "time": period_start.strftime("%H:%M"),
                "logs": log_count,
                "threats": threat_count,
            }
        )

    # Top IP addresses associated with detected threats
    top_ips = (
        ThreatDetection.objects
        .values("log_entry__source_ip")
        .annotate(total=Count("id"))
        .order_by("-total")[:5]
    )

    top_suspicious_ips = [
        {
            "ip": item["log_entry__source_ip"] or "Unknown",
            "count": item["total"],
        }
        for item in top_ips
    ]

    return {
        "totalLogs": total_logs,
        "threatsDetected": total_threats,
        "criticalAlerts": critical_alerts,
        "highSeverityAlerts": high_alerts,
        "todayEvents": today_events,
        "activeUsers": active_users,
        "successLogins": success_logins,
        "failedLogins": failed_logins,
        "threatsBySeverity": threats_by_severity,
        "logsOverTime": logs_over_time,
        "topSuspiciousIPs": top_suspicious_ips,

        # Additional useful statistics
        "totalAlerts": Alert.objects.count(),
        "openAlerts": Alert.objects.filter(
            status="OPEN"
        ).count(),
        "totalIncidents": Incident.objects.count(),
        "openIncidents": Incident.objects.filter(
            status="OPEN"
        ).count(),
    }