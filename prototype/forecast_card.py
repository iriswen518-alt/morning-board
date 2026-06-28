#!/usr/bin/env python3
"""預測卡原型 — 純 Python 趨勢預測（Holt 線性趨勢，無需 Prophet）。

借自 Claude finance dashboard 影片的「Prophet 預測 + 信賴區間」概念，
但用零依賴的 Holt 雙重指數平滑實作，先驗證 UI / 取數，再決定要不要上 Prophet。

產出：
    prototype/forecast.json   預測資料（符合資料合約風格）
    prototype/forecast.html   自繪 SVG 的獨立預測卡（可直接開）

用法：
    python prototype/forecast_card.py            # 預設 ^TWII 加權指數
    python prototype/forecast_card.py ^GSPC 標普500
"""

from __future__ import annotations
import json
import math
import os
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))


def fetch_daily_closes(symbol: str) -> tuple[list[str], list[float]]:
    """從 Yahoo chart API 取近 6 個月日收。失敗時擲出例外。"""
    url = (
        f"https://query1.finance.yahoo.com/v8/finance/chart/"
        f"{urllib.parse.quote(symbol)}?range=6mo&interval=1d"
    )
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    d = json.load(urllib.request.urlopen(req, timeout=20))
    r = d["chart"]["result"][0]
    ts = r["timestamp"]
    closes = r["indicators"]["quote"][0]["close"]
    dates, vals = [], []
    for t, c in zip(ts, closes):
        if c is None:
            continue
        # 轉成 YYYY-MM-DD（UTC 足夠當 x 軸標籤）
        import datetime

        dates.append(datetime.datetime.utcfromtimestamp(t).strftime("%Y-%m-%d"))
        vals.append(float(c))
    return dates, vals


def holt_forecast(
    y: list[float], horizon: int = 10, alpha: float = 0.5, beta: float = 0.2
):
    """Holt 線性趨勢（雙重指數平滑）。
    回傳 (預測值, 下界, 上界)；信賴帶用一步殘差標準差 ×1.96×√步數。
    """
    level = y[0]
    trend = y[1] - y[0]
    fitted = [level]
    for t in range(1, len(y)):
        prev_level = level
        level = alpha * y[t] + (1 - alpha) * (level + trend)
        trend = beta * (level - prev_level) + (1 - beta) * trend
        fitted.append(prev_level + trend)  # 一步預測
    # 殘差標準差
    resid = [y[t] - fitted[t] for t in range(1, len(y))]
    sigma = math.sqrt(sum(e * e for e in resid) / max(1, len(resid)))
    fc, lo, hi = [], [], []
    for h in range(1, horizon + 1):
        pt = level + h * trend
        band = 1.96 * sigma * math.sqrt(h)
        fc.append(pt)
        lo.append(pt - band)
        hi.append(pt + band)
    return fc, lo, hi


