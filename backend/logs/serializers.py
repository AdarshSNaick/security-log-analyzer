from rest_framework import serializers

from logs.models import LogEntry, LogFile


# ============================================================
# LOG ENTRY SERIALIZER
# ============================================================

class LogEntrySerializer(serializers.ModelSerializer):
    ip = serializers.CharField(
        source="source_ip",
        read_only=True
    )

    event = serializers.CharField(
        source="event_type",
        read_only=True
    )

    details = serializers.CharField(
        source="message",
        read_only=True
    )

    source = serializers.CharField(
        source="log_file.file_name",
        read_only=True
    )

    severity = serializers.SerializerMethodField()

    class Meta:
        model = LogEntry

        fields = [
            "id",
            "timestamp",
            "username",
            "ip",
            "event",
            "status",
            "severity",
            "source",
            "details",
            "message",
            "raw_log",
            "created_at",
        ]

    def get_severity(self, obj):
        detection = (
            obj.detections
            .order_by("-detected_at")
            .first()
        )

        if detection:
            return detection.severity

        return "LOW"


# ============================================================
# LOG FILE SERIALIZER
# ============================================================

class LogFileSerializer(serializers.ModelSerializer):
    """
    Serializer for uploaded/processed log files.

    Used by the Upload Logs page to display the
    real ingestion history stored in MariaDB.
    """

    name = serializers.CharField(
        source="file_name",
        read_only=True
    )

    size = serializers.SerializerMethodField()

    timestamp = serializers.DateTimeField(
        source="created_at",
        read_only=True
    )

    parsedCount = serializers.SerializerMethodField()

    status = serializers.SerializerMethodField()

    class Meta:
        model = LogFile

        fields = [
            "id",
            "name",
            "size",
            "timestamp",
            "parsedCount",
            "status",
        ]

    def get_size(self, obj):
        if not obj.file_size:
            return "0 KB"

        size = obj.file_size

        if size < 1024:
            return f"{size} B"

        if size < 1024 * 1024:
            return f"{size / 1024:.2f} KB"

        return f"{size / (1024 * 1024):.2f} MB"

    def get_parsedCount(self, obj):
        return obj.entries.count()

    def get_status(self, obj):
        status_map = {
            "PENDING": "Pending",
            "PROCESSING": "Processing",
            "COMPLETED": "Success",
            "FAILED": "Failed",
        }

        return status_map.get(
            obj.status,
            obj.status
        )