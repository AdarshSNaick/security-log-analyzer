import os
import time
import logging
from pathlib import Path

from django.utils import timezone
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

from logs.models import LogEntry, LogFile
from logs.services.log_parser import parse_log_line

from detection.models import ThreatDetection
from detection.services.detection_engine import analyze_log_entry

from alerts.models import Alert
from incidents.models import Incident


logger = logging.getLogger(__name__)


class SecurityLogHandler(FileSystemEventHandler):
    """
    Watches security.log for new log entries.

    Responsibilities:
    1. Detect changes to the generated log file.
    2. Read only newly appended lines.
    3. Parse and save log entries.
    4. Run the threat detection engine.
    5. Display detection, alert, and incident information.
    """

    def __init__(self, log_file_path):
        self.log_file_path = Path(log_file_path).resolve()

    def on_modified(self, event):
        """Process the log file whenever it is modified."""

        if event.is_directory:
            return

        changed_file = Path(event.src_path).resolve()

        if changed_file != self.log_file_path:
            return

        try:
            self.process_new_lines()

        except Exception:
            logger.exception(
                "Error while processing the modified log file."
            )

            print(
                "\n[ERROR] Failed to process the modified log file. "
                "Check the terminal traceback."
            )

    def process_new_lines(self):
        """Read and process only new content added to the log file."""

        if not self.log_file_path.exists():
            print(
                f"[WARNING] Log file not found: "
                f"{self.log_file_path}"
            )
            return

        # Register or retrieve the generated log file.
        log_file_record, created = LogFile.objects.get_or_create(
            file_path=str(self.log_file_path),
            defaults={
                "file_name": self.log_file_path.name,
                "source_type": "GENERATED",
                "log_type": "GENERIC",
                "status": "PROCESSING",
            },
        )

        if created:
            print(
                f"[INFO] Registered log file: "
                f"{self.log_file_path}"
            )

        current_size = os.path.getsize(self.log_file_path)

        # If the file was cleared or recreated, read it again
        # from the beginning.
        if current_size < log_file_record.last_read_position:
            print(
                "[INFO] Log file was reset. "
                "Reading from the beginning."
            )

            log_file_record.last_read_position = 0

        # Read only the newly appended content.
        with open(
            self.log_file_path,
            "r",
            encoding="utf-8",
        ) as file:

            file.seek(log_file_record.last_read_position)

            new_lines = file.readlines()

            new_position = file.tell()

        if not new_lines:
            return

        print(
            f"\n[INFO] Detected {len(new_lines)} "
            f"new log line(s)."
        )

        processed_count = 0
        skipped_count = 0
        detection_errors = 0

        # Process each newly appended line.
        for line in new_lines:

            parsed_data = parse_log_line(line)

            if parsed_data is None:
                skipped_count += 1

                print(
                    "[WARNING] Skipped an unrecognized log line."
                )

                continue

            event_type = parsed_data["event_type"]
            source_ip = parsed_data["source_ip"]

            print(
                f"\n[LOG] Event: {event_type} "
                f"| Source IP: {source_ip}"
            )

            # Map event types to log statuses.
            if event_type == "LOGIN_SUCCESS":
                status = "SUCCESS"

            elif event_type == "LOGIN_FAILED":
                status = "FAILED"

            elif event_type == "UNAUTHORIZED_ACCESS":
                status = "BLOCKED"

            elif event_type == "SUSPICIOUS_REQUEST":
                status = "FLAGGED"

            else:
                status = "SUCCESS"

            # Save the parsed log entry.
            log_entry = LogEntry.objects.create(
                log_file=log_file_record,
                timestamp=parsed_data["timestamp"],
                source_ip=source_ip,
                username=parsed_data["username"],
                event_type=event_type,
                status=status,
                message=parsed_data["message"],
                raw_log=line.strip(),
            )

            processed_count += 1

            print(
                f"[SUCCESS] Saved log entry #{log_entry.id}"
            )

            # Capture existing detection IDs before analysis.
            # This lets us distinguish new detections from
            # detections that were already present.
            existing_detection_ids = set(
                ThreatDetection.objects.values_list(
                    "id",
                    flat=True,
                )
            )

            # Run the detection engine.
            try:
                detection = analyze_log_entry(log_entry)

                if detection is None:
                    print(
                        f"[INFO] No threat detected for "
                        f"log entry #{log_entry.id}."
                    )

                    continue

                # Determine whether the detection is new.
                is_new_detection = (
                    detection.id not in existing_detection_ids
                )

                if is_new_detection:
                    print("\n" + "!" * 55)

                    print(
                        "[NEW THREAT] "
                        "A new threat detection was created!"
                    )

                else:
                    print("\n" + "-" * 55)

                    print(
                        "[EXISTING THREAT] "
                        "An existing detection was matched."
                    )

                # Display detection details.
                print(
                    f"  Type: {detection.threat_type}"
                )

                print(
                    f"  Severity: {detection.severity}"
                )

                print(
                    f"  Status: {detection.status}"
                )

                print(
                    f"  Source IP: {log_entry.source_ip}"
                )

                print(
                    f"  Description: {detection.description}"
                )

                # Retrieve the alert associated with the detection.
                alert = Alert.objects.filter(
                    detection=detection
                ).order_by("-id").first()

                if alert:
                    print(f"\n[ALERT] {alert.title}")

                    print(
                        f"  Alert ID: {alert.id}"
                    )

                    print(
                        f"  Severity: {alert.severity}"
                    )

                    if is_new_detection:
                        print(
                            "  Email submission status: "
                            f"{alert.email_sent}"
                        )

                    else:
                        print(
                            "  Email status: Existing alert; "
                            "no new email is implied."
                        )

                    # Retrieve the associated incident.
                    incident = Incident.objects.filter(
                        alerts=alert
                    ).first()

                    if incident:
                        print(
                            f"[INCIDENT] Incident #{incident.id} "
                            f"| Status: {incident.status}"
                        )

                    else:
                        print(
                            "[INCIDENT] "
                            "No associated incident found."
                        )

                else:
                    print(
                        "[WARNING] No alert is associated "
                        "with this detection."
                    )

                print("!" * 55 + "\n")

            except Exception:
                detection_errors += 1

                logger.exception(
                    "Threat analysis failed for log entry #%s",
                    log_entry.id,
                )

                print(
                    f"[ERROR] Threat analysis failed for "
                    f"log entry #{log_entry.id}."
                )

        # Update file-processing metadata.
        log_file_record.last_read_position = new_position
        log_file_record.file_size = current_size
        log_file_record.status = "COMPLETED"
        log_file_record.processed_at = timezone.now()

        log_file_record.save(
            update_fields=[
                "last_read_position",
                "file_size",
                "status",
                "processed_at",
            ]
        )

        # Display a processing summary.
        print("\n" + "-" * 55)

        print("[SUMMARY] Log processing completed.")

        print(
            f"[SUMMARY] Entries saved: {processed_count}"
        )

        print(
            f"[SUMMARY] Lines skipped: {skipped_count}"
        )

        print(
            f"[SUMMARY] Detection errors: {detection_errors}"
        )

        print("-" * 55)


def start_log_monitor(log_file_path):
    """Start monitoring the generated security log."""

    log_file_path = Path(log_file_path).resolve()

    print("=" * 55)

    print(
        "       SECURITY LOG ANALYZER - LOG MONITOR"
    )

    print("=" * 55)

    print(
        f"Monitoring file: {log_file_path}"
    )

    if not log_file_path.exists():
        print(
            "[WARNING] Log file does not exist yet."
        )

        print(
            "[INFO] Waiting for file modifications."
        )

    event_handler = SecurityLogHandler(
        log_file_path
    )

    observer = Observer()

    observer.schedule(
        event_handler,
        str(log_file_path.parent),
        recursive=False,
    )

    observer.start()

    print(
        "[SUCCESS] Monitor started successfully."
    )

    print(
        "[INFO] Waiting for new log entries..."
    )

    print(
        "[INFO] Press Ctrl+C to stop monitoring."
    )

    print("=" * 55)

    try:
        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        print(
            "\n[INFO] Stopping the Security Log Monitor..."
        )

    finally:
        observer.stop()
        observer.join()

        print(
            "[INFO] Security Log Monitor stopped."
        )