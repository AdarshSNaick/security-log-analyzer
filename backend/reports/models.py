from django.db import models


class Report(models.Model):
    FORMAT_CHOICES = [
        ("PDF", "PDF"),
        ("CSV", "CSV"),
    ]

    STATUS_CHOICES = [
        ("GENERATING", "Generating"),
        ("COMPLETED", "Completed"),
        ("FAILED", "Failed"),
    ]

    report_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    report_type = models.CharField(max_length=100)
    generated_at = models.DateTimeField(auto_now_add=True)
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES)
    file = models.FileField(upload_to="reports/", blank=True, null=True)
    file_size = models.CharField(max_length=50, default="0 KB")
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="GENERATING",
    )

    total_events_processed = models.PositiveIntegerField(default=0)
    threats_detected = models.PositiveIntegerField(default=0)

    date_range = models.CharField(max_length=50, default="Last 30 Days")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.report_id} - {self.name}"