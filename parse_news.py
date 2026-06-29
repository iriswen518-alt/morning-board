"""解析「市場日誌_YYYYMMDD_每日新聞.md」→ news.json

格式約定：
- frontmatter 含 date
- ### TL;DR 區塊：bullet list
- ### Section 標題（英中對照、emoji 可有可無）
- 每則 bullet 結構：
  - **Title EN** — summary
    **標題 ZH** — 摘要
    - 來源 / Source：[name](url)
"""

import json
import re
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlsplit

from icloud_read import read_text_resilient

RAW_NEWS_DIR = Path.home() / "scripts" / "logs"


def _norm_url(url: str) -> str:
    """Normalize for matching: drop scheme/query/fragment, strip trailing slash.

    The digest .md strips the `?from=...` query that the fetch listing keeps,
    so we compare on host+path only.
    """
    if not url:
        return ""
    s = urlsplit(url.strip())
    path = (s.path or "").rstrip("/")
    return f"{s.netloc}{path}".lower()


def load_body_map(news_date: Optional[str]) -> Dict[str, str]:
    """Build {normalized_url -> body} from news_raw_YYYYMMDD.json for that date.

    Bodies are the clean full article text (no images) captured at fetch time.
    Missing file / no bodies → empty map (display falls back to the summary).
    """
    if not news_date:
        return {}
    raw_path = RAW_NEWS_DIR / f"news_raw_{news_date.replace('-', '')}.json"
    if not raw_path.exists():
        return {}
    try:
        data = json.loads(raw_path.read_text("utf-8"))
    except (OSError, ValueError):
        return {}
    out: Dict[str, str] = {}
    for it in data.get("all_items", []):
        body = (it.get("body") or "").strip()
        if not body:
            continue
        key = _norm_url(it.get("url", ""))
        if key:
            out[key] = body
    return out


def load_published_map(news_date: Optional[str]) -> Dict[str, str]:
    """Build {normalized_url -> 'YYYY-MM-DD'} from the raw fetch's `time` field.

    This is each article's真實發布日 (cnyes publishAt 等)，與資料抓取日 news_date 不同。
    Missing / undated items → absent from map (display falls back to news_date).
    """
    if not news_date:
        return {}
    raw_path = RAW_NEWS_DIR / f"news_raw_{news_date.replace('-', '')}.json"
    if not raw_path.exists():
        return {}
    try:
        data = json.loads(raw_path.read_text("utf-8"))
    except (OSError, ValueError):
        return {}
    out: Dict[str, str] = {}
    for it in data.get("all_items", []):
        t = (it.get("time") or "").strip()
        m = re.match(r"(\d{4}-\d{2}-\d{2})", t)
        if not m:
            continue
        key = _norm_url(it.get("url", ""))
        if key:
            out[key] = m.group(1)
    return out


def parse_news(md: str) -> dict:
    # date
    m = re.search(r"date:\s*([\d\-]+)", md)
    news_date = m.group(1) if m else None

    # TL;DR
    tldr = []
    tldr_m = re.search(r"### .*TL;DR.*?\n(.*?)(?=\n### )", md, re.DOTALL)
    if tldr_m:
        for line in tldr_m.group(1).splitlines():
            stripped = line.strip()
            # Accept lines that have Chinese characters, whether dash-prefixed or indented
            if (
                not stripped
                or stripped.startswith("- 來源")
                or stripped.startswith("- Source")
            ):
                continue
            # Remove leading "- " if present
            if stripped.startswith("- "):
                content = stripped[2:].strip()
            else:
                content = stripped
            # 只取含中文的行
            if re.search(r"[一-鿿]", content):
                tldr.append(content)
        tldr = tldr[:6]

    # sections
    sections = []
    sec_pat = re.compile(
        r"^###\s+(.+?)$(.*?)(?=^###\s+|\Z)",
        re.MULTILINE | re.DOTALL,
    )
    for sec_m in sec_pat.finditer(md):
        header = sec_m.group(1).strip()
        if "TL;DR" in header or "今日摘要" in header:
            continue
        body = sec_m.group(2)

        # 拆英中標題，去除前置 emoji 和空格
        cleaned = re.sub(r"^[\U0001F000-\U0001FFFF☀-⟿\s]+", "", header).strip()
        parts = re.split(r"\s*[／/]\s*", cleaned, maxsplit=1)
        section_en = parts[0].strip()
        section_zh = parts[1].strip() if len(parts) > 1 else ""

        items = parse_section_items(body)
        if items:
            sections.append(
                {
                    "section": section_en,
                    "section_zh": section_zh,
                    "items": items,
                }
            )

    return {
        "news_date": news_date,
        "tldr": tldr,
        "sections": sections,
    }


def parse_section_items(body: str) -> List[dict]:
    """每則 bullet 結構：
    - **Title EN** — summary EN
      **標題 ZH** — 摘要 ZH
      - 來源 / Source：[name](url)
    """
    items = []
    blocks = re.split(r"\n(?=- \*\*)", body)
    for blk in blocks:
        blk = blk.strip()
        if not blk.startswith("- **"):
            continue
        item = parse_one_item(blk)
        if item:
            items.append(item)
    return items


def parse_one_item(blk: str) -> Optional[dict]:
    # 第一行：**Title EN** — summary
    lines = blk.splitlines()
    if not lines:
        return None
    first = lines[0].lstrip("- ").strip()
    title_en, summary_en = split_title_body(first)

    # 找中文 line
    title_zh, summary_zh = "", ""
    for ln in lines[1:]:
        ln = ln.strip()
        if ln.startswith("- 來源") or ln.startswith("- Source"):
            continue
        if re.search(r"[一-鿿]", ln):
            title_zh, summary_zh = split_title_body(ln)
            if title_zh or summary_zh:
                break

    # source url — grab first http link in the block
    src_m = re.search(r"\[([^\]]+)\]\((https?://[^\)]+)\)", blk)
    source_name = src_m.group(1) if src_m else ""
    source_url = src_m.group(2) if src_m else ""

    if not (title_en or title_zh):
        return None

    return {
        "title_zh": title_zh,
        "title_en": title_en,
        "summary_zh": summary_zh,
        "summary_en": summary_en,
        "source_name": source_name,
        "source_url": source_url,
    }


def split_title_body(line: str) -> Tuple[str, str]:
    """**Title** — body  → ('Title', 'body'). dash 容忍 — / -- / —.
    Also tolerates an optional date tag (2026-06-18) or（2026-06-18）before the dash."""
    m = re.match(r"\*\*(.+?)\*\*\s*(?:[(（][^)）]*[)）])?\s*[—\-–]+\s*(.*)", line)
    if m:
        return m.group(1).strip(), m.group(2).strip()
    m = re.match(r"\*\*(.+?)\*\*\s*$", line)
    if m:
        return m.group(1).strip(), ""
    return "", line.strip()


def main(input_path: str, output_path: str):
    md = read_text_resilient(input_path)
    data = parse_news(md)

    # Attach full article text (captured at fetch time) by URL match so the
    # dashboard can show the story inline instead of only the short summary.
    body_map = load_body_map(data.get("news_date"))
    pub_map = load_published_map(data.get("news_date"))
    if body_map or pub_map:
        for sec in data.get("sections", []):
            for it in sec.get("items", []):
                key = _norm_url(it.get("source_url", ""))
                body = body_map.get(key)
                if body:
                    it["body_zh"] = body
                pub = pub_map.get(key)
                if pub:
                    it["published"] = pub

    Path(output_path).write_text(
        json.dumps(data, ensure_ascii=False, indent=2), "utf-8"
    )


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
