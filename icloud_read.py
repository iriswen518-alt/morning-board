"""iCloud-safe 檔案讀取。

vault 位於 iCloud Drive；當檔案還是未下載的 placeholder、或 iCloud 正在
同步時，直接 read 會丟 OSError（errno 11 EDEADLK / 35 EAGAIN / 2 ENOENT）。
read_text_resilient() 會先觸發 iCloud 下載再重試數次，仍失敗才放棄。

2026-05-21：因應晨間斷網期間 parse_news.py / parse_market.py 讀 vault .md
連續 crash（OSError 11 Resource deadlock avoided）而新增。
"""
import errno
import subprocess
import time
from pathlib import Path

# iCloud 同步未完成時可能出現的暫時性 errno
_TRANSIENT = {errno.EDEADLK, errno.EAGAIN, errno.ENOENT}


def _materialize(path):
    """請 iCloud 把可能還是 placeholder 的檔案實體下載下來（best-effort）。"""
    try:
        subprocess.run(
            ["/usr/bin/brctl", "download", str(path)],
            capture_output=True, timeout=20,
        )
    except Exception:
        pass


def read_text_resilient(path, encoding="utf-8", retries=6, delay=1.5):
    """讀取文字檔。遇 iCloud 暫時性錯誤先觸發下載再重試；retries 次後仍失敗才 raise。

    一般檔案第一次就成功，零額外成本；只有踩到 iCloud placeholder 才會重試。
    非暫時性的 OSError（如 EACCES 權限）直接往外拋，不重試。
    """
    last = None
    for _ in range(retries):
        try:
            return Path(path).read_text(encoding)
        except OSError as e:
            last = e
            if e.errno not in _TRANSIENT:
                raise
            _materialize(path)
            time.sleep(delay)
    raise last
