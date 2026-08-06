/* =========================================================
   今年表現 Market Dashboard — 即時行情分頁的次分頁層（不動 app.js / style.css）
   2026-08-06 次分頁改名：行情卡片→當日盤勢、市場儀表→今年表現，預設期間同步改今年以來
   - 版面：全球市場水平橫條，零軸置中；紅色為漲、綠色為跌
   - 期間：當日漲跌 / 當月漲跌 / 今年以來（chip 切換，記憶於 localStorage）
   - 資料：當日優先取 DATA.live 盤中報價，缺漏時回退 market.json daily_pct；
           當月／今年以來取 market.json 的 mtd_pct / ytd_pct
   - 架構：包裝 window.renderLiveSheet（每 60 秒自動重繪也跟著保留狀態），
           樣式內嵌，不需改 app.js / style.css；中英文版共用同一份檔案
   ========================================================= */
(function () {
  "use strict";

  var LS_VIEW = "mbe_live_view";      // "quotes" | "dash"
  var LS_PERIOD = "mbe_dash_period";  // "daily" | "mtd" | "ytd"

  function getView() {
    try { return localStorage.getItem(LS_VIEW) === "dash" ? "dash" : "quotes"; } catch (_) { return "quotes"; }
  }
  function setView(v) { try { localStorage.setItem(LS_VIEW, v); } catch (_) {} }
  function getPeriod() {
    var p;
    try { p = localStorage.getItem(LS_PERIOD); } catch (_) {}
    return (p === "daily" || p === "mtd" || p === "ytd") ? p : "ytd";
  }
  function setPeriod(p) { try { localStorage.setItem(LS_PERIOD, p); } catch (_) {} }

  /* ---------- styles ---------- */
  var css = "" +
    ".mbd-subtabs{display:flex;gap:8px;margin:0 0 14px}" +
    ".mbd-subtabs button{flex:1;font-family:inherit;font-size:15px;font-weight:600;letter-spacing:.05em;" +
      "padding:9px 0;border-radius:8px;border:1px solid var(--border);background:var(--card-bg);color:var(--brand-deep,#003D91);cursor:pointer}" +
    ".mbd-subtabs button.on{background:var(--brand-deep,#003D91);border-color:var(--brand-deep,#003D91);color:#fff}" +
    ".mbd-wrap{margin:0 0 6px}" +
    ".mbd-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin:2px 0 12px}" +
    ".mbd-title{font-size:18px;font-weight:700;color:var(--brand-deep,#003D91)}" +
    ".mbd-date{font-size:13px;color:var(--text-mute,#77839a)}" +
    ".mbd-chips{display:flex;gap:8px;margin:0 0 14px}" +
    ".mbd-chips button{flex:1;font-family:inherit;font-size:14px;font-weight:600;letter-spacing:.05em;" +
      "padding:8px 0;border-radius:999px;border:1px solid var(--border);background:var(--card-bg);color:var(--brand-deep,#003D91);cursor:pointer}" +
    ".mbd-chips button.on{background:var(--brand-primary,#019AB3);border-color:var(--brand-primary,#019AB3);color:#fff}" +
    /* 深色模式：--brand-deep 會變亮藍，白字放上去對比不足，改深色底 */
    "@media (prefers-color-scheme: dark){" +
      ".mbd-subtabs button.on{background:#0d4f7a;border-color:#0d4f7a;color:#fff}" +
      ".mbd-chips button.on{background:#0b6f80;border-color:#0b6f80;color:#fff}}" +
    ".mbd-axis,.mbd-row{display:grid;grid-template-columns:112px 1fr 66px;align-items:center;gap:8px}" +
    ".mbd-axis{font-size:11.5px;color:var(--text-mute,#77839a);margin:0 0 6px}" +
    ".mbd-axis .mbd-scale{display:flex;justify-content:space-between}" +
    ".mbd-row{padding:4px 0}" +
    // 中英並列時名稱較長：允許換行，不截字
    ".mbd-nm{font-size:13px;line-height:1.3;font-weight:600;color:var(--brand-deep,#003D91);word-break:break-word}" +
    ".mbd-track{position:relative;height:20px;background:rgba(120,140,170,.08);border-radius:4px;overflow:hidden}" +
    ".mbd-track:before{content:'';position:absolute;left:50%;top:0;bottom:0;width:1px;background:var(--border);transform:translateX(-.5px)}" +
    ".mbd-bar{position:absolute;top:4px;bottom:4px;border-radius:3px;min-width:2px}" +
    ".mbd-bar.up{background:var(--up,#d62828)}.mbd-bar.down{background:var(--down,#2a9d8f)}" +
    ".mbd-val{font-size:13px;font-weight:700;text-align:right;font-variant-numeric:tabular-nums}" +
    ".mbd-val.up{color:var(--up,#d62828)}.mbd-val.down{color:var(--down,#2a9d8f)}" +
    ".mbd-val.na{color:var(--text-mute,#77839a);font-weight:500}" +
    ".mbd-note{font-size:12.5px;line-height:1.6;color:var(--text-mute,#77839a);margin:14px 0 0}" +
    ".mbd-live{font-size:11px;font-weight:600;color:var(--brand-primary,#019AB3);margin-left:6px}" +
    "@media (max-width:430px){.mbd-axis,.mbd-row{grid-template-columns:96px 1fr 58px;gap:6px}" +
      ".mbd-nm{font-size:12px}.mbd-val{font-size:12px}.mbd-chips button{font-size:13px;letter-spacing:0}}" +
    "@media (prefers-color-scheme:dark){.mbd-subtabs button,.mbd-chips button{background:transparent;border-color:#39445a}" +
      ".mbd-track{background:rgba(160,180,210,.12)}}";
  var styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ---------- market.json 名稱 → 即時行情 symbol／中文短名 ---------- */
  var NAME_MAP = {
    "S&P 500": ["^GSPC", "標普500"],
    "Nasdaq Composite": ["^IXIC", "那斯達克"],
    "Dow Jones": ["^DJI", "道瓊工業"],
    "PHLX Semiconductor": ["^SOX", "費城半導"],
    "Euro Stoxx 50": ["^STOXX50E", "歐洲50"],
    "DAX": ["^GDAXI", "德國DAX"],
    "FTSE 100": ["^FTSE", "英國FTSE"],
    "CAC 40": ["^FCHI", "法國CAC"],
    "Nikkei 225": ["^N225", "日經225"],
    "TAIEX 加權指數": ["^TWII", "台股加權"],
    "OTC 櫃買加權": ["^TWOII", "櫃買指數"],
    "台指期(近月)": ["TWF:TXF", "台指期近"],
    "KOSPI": ["^KS11", "韓國綜合"],
    "Hang Seng 恆生": ["^HSI", "恆生指數"],
    "Shanghai 上證": ["000001.SS", "上證指數"],
    "CSI 300 滬深300": ["000300.SS", "滬深300"],
    "Nifty 50": ["^NSEI", "印度Nifty"],
    "S&P/ASX 200": ["^AXJO", "澳洲200"],
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // app.js 的 DATA 是 top-level `let`（在 global lexical scope，不掛 window），
  // 故以 typeof 取用，勿改寫成 window.DATA。
  function appData() {
    try { return (typeof DATA !== "undefined" && DATA) ? DATA : {}; } catch (_) { return {}; }
  }

  function liveBySym() {
    var d = appData().live || {};
    var m = {};
    (d.indices || []).forEach(function (r) { if (r && r.symbol) m[r.symbol] = r; });
    return m;
  }

  function rows(period) {
    var raw = appData().market || {};
    var list = raw.indices || raw.equity || [];
    var lv = period === "daily" ? liveBySym() : {};
    return list.map(function (it) {
      var map = NAME_MAP[it.name] || [null, it.name];
      var rec = map[0] ? lv[map[0]] : null;
      var v = null, isLive = false;
      if (period === "daily") {
        // 盤中報價偶有壞值（前收抓錯 → 出現 -99% 這種數字），會把整張圖的刻度拉爆；
        // 指數單日超過 ±25% 視為不可信，退回 market.json 的收盤漲跌。
        var lp = rec && rec.ok !== false && rec.change_pct != null ? rec.change_pct : null;
        if (lp != null && Math.abs(lp) < 25) { v = lp; isLive = true; }
        else if (it.daily_pct != null) v = it.daily_pct;
      } else if (period === "mtd") {
        v = it.mtd_pct != null ? it.mtd_pct : null;
      } else {
        v = it.ytd_pct != null ? it.ytd_pct : null;
      }
      return { name: map[1] || it.name, v: v, live: isLive, date: it.closing_date };
    });
  }

  var LADDER = [1, 2, 3, 5, 8, 10, 15, 20, 30, 40, 50, 75, 100, 150, 200];
  function scaleFor(vals) {
    var mx = 0;
    vals.forEach(function (v) { if (v != null) mx = Math.max(mx, Math.abs(v)); });
    if (!mx) return 1;
    for (var i = 0; i < LADDER.length; i++) if (LADDER[i] >= mx) return LADDER[i];
    return Math.ceil(mx / 100) * 100;
  }

  function fmtPct(v) {
    if (v == null) return "—";
    return (v > 0 ? "+" : "") + v.toFixed(2) + "%";
  }
  function scaleLabel(s) {
    return s >= 10 ? String(s) : String(s);
  }

  function renderDash() {
    var period = getPeriod();
    var data = rows(period);
    if (!data.length) {
      return '<div class="mbd-wrap"><p class="mbd-note">全球市場資料尚未載入，請稍後再試。</p></div>';
    }
    data.sort(function (a, b) {
      if (a.v == null && b.v == null) return 0;
      if (a.v == null) return 1;
      if (b.v == null) return -1;
      return b.v - a.v;
    });
    var s = scaleFor(data.map(function (r) { return r.v; }));
    var anyLive = data.some(function (r) { return r.live; });
    var mk = appData().market || {};
    var date = mk.closing_date || mk.primary_closing_date || "";
    if (!date) { var f = data.find(function (r) { return r.date; }); date = f ? f.date : ""; }

    var chips = [
      ["daily", "當日漲跌"], ["mtd", "當月漲跌"], ["ytd", "今年以來"],
    ].map(function (c) {
      return '<button type="button" data-mbd-period="' + c[0] + '"' +
        (period === c[0] ? ' class="on"' : "") + ">" + c[1] + "</button>";
    }).join("");

    var body = data.map(function (r) {
      var cls = r.v == null ? "na" : (r.v > 0 ? "up" : (r.v < 0 ? "down" : "na"));
      var bar = "";
      if (r.v != null && r.v !== 0) {
        var w = Math.min(50, (Math.abs(r.v) / s) * 50);
        bar = '<i class="mbd-bar ' + (r.v > 0 ? "up" : "down") + '" style="' +
          (r.v > 0 ? "left:50%;" : "right:50%;") + "width:" + w.toFixed(2) + '%"></i>';
      }
      return '<div class="mbd-row">' +
        '<span class="mbd-nm">' + esc(r.name) + "</span>" +
        '<div class="mbd-track">' + bar + "</div>" +
        '<span class="mbd-val ' + cls + '">' + fmtPct(r.v) + "</span></div>";
    }).join("");

    return '<div class="mbd-wrap">' +
      '<div class="mbd-head"><span class="mbd-title">全球市場</span>' +
      '<span class="mbd-date">' + esc(date) + (anyLive ? '<span class="mbd-live">盤中</span>' : "") + "</span></div>" +
      '<div class="mbd-chips">' + chips + "</div>" +
      '<div class="mbd-axis"><span></span><span class="mbd-scale"><span>-' + scaleLabel(s) +
      "%</span><span>0</span><span>+" + scaleLabel(s) + "%</span></span><span></span></div>" +
      body +
      '<p class="mbd-note"><span>零軸置中，紅色為漲、綠色為跌</span> · <span>滿刻度</span> ±' +
      scaleLabel(s) + "% · " +
      (period === "daily"
        ? "<span>當日盤中每分鐘更新，休市時為最近收盤</span>"
        : "<span>當月與今年以來取自收盤資料，台指期因每月換倉不計算</span>") +
      " · <span>數值僅供參考，非投資建議或要約</span></p></div>";
  }

  function renderSubtabs(view) {
    return '<div class="mbd-subtabs">' +
      '<button type="button" data-mbd-view="quotes"' + (view === "quotes" ? ' class="on"' : "") + ">當日盤勢</button>" +
      '<button type="button" data-mbd-view="dash"' + (view === "dash" ? ' class="on"' : "") + ">今年表現</button>" +
      "</div>";
  }

  /* ---------- 包裝 renderLiveSheet ---------- */
  function patchRender() {
    if (typeof window.renderLiveSheet !== "function" || window.renderLiveSheet.__mbdPatched) return;
    var orig = window.renderLiveSheet;
    var patched = function () {
      var html = orig.apply(this, arguments);
      // 單一商品內頁：原樣返回，不加次分頁
      if (/^\s*<section class="live-detail"/.test(String(html))) return html;
      var view = getView();
      return renderSubtabs(view) + (view === "dash" ? renderDash() : html);
    };
    patched.__mbdPatched = true;
    window.renderLiveSheet = patched;
  }

  function rerender() {
    var body = document.getElementById("content");
    if (!body || body.dataset.section !== "live") return;
    var sc = window.scrollY;
    body.innerHTML = window.renderLiveSheet();
    window.scrollTo({ top: sc });
  }

  document.addEventListener("click", function (e) {
    var v = e.target.closest && e.target.closest("[data-mbd-view]");
    if (v) { setView(v.dataset.mbdView); rerender(); return; }
    var p = e.target.closest && e.target.closest("[data-mbd-period]");
    if (p) { setPeriod(p.dataset.mbdPeriod); rerender(); }
  });

  function boot() { patchRender(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
