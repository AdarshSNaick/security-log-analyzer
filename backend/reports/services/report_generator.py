import os
from io import BytesIO
from datetime import timedelta

import pandas as pd
import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt

from django.core.files.base import ContentFile
from django.utils import timezone

from logs.models import LogEntry
from detection.models import ThreatDetection
from alerts.models import Alert
from incidents.models import Incident


def get_date_limit(date_range):
    now = timezone.now()

    if date_range == "Last 24 Hours":
        return now - timedelta(hours=24)

    if date_range == "Last 7 Days":
        return now - timedelta(days=7)

    if date_range == "Current Quarter":
        quarter = (now.month - 1) // 3
        first_month = quarter * 3 + 1
        return now.replace(
            month=first_month,
            day=1,
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
        )

    # Default: Last 30 Days
    return now - timedelta(days=30)


def build_report_data(date_range):
    date_limit = get_date_limit(date_range)

    logs = LogEntry.objects.filter(
        timestamp__gte=date_limit
    ).select_related("log_file")

    detections = ThreatDetection.objects.filter(
        detected_at__gte=date_limit
    ).select_related("log_entry")

    alerts = Alert.objects.filter(
        created_at__gte=date_limit
    )

    incidents = Incident.objects.filter(
        detected_at__gte=date_limit
    )

    # Convert logs into a Pandas DataFrame
    log_rows = list(
        logs.values(
            "timestamp",
            "source_ip",
            "username",
            "event_type",
            "status",
            "message",
        )
    )

    if log_rows:
        df_logs = pd.DataFrame(log_rows)
    else:
        df_logs = pd.DataFrame(
            columns=[
                "timestamp",
                "source_ip",
                "username",
                "event_type",
                "status",
                "message",
            ]
        )

    # Detection analysis
    detection_rows = list(
        detections.values(
            "threat_type",
            "severity",
            "status",
            "detected_at",
            "log_entry__source_ip",
        )
    )

    if detection_rows:
        df_detections = pd.DataFrame(detection_rows)
    else:
        df_detections = pd.DataFrame(
            columns=[
                "threat_type",
                "severity",
                "status",
                "detected_at",
                "log_entry__source_ip",
            ]
        )

    severity_counts = {}

    if not df_detections.empty:
        severity_counts = (
            df_detections["severity"]
            .value_counts()
            .to_dict()
        )

    threat_type_counts = {}

    if not df_detections.empty:
        threat_type_counts = (
            df_detections["threat_type"]
            .value_counts()
            .to_dict()
        )

    suspicious_ips = {}

    if not df_detections.empty:
        suspicious_ips = (
            df_detections["log_entry__source_ip"]
            .value_counts()
            .head(10)
            .to_dict()
        )

    successful_logins = 0
    failed_logins = 0

    if not df_logs.empty:
        successful_logins = int(
            (
                (df_logs["event_type"] == "LOGIN_SUCCESS")
            ).sum()
        )

        failed_logins = int(
            (
                (df_logs["event_type"] == "LOGIN_FAILED")
            ).sum()
        )

    return {
        "date_range": date_range,
        "date_limit": date_limit,
        "logs": logs,
        "detections": detections,
        "alerts": alerts,
        "incidents": incidents,
        "df_logs": df_logs,
        "df_detections": df_detections,
        "severity_counts": severity_counts,
        "threat_type_counts": threat_type_counts,
        "suspicious_ips": suspicious_ips,
        "successful_logins": successful_logins,
        "failed_logins": failed_logins,
    }


def create_matplotlib_chart(report_data):
    severity_counts = report_data["severity_counts"]

    severities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    values = [
        severity_counts.get(severity, 0)
        for severity in severities
    ]

    fig, ax = plt.subplots(figsize=(7, 4))

    ax.bar(severities, values)

    ax.set_title("Threats by Severity")
    ax.set_xlabel("Severity")
    ax.set_ylabel("Number of Threats")

    fig.tight_layout()

    buffer = BytesIO()
    fig.savefig(buffer, format="png", dpi=150)
    plt.close(fig)

    buffer.seek(0)

    return buffer


