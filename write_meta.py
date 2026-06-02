"""產 data/meta.json，紀錄 build 時間與各來源狀態。"""
import json
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path


TPE = timezone(timedelta(hours=8))


def write_meta(output_path: str, sources_status: dict):
    now = datetime.now(TPE)
    data = {
        "built_at": now.isoformat(timespec="seconds"),
        "today": now.strftime("%Y-%m-%d"),
        "sources_status": sources_status,
    }
    Path(output_path).write_text(
        json.dumps(data, ensure_ascii=False, indent=2), "utf-8"
    )


if __name__ == "__main__":
    output = sys.argv[1]
    statuses = {}
    for arg in sys.argv[2:]:
        k, _, v = arg.partition("=")
        statuses[k] = v
    write_meta(output, statuses)
