from rest_framework import serializers

from alerts.models import Alert
from incidents.models import Incident


class IncidentAlertSerializer(serializers.ModelSerializer):
    threat_type = serializers.CharField(
        source="detection.threat_type",
        read_only=True,
    )

    class Meta:
        model = Alert
        fields = [
            "id",
            "title",
            "severity",
            "status",
            "threat_type",
            "created_at",
        ]


class IncidentSerializer(serializers.ModelSerializer):
    alerts = IncidentAlertSerializer(
        many=True,
        read_only=True,
    )

    alert_count = serializers.IntegerField(
        source="alerts.count",
        read_only=True,
    )

    class Meta:
        model = Incident
        fields = [
            "id",
            "title",
            "description",
            "severity",
            "status",
            "source_ip",
            "affected_asset",
            "detected_at",
            "created_at",
            "updated_at",
            "alert_count",
            "alerts",
        ]