def generate_csv(report_data):
    df_logs = report_data["df_logs"]

    buffer = BytesIO()

    csv_data = df_logs.to_csv(index=False)

    buffer.write(csv_data.encode("utf-8"))
    buffer.seek(0)

    return buffer


def generate_pdf(report_data, report_title):
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib.units import inch
    from reportlab.platypus import (
        SimpleDocTemplate,
        Paragraph,
        Spacer,
        Table,
        TableStyle,
        Image,
    )

    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()

    story = []

    story.append(
        Paragraph(
            "Security Log Analyzer",
            styles["Title"],
        )
    )

    story.append(
        Paragraph(
            report_title,
            styles["Heading1"],
        )
    )

    story.append(
        Paragraph(
            f"Audit Window: {report_data['date_range']}",
            styles["Normal"],
        )
    )

    story.append(Spacer(1, 15))

    # Summary
    total_logs = len(report_data["logs"])
    total_threats = len(report_data["detections"])
    total_alerts = len(report_data["alerts"])
    total_incidents = len(report_data["incidents"])

    summary_data = [
        ["Metric", "Value"],
        ["Total Log Events", str(total_logs)],
        ["Threats Detected", str(total_threats)],
        ["Alerts Generated", str(total_alerts)],
        ["Security Incidents", str(total_incidents)],
        [
            "Successful Logins",
            str(report_data["successful_logins"]),
        ],
        [
            "Failed Logins",
            str(report_data["failed_logins"]),
        ],
    ]

    table = Table(
        summary_data,
        colWidths=[3.5 * inch, 1.5 * inch],
    )

    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#20252b")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("PADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )

    story.append(table)

    story.append(Spacer(1, 20))

    # Severity section
    story.append(
        Paragraph(
            "Threat Severity Analysis",
            styles["Heading2"],
        )
    )

    severity_data = [["Severity", "Count"]]

    for severity in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]:
        severity_data.append(
            [
                severity,
                str(
                    report_data["severity_counts"].get(
                        severity,
                        0,
                    )
                ),
            ]
        )

    severity_table = Table(
        severity_data,
        colWidths=[3.5 * inch, 1.5 * inch],
    )

    severity_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#20252b")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("PADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )

    story.append(severity_table)

    story.append(Spacer(1, 20))

    # Matplotlib chart
    chart = create_matplotlib_chart(report_data)

    image = Image(chart, width=6.5 * inch, height=3.7 * inch)

    story.append(image)

    story.append(Spacer(1, 15))

    # Threat types
    story.append(
        Paragraph(
            "Detected Threat Types",
            styles["Heading2"],
        )
    )

    threat_data = [["Threat Type", "Count"]]

    for threat_type, count in report_data[
        "threat_type_counts"
    ].items():
        threat_data.append(
            [str(threat_type), str(count)]
        )

    if len(threat_data) == 1:
        threat_data.append(["No threats detected", "0"])

    threat_table = Table(
        threat_data,
        colWidths=[3.5 * inch, 1.5 * inch],
    )

    threat_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#20252b")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("PADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )

    story.append(threat_table)

    story.append(Spacer(1, 20))

    story.append(
        Paragraph(
            "Security Assessment",
            styles["Heading2"],
        )
    )

    assessment = (
        f"The Security Log Analyzer processed "
        f"{total_logs} log events during the selected audit "
        f"period and identified {total_threats} potential "
        f"security threats. "
        f"{total_alerts} alerts and {total_incidents} incidents "
        f"were associated with the detected activity."
    )

    story.append(
        Paragraph(
            assessment,
            styles["Normal"],
        )
    )

    document.build(story)

    buffer.seek(0)

    return buffer