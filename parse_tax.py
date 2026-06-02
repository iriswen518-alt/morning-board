"""解析稅務新聞 .md → tax.json。

每篇是單一主題深度文：
- frontmatter 有 date / source / url / topic / tags
- H1 標題 或 frontmatter 內 title
- ## 摘要 段落
- ## 原文連結 有來源超連結
"""
import json
import re
import sys
from pathlib import Path
from typing import Dict, List

from icloud_read import read_text_resilient


def parse_tax(md: str) -> Dict:
    # --- date: frontmatter ---
    m = re.search(r"date:\s*([\d\-]+)", md)
    tax_date = m.group(1) if m else None

    # --- title: H1 first, then frontmatter title ---
    title_m = re.search(r"^#\s+(.+?)\s*$", md, re.MULTILINE)
    title = title_m.group(1).strip() if title_m else ""
    if not title:
        title_m = re.search(r"^title:\s*(.+?)$", md, re.MULTILINE)
        title = title_m.group(1).strip() if title_m else ""

    # --- summary: ## 摘要 section, else first prose paragraph after frontmatter ---
    summary = ""
    摘要_m = re.search(r"##\s*摘要\s*\n+([\s\S]+?)(?=\n##|\Z)", md)
    if 摘要_m:
        summary_raw = 摘要_m.group(1).strip()
        summary = re.sub(r"\s+", " ", summary_raw)[:300]
    else:
        # fallback: first non-heading, non-frontmatter, non-table paragraph
        body = re.split(r"\n---\n", md, maxsplit=2)
        body = body[-1] if len(body) > 1 else md
        paragraphs = [p.strip() for p in body.split("\n\n") if p.strip()]
        for p in paragraphs:
            if p.startswith("#") or p.startswith("|") or p.startswith("-"):
                continue
            summary = re.sub(r"\s+", " ", p)[:300]
            break

    # --- tags: frontmatter tags list (YAML list or inline) ---
    tags: List[str] = []
    # try block-style tags: [news, hnw]
    tags_inline_m = re.search(r"^tags:\s*\[([^\]]+)\]", md, re.MULTILINE)
    if tags_inline_m:
        for tag in tags_inline_m.group(1).split(","):
            tag = tag.strip()
            if tag:
                tags.append(tag)
    else:
        # block-style tags
        tags_block_m = re.search(r"tags:\s*\n((?:\s*-\s*.+\n?)+)", md)
        if tags_block_m:
            for ln in tags_block_m.group(1).splitlines():
                tag = ln.strip().lstrip("- ").strip()
                if tag:
                    tags.append(tag)

    # --- source: prefer ## 原文連結 section, fallback first markdown link ---
    source_name = ""
    source_url = ""
    原文_m = re.search(r"##\s*原文連結\s*\n+([\s\S]+?)(?=\n##|\Z)", md)
    if 原文_m:
        link_m = re.search(r"\[([^\]]+)\]\((https?://[^\)]+)\)", 原文_m.group(1))
        if link_m:
            source_name = link_m.group(1)
            source_url = link_m.group(2)
    if not source_url:
        # fallback: frontmatter url field
        url_m = re.search(r"^url:\s*(https?://\S+)", md, re.MULTILINE)
        if url_m:
            source_url = url_m.group(1)
            src_m = re.search(r"^source:\s*(.+?)$", md, re.MULTILINE)
            source_name = src_m.group(1).strip() if src_m else ""

    return {
        "tax_date": tax_date,
        "items": [{
            "title": title,
            "summary": summary,
            "source_name": source_name,
            "source_url": source_url,
            "tags": tags,
        }] if title else [],
    }


def main(input_path: str, output_path: str) -> None:
    md = read_text_resilient(input_path)
    data = parse_tax(md)
    Path(output_path).write_text(
        json.dumps(data, ensure_ascii=False, indent=2), "utf-8"
    )


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
