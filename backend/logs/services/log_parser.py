from datetime import datetime
import pandas as pd
from django.utils import timezone


def parse_log_line(line):
    """
    Parse one generated security log line.

    Format:
    timestamp | source_ip | username | event_type | message
    """

    line = line.strip()

    if not line:
        return None

    parts = [part.strip() for part in line.split("|")]

    if len(parts) != 5:
        return None

    timestamp_text, source_ip, username, event_type, message = parts

    try:
        naive_timestamp = datetime.strptime(
            timestamp_text,
            "%Y-%m-%d %H:%M:%S"
        )
        timestamp = timezone.make_aware(
            naive_timestamp,
            timezone.get_current_timezone()
        )
    except ValueError:
        return None

    # Use Pandas for data normalization.
    data = pd.DataFrame(
        [{
            "timestamp": timestamp,
            "source_ip": source_ip,
            "username": username,
            "event_type": event_type,
            "message": message,
        }]
    )

    data["source_ip"] = data["source_ip"].astype(str).str.strip()
    data["username"] = data["username"].astype(str).str.strip()
    data["event_type"] = data["event_type"].astype(str).str.strip()
    data["message"] = data["message"].astype(str).str.strip()

    return data.iloc[0].to_dict()