from rest_framework import serializers

from reports.models import Report


class ReportSerializer(serializers.ModelSerializer):
    id = serializers.CharField(
        source="report_id",
        read_only=True,
    )

    name = serializers.CharField(read_only=True)

    type = serializers.CharField(
        source="report_type",
        read_only=True,
    )

    generatedAt = serializers.DateTimeField(
        source="generated_at",
        read_only=True,
    )

    fileUrl = serializers.SerializerMethodField()

    totalEventsProcessed = serializers.IntegerField(
        source="total_events_processed",
        read_only=True,
    )

    threatsBlocked = serializers.IntegerField(
        source="threats_detected",
        read_only=True,
    )

    class Meta:
        model = Report
        fields = [
            "id",
            "name",
            "type",
            "generatedAt",
            "format",
            "file_size",
            "status",
            "date_range",
            "totalEventsProcessed",
            "threatsBlocked",
            "fileUrl",
        ]

    def get_fileUrl(self, obj):
        if not obj.file:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(
                obj.file.url
            )

        return obj.file.url