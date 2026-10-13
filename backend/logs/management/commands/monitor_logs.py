from pathlib import Path

from django.core.management.base import BaseCommand

from logs.services.log_monitor import start_log_monitor


class Command(BaseCommand):
    help = "Monitor the generated security log for new entries."

    def handle(self, *args, **options):
        backend_directory = Path(__file__).resolve().parents[3]

        log_file = (
            backend_directory
            / "generated_logs"
            / "security.log"
        )

        start_log_monitor(log_file)