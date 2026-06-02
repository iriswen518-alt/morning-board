"""解析「市場日誌_YYYYMMDD_全球指數.md」→ market.json"""
import json
import re
import sys
from pathlib import Path

from icloud_read import read_text_resilient

# matches "<span style="color:#xxx">+1.93%</span>" or "+1.93%" or "—"
PCT_RE = re.compile(
    r'(?:<span[^>]*>)?\s*([+\-]?\d+\.?\d*)%\s*(?:</span>)?'
)
NUM_RE = re.compile(r'^\s*([\d,]+\.?\d*)\s*$')


def parse_pct(cell: str):
    """'+1.93%' / '<span ...>+1.93%</span>' / '—' → float or None"""
    cell = cell.strip()
    if cell in ("—", "-", "", "–"):
        return None
    m = PCT_RE.search(cell)
    if not m:
        return None
    return float(m.group(1))


def parse_num(cell: str):
    """'41,933.78' → 41933.78, '—' → None"""
    cell = cell.strip()
    if cell in ("—", "-", "", "–"):
        return None
    m = NUM_RE.search(cell.replace(",", ""))
    if not m:
        return None
    return float(m.group(1))


def parse_bps(cell: str):
    """'-1' / '<span style=\"...\">-1</span>' / '—' → int/float or None.
    bps cells in the bonds table are integers (or float-ish), no % suffix."""
    cell = cell.strip()
    if cell in ("—", "-", "", "–"):
        return None
    # Strip span tags first
    cell = re.sub(r"<[^>]+>", "", cell).strip()
    if cell in ("—", "-", "", "–"):
        return None
    try:
        return float(cell)
    except ValueError:
        return None


def _section_block(md: str, heading_pat: str) -> str:
    # tolerate optional prose lines (e.g. "說明：…") between heading and table
    m = re.search(
        rf"### {heading_pat}[^\n]*\n+(?:[^|\n][^\n]*\n+)*(\|.*?)(?=\n\n###|\Z)",
        md, re.DOTALL,
    )
    return m.group(1) if m else ""


def _table_rows(block: str) -> list[list[str]]:
    rows = [r for r in block.splitlines() if r.startswith("|")]
    rows = rows[2:]  # skip header + separator
    return [[c.strip() for c in row.split("|")[1:-1]] for row in rows]


def parse_bonds(md: str) -> list[dict]:
    """### Sovereign Bonds 表格：債別 | 殖利率 | 日變動bps | 月初bps | MTDbps | [收盤日]"""
    block = _section_block(md, "Sovereign Bonds")
    out = []
    for cells in _table_rows(block):
        if len(cells) < 2:
            continue
        row_date = cells[5].strip() if len(cells) >= 6 else None
        if row_date in ("—", "-", "", "–"):
            row_date = None
        out.append({
            "name": cells[0],
            "yield_pct": parse_pct(cells[1]) if len(cells) > 1 else None,
            "daily_bps": parse_bps(cells[2]) if len(cells) > 2 else None,
            "mtd_bps": parse_bps(cells[4]) if len(cells) > 4 else None,
            "closing_date": row_date,
        })
    return out


def parse_fx(md: str) -> list[dict]:
    """### FX 表格：匯率 | 收盤 | 日漲跌 | 月初 | MTD | 年初 | YTD | [收盤日]"""
    block = _section_block(md, "FX")
    out = []
    for cells in _table_rows(block):
        if len(cells) < 3:
            continue
        row_date = cells[7].strip() if len(cells) >= 8 else None
        if row_date in ("—", "-", "", "–"):
            row_date = None
        out.append({
            "name": cells[0],
            "close": parse_num(cells[1]),
            "daily_pct": parse_pct(cells[2]),
            "mtd_pct": parse_pct(cells[4]) if len(cells) > 4 else None,
            "ytd_pct": parse_pct(cells[6]) if len(cells) > 6 else None,
            "closing_date": row_date,
        })
    return out


def parse_commodities(md: str) -> list[dict]:
    """### Commodities 表格：商品 | 收盤 | 日漲跌 | 月初 | MTD | 年初 | YTD | [收盤日]"""
    block = _section_block(md, "Commodities")
    out = []
    for cells in _table_rows(block):
        if len(cells) < 3:
            continue
        row_date = cells[7].strip() if len(cells) >= 8 else None
        if row_date in ("—", "-", "", "–"):
            row_date = None
        out.append({
            "name": cells[0],
            "close": parse_num(cells[1]),
            "daily_pct": parse_pct(cells[2]),
            "mtd_pct": parse_pct(cells[4]) if len(cells) > 4 else None,
            "ytd_pct": parse_pct(cells[6]) if len(cells) > 6 else None,
            "closing_date": row_date,
        })
    return out


def parse_market(md: str) -> dict:
    # closing date — take only first 10 chars (strip parenthetical day-of-week)
    m = re.search(r"closing_date:\s*([\d\-]{10})", md)
    closing_date = m.group(1) if m else None

    # 找「Global Equity Indices」區塊：heading 到下一個 ### 或 EOF
    # 容忍 heading 與表格之間的散文行（例如 "說明：…"）
    block_m = re.search(
        r"### Global Equity Indices[^\n]*\n+(?:[^|\n][^\n]*\n+)*(\|.*?)(?=\n\n###|\Z)",
        md, re.DOTALL
    )
    if not block_m:
        return {"closing_date": closing_date, "indices": [], "summary": ""}

    table = block_m.group(1)
    rows = [r for r in table.splitlines() if r.startswith("|")]
    rows = rows[2:]  # skip header + separator

    indices = []
    for row in rows:
        cells = [c.strip() for c in row.split("|")[1:-1]]
        if len(cells) < 7:
            continue
        name, close, daily, _mtd_open, mtd, _ytd_open, ytd = cells[:7]
        row_date = cells[7].strip() if len(cells) >= 8 else None
        # ignore "—" placeholder in date column
        if row_date in ("—", "-", "", "–"):
            row_date = None
        indices.append({
            "name": name.strip(),
            "name_zh": None,
            "close": parse_num(close),
            "daily_pct": parse_pct(daily),
            "mtd_pct": parse_pct(mtd),
            "ytd_pct": parse_pct(ytd),
            "closing_date": row_date,
        })

    # summary：table block 內最後一個 | 行之後的第一段文字
    # (group(1) 已捕捉到整個 equity section，包含表格後段落)
    block_content = block_m.group(1)
    # find position after last table row (last line starting with |)
    last_pipe = block_content.rfind("\n|")
    if last_pipe == -1:
        summary = ""
    else:
        after_rows = block_content[last_pipe:].lstrip("\n|")
        # strip the last table row itself — find the line end after last |
        after_rows = re.sub(r"^[^\n]*\n", "", block_content[last_pipe + 1:])
        after_rows = after_rows.lstrip("\n")
        summary_m = re.match(r"([^\n].*?)(?:\n\n|\Z)", after_rows, re.DOTALL)
        summary = summary_m.group(1).strip() if summary_m else ""

    return {
        "closing_date": closing_date,
        "indices": indices,
        "bonds": parse_bonds(md),
        "fx": parse_fx(md),
        "commodities": parse_commodities(md),
        "summary": summary,
    }


def main(input_path: str, output_path: str):
    md = read_text_resilient(input_path)
    data = parse_market(md)
    Path(output_path).write_text(
        json.dumps(data, ensure_ascii=False, indent=2), "utf-8"
    )


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
