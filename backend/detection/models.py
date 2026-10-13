from django.db import models
from logs.models import LogEntry


class ThreatDetection(models.Model):
    THREAT_TYPE_CHOICES = [
        ("BRUTE_FORCE", "Brute Force Attack"),
        ("SQL_INJECTION", "SQL Injection Attempt"),
        ("PORT_SCAN", "Port Scan"),
        ("UNAUTHORIZED_ACCESS", "Unauthorized Access"),
        ("SUSPICIOUS_REQUEST", "Suspicious Request"),
        ("OTHER", "Other"),
    ]

    SEVERITY_CHOICES = [
        ("LOW", "Low"),
        ("MEDIUM", "Medium"),
        ("HIGH", "High"),
        ("CRITICAL", "Critical"),
    ]

    STATUS_CHOICES = [
        ("OPEN", "Open"),
        ("INVESTIGATING", "Investigating"),
        ("RESOLVED", "Resolved"),
        ("FALSE_POSITIVE", "False Positive"),
    ]

    log_entry = models.ForeignKey(
        LogEntry,
        on_delete=models.CASCADE,
        related_name="detections",
    )

    threat_type = models.CharField(
        max_length=30,
        choices=THREAT_TYPE_CHOICES,
    )

    severity = models.CharField(
        max_length=10,
        choices=SEVERITY_CHOICES,
    )

    description = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="OPEN",
    )

    detected_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.threat_type} - {self.severity}"