def build_html(payload: dict) -> str:
    """自繪 SVG 折線 + 預測信賴帶。寬 720 高 320。"""
    hist = payload["history"]  # [{date,close}]
    fc = payload["forecast"]  # [{step,value,lo,hi}]
    name = payload["name_zh"]
    series = [p["close"] for p in hist] + [f["value"] for f in fc]
    los = [p["close"] for p in hist] + [f["lo"] for f in fc]
    his = [p["close"] for p in hist] + [f["hi"] for f in fc]
    ymin, ymax = min(los), max(his)
    pad = (ymax - ymin) * 0.08 or 1
    ymin, ymax = ymin - pad, ymax + pad
    W, H, L, R, T, B = 720, 320, 48, 16, 16, 28
    n = len(series)

    def x(i):
        return L + (W - L - R) * i / (n - 1)

    def y(v):
        return T + (H - T - B) * (1 - (v - ymin) / (ymax - ymin))

    nh = len(hist)
    hist_pts = " ".join(f"{x(i):.1f},{y(hist[i]['close']):.1f}" for i in range(nh))
    fc_pts = " ".join(
        f"{x(nh - 1 + j):.1f},{y(([hist[-1]['close']] + [f['value'] for f in fc])[j]):.1f}"
        for j in range(len(fc) + 1)
    )
    band_top = [(x(nh - 1), y(hist[-1]["close"]))] + [
        (x(nh + j), y(fc[j]["hi"])) for j in range(len(fc))
    ]
    band_bot = [(x(nh + j), y(fc[j]["lo"])) for j in range(len(fc))][::-1] + [
        (x(nh - 1), y(hist[-1]["close"]))
    ]
    band = " ".join(f"{px:.1f},{py:.1f}" for px, py in band_top + band_bot)

    last = hist[-1]["close"]
    end = fc[-1]["value"]
    chg = (end - last) / last * 100
    arrow = "▲" if chg >= 0 else "▼"
    col = "#c0392b" if chg >= 0 else "#27632a"  # 台股紅漲綠跌

    return f"""<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>預測卡原型 — {name}</title>
<style>
  body{{font-family:-apple-system,"PingFang TC",sans-serif;background:#f4f6f8;margin:0;padding:24px;color:#1a2330}}
  .card{{max-width:760px;margin:0 auto;background:#fff;border-radius:16px;
    box-shadow:0 4px 18px rgba(20,40,80,.08);padding:20px 22px}}
  h2{{font-size:20px;margin:0 0 2px}}
  .sub{{font-size:13px;color:#6b7785;margin-bottom:14px}}
  .big{{font-size:15px;margin:10px 0 0}}
  .big b{{color:{col};font-size:22px}}
  .note{{font-size:12px;color:#8a94a0;margin-top:12px;line-height:1.6}}
  .tag{{display:inline-block;background:#fff3cd;color:#8a6d00;border-radius:6px;
    padding:1px 8px;font-size:12px;font-weight:600;margin-left:6px}}
</style></head><body>
<div class="card">
  <h2>{name} 趨勢預測<span class="tag">預測</span></h2>
  <div class="sub">{payload["source"]}　·　資料日 {hist[-1]["date"]}　·　方法 {payload["method"]}</div>
  <svg viewBox="0 0 {W} {H}" width="100%" role="img">
    <polygon points="{band}" fill="rgba(199,154,0,.14)"/>
    <polyline points="{hist_pts}" fill="none" stroke="#2c3e50" stroke-width="2"/>
    <polyline points="{fc_pts}" fill="none" stroke="#c79a00" stroke-width="2" stroke-dasharray="5 4"/>
    <line x1="{x(nh - 1):.1f}" y1="{T}" x2="{x(nh - 1):.1f}" y2="{H - B}" stroke="#cdd5dd" stroke-dasharray="3 3"/>
  </svg>
  <p class="big">未來 {len(fc)} 個交易日預估 <b>{arrow} {chg:+.1f}%</b>
     （{last:,.0f} → {end:,.0f}），灰金帶為 95% 信賴區間。</p>
  <p class="note">※ 原型：用 Holt 線性趨勢外推，非 Prophet，無季節性。僅示範取數＋UI＋信賴帶呈現，
     <b>不可作為投資建議</b>。要上正式版再評估是否導入 Prophet 並建立日收歷史資料源。</p>
</div></body></html>"""


def main() -> int:
    symbol = sys.argv[1] if len(sys.argv) > 1 else "^TWII"
    name_zh = sys.argv[2] if len(sys.argv) > 2 else "加權指數"
    try:
        dates, closes = fetch_daily_closes(symbol)
    except Exception as e:
        print(f"取數失敗 {symbol}: {e}")
        return 1
    if len(closes) < 20:
        print("資料點不足，無法預測")
        return 1
    fc, lo, hi = holt_forecast(closes, horizon=10)
    payload = {
        "generated_at": dates[-1],
        "symbol": symbol,
        "name_zh": name_zh,
        "source": f"Yahoo 日收 6 個月（{len(closes)} 點）",
        "method": "Holt 線性趨勢 (α=.5 β=.2)",
        "history": [{"date": d, "close": round(c, 2)} for d, c in zip(dates, closes)],
        "forecast": [
            {
                "step": i + 1,
                "value": round(fc[i], 2),
                "lo": round(lo[i], 2),
                "hi": round(hi[i], 2),
            }
            for i in range(len(fc))
        ],
    }
    with open(os.path.join(HERE, "forecast.json"), "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    with open(os.path.join(HERE, "forecast.html"), "w", encoding="utf-8") as f:
        f.write(build_html(payload))
    last, end = closes[-1], fc[-1]
    print(
        f"✓ {name_zh} {symbol}: {last:,.0f} → {end:,.0f} "
        f"({(end - last) / last * 100:+.1f}% 未來 10 日)"
    )
    print(f"  prototype/forecast.json / forecast.html 已產生")
    return 0


if __name__ == "__main__":
    import urllib.parse  # noqa: E402

    sys.exit(main())
