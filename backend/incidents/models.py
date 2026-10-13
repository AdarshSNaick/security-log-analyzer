from django.db import models
from alerts.models import Alert


class Incident(models.Model):
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
        ("CLOSED", "Closed"),
    ]

    title = models.CharField(max_length=255)

    description = models.TextField()

    severity = models.CharField(
        max_length=10,
        choices=SEVERITY_CHOICES,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="OPEN",
    )

    source_ip = models.GenericIPAddressField(
        null=True,
        blank=True,
    )

    affected_asset = models.CharField(
        max_length=255,
        blank=True,
    )

    alerts = models.ManyToManyField(
        Alert,
        related_name="incidents",
        blank=True,
    )

    detected_at = models.DateTimeField()

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.severity}"