from rest_framework import serializers

from alerts.models import Alert


class AlertSerializer(serializers.ModelSerializer):
    threat_type = serializers.CharField(
        source="detection.threat_type",
        read_only=True,
    )

    source_ip = serializers.CharField(
        source="detection.log_entry.source_ip",
        read_only=True,
    )

    detected_at = serializers.DateTimeField(
        source="detection.detected_at",
        read_only=True,
    )

    description = serializers.CharField(
        source="message",
        read_only=True,
    )

    timestamp = serializers.DateTimeField(
        source="created_at",
        read_only=True,
    )

    source = serializers.CharField(
        source="detection.log_entry.log_file.file_name",
        read_only=True,
    )

    class Meta:
        model = Alert
        fields = [
            "id",
            "title",
            "description",
            "message",
            "severity",
            "status",
            "is_read",
            "email_sent",
            "timestamp",
            "created_at",
            "threat_type",
            "source_ip",
            "source",
            "detected_at",
        ]