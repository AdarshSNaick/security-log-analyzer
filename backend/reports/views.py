import os
import uuid

from django.http import FileResponse

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from reports.models import Report
from reports.serializers import ReportSerializer
from reports.services.report_generator import (
    build_report_data,
    generate_pdf,
    generate_csv,
)


class ReportListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    queryset = Report.objects.order_by("-generated_at")
    serializer_class = ReportSerializer


class ReportGenerateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]

    serializer_class = ReportSerializer

    def create(self, request, *args, **kwargs):
        title = request.data.get(
            "title",
            "Security Audit Log Report",
        )

        report_type = request.data.get(
            "type",
            "Custom Security Report",
        )

        report_format = request.data.get(
            "format",
            "PDF",
        ).upper()

        date_range = request.data.get(
            "dateRange",
            "Last 30 Days",
        )

        if report_format not in ["PDF", "CSV"]:
            return Response(
                {
                    "error": "Format must be PDF or CSV."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        report_id = f"REP-{uuid.uuid4().hex[:6].upper()}"

        report = Report.objects.create(
            report_id=report_id,
            name=title,
            report_type=report_type,
            format=report_format,
            date_range=date_range,
            status="GENERATING",
        )

        try:
            report_data = build_report_data(
                date_range
            )

            report.total_events_processed = len(
                report_data["logs"]
            )

            report.threats_detected = len(
                report_data["detections"]
            )

            if report_format == "PDF":
                output = generate_pdf(
                    report_data,
                    title,
                )

                filename = (
                    f"{report_id}_{title.replace(' ', '_')}.pdf"
                )

            else:
                output = generate_csv(
                    report_data
                )

                filename = (
                    f"{report_id}_{title.replace(' ', '_')}.csv"
                )

            report.file.save(
                filename,
                output,
                save=True,
            )

            if report.file:
                report.file_size = (
                    f"{report.file.size / 1024:.1f} KB"
                )

            report.status = "COMPLETED"

            report.save(
                update_fields=[
                    "total_events_processed",
                    "threats_detected",
                    "file",
                    "file_size",
                    "status",
                ]
            )

            serializer = self.get_serializer(
                report,
                context={"request": request},
            )

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
            )

        except Exception as exc:
            report.status = "FAILED"
            report.save(update_fields=["status"])

            return Response(
                {
                    "error": "Report generation failed.",
                    "details": str(exc),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ReportDownloadView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    queryset = Report.objects.all()

    def get(self, request, report_id):
        try:
            report = Report.objects.get(
                report_id=report_id
            )

            if not report.file:
                return Response(
                    {"error": "Report file is not available."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            response = FileResponse(
                report.file.open("rb"),
                as_attachment=True,
                filename=os.path.basename(report.file.name),
            )

            return response

        except Report.DoesNotExist:
            return Response(
                {"error": "Report not found."},
                status=status.HTTP_404_NOT_FOUND,
            )