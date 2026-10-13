from django.db import models


class LogFile(models.Model):
    SOURCE_CHOICES = [
        ("GENERATED", "Generated"),
        ("UPLOADED", "Uploaded"),
        ("MONITORED", "Monitored"),
    ]

    LOG_TYPE_CHOICES = [
        ("LINUX_AUTH", "Linux Authentication"),
        ("APACHE_ACCESS", "Apache Access"),
        ("APACHE_ERROR", "Apache Error"),
        ("GENERIC", "Generic"),
    ]

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("PROCESSING", "Processing"),
        ("COMPLETED", "Completed"),
        ("FAILED", "Failed"),
    ]

    file_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)

    source_type = models.CharField(
        max_length=20,
        choices=SOURCE_CHOICES,
        default="GENERATED",
    )

    log_type = models.CharField(
        max_length=30,
        choices=LOG_TYPE_CHOICES,
        default="GENERIC",
    )

    file_size = models.BigIntegerField(default=0)
    last_read_position = models.BigIntegerField(default=0)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.file_name


class LogEntry(models.Model):
    EVENT_TYPE_CHOICES = [
        ("LOGIN_SUCCESS", "Successful Login"),
        ("LOGIN_FAILED", "Failed Login"),
        ("LOGOUT", "Logout"),
        ("HTTP_REQUEST", "HTTP Request"),
        ("UNAUTHORIZED_ACCESS", "Unauthorized Access"),
        ("SUSPICIOUS_REQUEST", "Suspicious Request"),
        ("OTHER", "Other"),
    ]

    STATUS_CHOICES = [
        ("SUCCESS", "Success"),
        ("FAILED", "Failed"),
        ("BLOCKED", "Blocked"),
        ("FLAGGED", "Flagged"),
    ]

    log_file = models.ForeignKey(
        LogFile,
        on_delete=models.CASCADE,
        related_name="entries",
    )

    timestamp = models.DateTimeField()

    source_ip = models.GenericIPAddressField(
        null=True,
        blank=True,
    )

    username = models.CharField(
        max_length=150,
        null=True,
        blank=True,
    )

    event_type = models.CharField(
        max_length=30,
        choices=EVENT_TYPE_CHOICES,
        default="OTHER",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="SUCCESS",
    )

    message = models.TextField()
    raw_log = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.event_type} - {self.source_ip}"