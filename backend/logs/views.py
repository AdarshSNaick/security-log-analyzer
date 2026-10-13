from pathlib import Path
import uuid

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from logs.models import LogEntry, LogFile
from logs.serializers import (
    LogEntrySerializer,
    LogFileSerializer,
)
from logs.services.log_parser import parse_log_line
from detection.services.detection_engine import analyze_log_entry
from incidents.models import Incident


# ============================================================
# LOG LIST
# ============================================================

class LogEntryListView(generics.ListAPIView):
    """
    Returns security log entries from the database.

    Only authenticated users can access the log stream.
    """

    permission_classes = [IsAuthenticated]

    queryset = (
        LogEntry.objects
        .select_related("log_file")
        .order_by("-created_at", "-timestamp")
    )

    serializer_class = LogEntrySerializer

# ============================================================
# LOG FILE HISTORY
# ============================================================

class LogFileListView(generics.ListAPIView):
    """
    Returns the real uploaded log-file history
    from the database.

    Used by the Upload Logs page.
    """

    permission_classes = [IsAuthenticated]

    queryset = (
        LogFile.objects
        .order_by("-created_at")
    )

    serializer_class = LogFileSerializer


# ============================================================
# LOG FILE UPLOAD
# ============================================================

class LogFileUploadView(generics.CreateAPIView):
    """
    Upload and process a security log file.

    Workflow:

        Upload file
            ↓
        Save file
            ↓
        Parse each line
            ↓
        Create LogEntry
            ↓
        Run threat detection
            ↓
        Generate alerts/incidents when required
    """

    permission_classes = [IsAuthenticated]

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def post(self, request, *args, **kwargs):

        # ----------------------------------------------------
        # 1. Get uploaded file
        # ----------------------------------------------------

        uploaded_file = request.FILES.get("file")

        if not uploaded_file:
            return Response(
                {
                    "success": False,
                    "error": "No log file was provided.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # 2. Validate file size
        # ----------------------------------------------------

        max_file_size = 10 * 1024 * 1024  # 10 MB

        if uploaded_file.size > max_file_size:
            return Response(
                {
                    "success": False,
                    "error": "File size must not exceed 10 MB.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # 3. Sanitize original filename
        # ----------------------------------------------------

        original_name = Path(
            uploaded_file.name
        ).name

        # ----------------------------------------------------
        # 4. Create upload directory
        # ----------------------------------------------------

        upload_dir = (
            Path(settings.BASE_DIR)
            / "uploaded_logs"
        )

        upload_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

        # ----------------------------------------------------
        # 5. Generate unique stored filename
        # ----------------------------------------------------

        stored_name = (
            f"{uuid.uuid4().hex[:8]}_"
            f"{original_name}"
        )

        file_path = upload_dir / stored_name

        log_file = None

        try:

            # ------------------------------------------------
            # 6. Save physical file
            # ------------------------------------------------

            with open(
                file_path,
                "wb+"
            ) as destination:

                for chunk in uploaded_file.chunks():
                    destination.write(chunk)

            # ------------------------------------------------
            # 7. Create LogFile database record
            # ------------------------------------------------

            log_file = LogFile.objects.create(
                file_name=original_name,
                file_path=str(file_path),
                source_type="UPLOADED",
                log_type="GENERIC",
                file_size=uploaded_file.size,
                status="PROCESSING",
            )

            parsed_count = 0
            skipped_count = 0
            detection_count = 0

            # ------------------------------------------------
            # 8. Process the uploaded file
            # ------------------------------------------------

            with transaction.atomic():

                with open(
                    file_path,
                    "r",
                    encoding="utf-8",
                    errors="ignore",
                ) as log:

                    for line in log:

                        # ------------------------------------
                        # Parse log line
                        # ------------------------------------

                        parsed = parse_log_line(line)

                        # ------------------------------------
                        # Skip invalid lines
                        # ------------------------------------

                        if not parsed:
                            skipped_count += 1
                            continue

                        # ------------------------------------
                        # Determine event status
                        # ------------------------------------

                        event_type = parsed[
                            "event_type"
                        ]

                        if event_type == "LOGIN_FAILED":

                            entry_status = "FAILED"

                        elif event_type == "UNAUTHORIZED_ACCESS":

                            entry_status = "BLOCKED"

                        elif event_type == "SUSPICIOUS_REQUEST":

                            entry_status = "FLAGGED"

                        else:

                            entry_status = "SUCCESS"

                        # ------------------------------------
                        # Create database log entry
                        # ------------------------------------

                        log_entry = LogEntry.objects.create(
                            log_file=log_file,
                            timestamp=parsed["timestamp"],
                            source_ip=parsed["source_ip"],
                            username=parsed["username"],
                            event_type=event_type,
                            message=parsed["message"],
                            raw_log=line.strip(),
                            status=entry_status,
                        )

                        parsed_count += 1

                        # ------------------------------------
                        # Run threat detection
                        # ------------------------------------

                        before_count = (
                            log_entry.detections.count()
                        )

                        analyze_log_entry(
                            log_entry
                        )

                        after_count = (
                            log_entry.detections.count()
                        )

                        if after_count > before_count:

                            detection_count += (
                                after_count
                                - before_count
                            )

            # ------------------------------------------------
            # 9. Mark file as completed
            # ------------------------------------------------

            log_file.status = "COMPLETED"

            log_file.processed_at = (
                timezone.now()
            )

            log_file.save(
                update_fields=[
                    "status",
                    "processed_at",
                ]
            )

            # ------------------------------------------------
            # 10. Return success response
            # ------------------------------------------------

            return Response(
                {
                    "success": True,
                    "message": (
                        f"Successfully processed "
                        f"{original_name}. "
                        f"Parsed {parsed_count} "
                        f"log records."
                    ),
                    "file": {
                        "name": original_name,
                        "size": (
                            f"{uploaded_file.size / 1024:.2f} KB"
                        ),
                        "parsedCount": parsed_count,
                        "skippedCount": skipped_count,
                        "detections": detection_count,
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        # ====================================================
        # ERROR HANDLING
        # ====================================================

        except Exception as exc:

            # ------------------------------------------------
            # Delete physical file if processing failed
            # ------------------------------------------------

            try:

                if file_path.exists():
                    file_path.unlink()

            except Exception:
                pass

            # ------------------------------------------------
            # Mark database record as failed
            # ------------------------------------------------

            if log_file is not None:

                log_file.status = "FAILED"

                log_file.save(
                    update_fields=["status"]
                )

            # ------------------------------------------------
            # Return error response
            # ------------------------------------------------

            return Response(
                {
                    "success": False,
                    "error": "Log file processing failed.",
                    "details": str(exc),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ============================================================
# DELETE LOG ENTRY
# ============================================================

class LogEntryDeleteView(generics.DestroyAPIView):
    """
    Delete a log entry and clean up security objects that
    exist only because of that log entry.

    Workflow:

        LogEntry
           ↓
        ThreatDetection
           ↓
        Alert
           ↓
        Incident

    If deleting the log causes an incident to have no
    remaining alerts, that orphan incident is also removed.

    If an incident still has other alerts, the incident
    is preserved.
    """

    permission_classes = [IsAuthenticated]

    queryset = LogEntry.objects.all()

    def delete(self, request, *args, **kwargs):

        log_entry = self.get_object()
        log_id = log_entry.id

        # ----------------------------------------------------
        # Find incidents connected to this log entry
        # ----------------------------------------------------

        incident_ids = list(
            Incident.objects.filter(
                alerts__detection__log_entry=log_entry
            )
            .values_list("id", flat=True)
            .distinct()
        )

        # ----------------------------------------------------
        # Delete the log entry
        #
        # Related detections/alerts are removed according
        # to the model relationships.
        # ----------------------------------------------------

        self.perform_destroy(log_entry)

        # ----------------------------------------------------
        # Remove only incidents that are now orphaned.
        #
        # If an incident still has another alert, it remains.
        # ----------------------------------------------------

        orphaned_incidents = Incident.objects.filter(
            id__in=incident_ids,
            alerts__isnull=True,
        )

        deleted_incident_count = (
            orphaned_incidents.count()
        )

        orphaned_incidents.delete()

        # ----------------------------------------------------
        # Return result
        # ----------------------------------------------------

        return Response(
            {
                "success": True,
                "message": (
                    f"Log entry {log_id} "
                    "deleted successfully."
                ),
                "deletedIncidents": deleted_incident_count,
            },
            status=status.HTTP_200_OK,
        )