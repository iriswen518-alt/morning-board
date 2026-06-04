# 理財小幫手 安裝頁 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated 安裝 (install) page styled like the 小學堂 page that guides RM colleagues to install the existing 理財小幫手 PWA on iPhone and Android, plus a forwardable QR share kit.

**Architecture:** A new standalone static page `install/index.html` mirrors `academy/index.html` (topbar + main-nav + cards + home-fab + footer), reuses `style.css`, adds `install.css` and `install.js`. `install.js` detects the visitor's platform, highlights the matching card, and wires the Android `beforeinstallprompt` one-tap button. A local Python script generates a QR PNG (shown on the page and forwarded). The home page nav gets one new 安裝 entry. Everything is client-side and static — no backend.

**Tech Stack:** Vanilla HTML/CSS/JS PWA, existing `style.css` + academy CSS patterns, Python `qrcode` lib (already installed), Playwright (already used in repo) for a smoke test, GitHub Pages for deploy.

**Repo root for all paths below:** `/Users/iriswen/scripts/morning_board/repo`

---

### Task 1: Install page skeleton + content (`install/index.html`)

**Files:**
- Create: `install/index.html`

- [ ] **Step 1: Create the page**

Create `install/index.html` with this exact content:

```html
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#019AB3">
<title>理財小幫手・安裝到手機</title>
<link rel="stylesheet" href="../style.css?v=20260604-0918">
<link rel="stylesheet" href="install.css?v=20260604-1">
<style>
  .home-fab { display: none; }
  @media (max-width: 640px) {
    .nav-toggle,
    .main-nav { display: none !important; }
    .home-fab {
      display: inline-flex;
      position: fixed;
      right: 18px;
      bottom: calc(18px + env(safe-area-inset-bottom, 0px));
      z-index: 90;
      align-items: center;
      gap: 6px;
      padding: 10px 16px;
      border-radius: 999px;
      background: linear-gradient(135deg, #019AB3, #17B5AD);
      color: #fff;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 6px 18px rgba(1, 154, 179, 0.32);
    }
    .home-fab svg { width: 18px; height: 18px; flex: 0 0 18px; stroke: currentColor; }
  }
</style>
</head>
<body>

<header class="topbar">
  <h1>理財小幫手</h1>
</header>

<nav class="main-nav">
  <a class="main-tab" href="../#market"><svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18"/></svg><span>全球市場</span></a>
  <a class="main-tab" href="../#news"><svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h13a2 2 0 0 1 2 2v11a2 2 0 0 0 2-2V8"/><path d="M4 5v13a2 2 0 0 0 2 2h13"/><path d="M8 9h7M8 13h7M8 17h5"/></svg><span>重要新聞</span></a>
  <a class="main-tab" href="../#funds"><svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 20h18"/><rect x="5" y="13" width="3" height="7" rx="0.5"/><rect x="10.5" y="9" width="3" height="11" rx="0.5"/><rect x="16" y="5" width="3" height="15" rx="0.5"/></svg><span>精選基金</span></a>
  <a class="main-tab" href="../#obonds"><svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h9l4 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M14 3v5h5"/><path d="M8 13h8M8 17h5"/><circle cx="15.5" cy="17" r="1.7"/></svg><span>精選海外債</span></a>
  <a class="main-tab" href="../#usstocks"><svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 14l3-3 3 3 3-5"/><path d="M14 9h3v3"/></svg><span>海外股票</span></a>
  <a class="main-tab" href="../#insurance"><svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v5c0 4.5-3.2 8.5-8 10-4.8-1.5-8-5.5-8-10V6l8-3z"/><path d="M9 12l2.2 2.2L15.5 10"/></svg><span>精選保險</span></a>
  <a class="main-tab" href="../#alloc"><svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3v9h9"/><path d="M12 12L5.5 17"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/></svg><span>資產配置</span></a>
  <a class="main-tab" href="../academy/"><svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6a2 2 0 0 1 2-2h11l3 3v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M8 8h7M8 12h7M8 16h5"/></svg><span>小學堂</span></a>
  <a class="main-tab active" href="index.html"><svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v10"/><path d="M8 11l4 4 4-4"/><path d="M5 21h14"/></svg><span>安裝</span></a>
</nav>

<main class="install-main">
  <div class="install-hero">
    <div class="install-hero-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M11 18h2"/></svg>
    </div>
    <div class="install-hero-meta">
      <h2 class="install-hero-title">📲 安裝 理財小幫手到手機</h2>
      <p class="install-hero-desc">把它加到手機主畫面，之後一點圖示就能打開，全螢幕、像一個真正的 App。免下載、免帳號。</p>
    </div>
  </div>

  <p id="installed-note" class="install-installed" hidden>✅ 你已經安裝好了，可以直接從主畫面打開。</p>

  <div id="install-grid" class="install-grid">
    <section id="ios-card" class="install-card">
      <h3 class="install-card-title">iPhone（請用 Safari 開啟）</h3>
      <p id="ios-non-safari-hint" class="install-hint" hidden>⚠️ 目前不是用 Safari 開啟，請改用 Safari 開這個頁面才能安裝。</p>
      <ol class="install-steps">
        <li>點畫面下方的「分享」<span class="ios-share-glyph" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v13"/><path d="M8 7l4-4 4 4"/><path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"/></svg></span>圖示</li>
        <li>在選單往下捲動</li>
        <li>點「加入主畫面」</li>
        <li>右上角點「加入」即完成</li>
      </ol>
    </section>

    <section id="android-card" class="install-card">
      <h3 class="install-card-title">Android（請用 Chrome 開啟）</h3>
      <button id="android-install-btn" class="install-btn" type="button" hidden>一鍵安裝</button>
      <p id="android-installed-msg" class="install-installed" hidden>✅ 已安裝，可從主畫面打開。</p>
      <p class="install-hint">若沒看到「一鍵安裝」按鈕，請手動安裝：</p>
      <ol class="install-steps">
        <li>點右上角選單「⋮」</li>
        <li>點「安裝應用程式」或「加入主畫面」</li>
        <li>點「安裝」即完成</li>
      </ol>
    </section>
  </div>

  <section class="qr-card">
    <h3 class="install-card-title">用手機掃描安裝</h3>
    <p class="install-hint">同事用手機相機掃這個 QR code，就會打開這一頁。</p>
    <img class="qr-img" src="qr.png" alt="安裝頁 QR code" width="220" height="220">
  </section>
</main>

<a class="home-fab" href="../" aria-label="回首頁">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12l9-9 9 9"/><path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"/></svg>
  <span>首頁</span>
</a>

<footer class="disclaimer">
  資料僅供內部參考，不構成任何投資建議
</footer>

<script src="install.js?v=20260604-1"></script>
</body>
</html>
```

- [ ] **Step 2: Verify structure**

Run: `cd /Users/iriswen/scripts/morning_board/repo && grep -c "install-card" install/index.html`
Expected: `2` (two platform cards). Also confirm both ids exist:
Run: `grep -oE "id=\"(ios-card|android-card|android-install-btn|install-grid|installed-note)\"" install/index.html | sort -u | wc -l`
Expected: `5`

- [ ] **Step 3: Commit**

```bash
cd /Users/iriswen/scripts/morning_board/repo
git add install/index.html
git commit -m "feat(install): add 安裝 page skeleton styled like 小學堂"
```

---

### Task 2: Install page styles (`install/install.css`)

**Files:**
- Create: `install/install.css`

- [ ] **Step 1: Create the stylesheet**

Create `install/install.css` with this exact content:

```css
/* 安裝頁 —— 主站 style.css 已負責 topbar / main-nav / footer；
   此檔只負責安裝頁專屬版型，沿用 academy 的卡片風格。 */

:root {
  --brand-primary: #019AB3;
  --brand-accent: #17B5AD;
  --brand-deep: #003D91;
  --install-bg-soft: #f5fafb;
  --install-border: #e2e8ee;
  --install-muted: #6b7785;
}

.install-main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px 64px;
}

.install-hero {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 18px 20px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #e8f5f6 0%, #def1f2 100%);
  border: 1px solid rgba(1, 154, 179, 0.18);
  border-radius: 12px;
}
.install-hero-icon {
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-accent));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(1, 154, 179, 0.22);
}
.install-hero-icon svg { width: 26px; height: 26px; }
.install-hero-meta { flex: 1; min-width: 0; }
.install-hero-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--brand-deep);
  margin: 0 0 4px;
  line-height: 1.3;
}
.install-hero-desc {
  font-size: 13px;
  color: var(--install-muted);
  margin: 0;
  line-height: 1.55;
}

.install-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}
.install-card {
  padding: 18px 20px;
  background: var(--install-bg-soft);
  border: 1px solid var(--install-border);
  border-radius: 12px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.install-card.is-target {
  border-color: var(--brand-primary);
  box-shadow: 0 4px 14px rgba(1, 154, 179, 0.18);
  background: #fff;
}
.install-card-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--brand-deep);
  margin: 0 0 10px;
}
.install-steps {
  margin: 0;
  padding-left: 22px;
  color: var(--brand-deep);
}
.install-steps li {
  font-size: 14px;
  line-height: 1.9;
}
.ios-share-glyph {
  display: inline-flex;
  vertical-align: middle;
  margin: 0 3px;
  color: var(--brand-primary);
}
.ios-share-glyph svg { width: 17px; height: 17px; }

.install-btn {
  display: inline-block;
  padding: 11px 24px;
  margin-bottom: 12px;
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-accent));
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(1, 154, 179, 0.25);
}
.install-btn:hover { filter: brightness(1.05); }

.install-hint {
  font-size: 12.5px;
  color: var(--install-muted);
  margin: 0 0 8px;
  line-height: 1.55;
}
.install-installed {
  font-size: 14px;
  font-weight: 600;
  color: var(--brand-primary);
  margin: 0 0 10px;
}

.qr-card {
  padding: 18px 20px;
  background: var(--install-bg-soft);
  border: 1px solid var(--install-border);
  border-radius: 12px;
  text-align: center;
}
.qr-img {
  width: 220px;
  height: 220px;
  margin-top: 8px;
  background: #fff;
  border-radius: 8px;
  padding: 8px;
}

@media (max-width: 640px) {
  .install-main { padding: 24px 16px 64px; }
  .install-hero { padding: 14px 16px; gap: 12px; }
  .install-hero-icon { width: 40px; height: 40px; flex: 0 0 40px; }
  .install-hero-title { font-size: 16px; }
}
```

- [ ] **Step 2: Verify**

Run: `cd /Users/iriswen/scripts/morning_board/repo && grep -c "is-target" install/install.css`
Expected: `1` (the highlight rule exists).

- [ ] **Step 3: Commit**

```bash
cd /Users/iriswen/scripts/morning_board/repo
git add install/install.css
git commit -m "feat(install): add 安裝 page styles (academy card style)"
```

---

### Task 3: Platform detection + one-tap install (`install/install.js`)

**Files:**
- Create: `install/install.js`

- [ ] **Step 1: Create the script**

Create `install/install.js` with this exact content:

```js
// 安裝頁邏輯：判斷裝置、亮顯對應卡片、Android beforeinstallprompt 一鍵安裝。
(function () {
  "use strict";

  var ua = navigator.userAgent || "";
  var isStandalone =
    (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
    window.navigator.standalone === true;
  var isIOS =
    /iP(hone|od|ad)/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/.test(ua);
  // Safari only：排除 Chrome/CriOS/FxiOS/Android 等內嵌瀏覽器
  var isSafari = /^((?!chrome|crios|fxios|android|edg).)*safari/i.test(ua);

  var deferredPrompt = null;

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
    var btn = document.getElementById("android-install-btn");
    if (btn) btn.hidden = false;
  });

  function show(id) {
    var el = document.getElementById(id);
    if (el) el.hidden = false;
  }
  function highlight(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add("is-target");
  }

  function ready() {
    if (isStandalone) {
      show("installed-note");
      var grid = document.getElementById("install-grid");
      if (grid) grid.hidden = true;
      return;
    }

    if (isIOS) {
      highlight("ios-card");
      if (!isSafari) show("ios-non-safari-hint");
    } else if (isAndroid) {
      highlight("android-card");
    }

    var btn = document.getElementById("android-install-btn");
    if (btn) {
      btn.addEventListener("click", function () {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function () {
          deferredPrompt = null;
          btn.hidden = true;
          show("android-installed-msg");
        });
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready);
  } else {
    ready();
  }
})();
```

- [ ] **Step 2: Verify syntax**

Run: `cd /Users/iriswen/scripts/morning_board/repo && node --check install/install.js && echo OK`
Expected: `OK` (no syntax errors).

- [ ] **Step 3: Commit**

```bash
cd /Users/iriswen/scripts/morning_board/repo
git add install/install.js
git commit -m "feat(install): platform detection + Android one-tap install"
```

---

### Task 4: QR code + share kit (`make_install_qr.py`)

**Files:**
- Create: `/Users/iriswen/scripts/morning_board/make_install_qr.py`
- Generates: `repo/install/qr.png`, `~/Downloads/理財小幫手_安裝分享包/qr.png`, `~/Downloads/理財小幫手_安裝分享包/分享訊息.txt`

- [ ] **Step 1: Create the generator script**

Create `/Users/iriswen/scripts/morning_board/make_install_qr.py` with this exact content:

```python
#!/usr/bin/env python3
"""產生安裝頁 QR code 與分享包。QR 指向 GitHub Pages 上的安裝頁。"""
import os
import qrcode

URL = "https://iriswen518-alt.github.io/morning-board/install/"

REPO_QR = os.path.expanduser("~/scripts/morning_board/repo/install/qr.png")
SHARE_DIR = os.path.expanduser("~/Downloads/理財小幫手_安裝分享包")
SHARE_QR = os.path.join(SHARE_DIR, "qr.png")
SHARE_MSG = os.path.join(SHARE_DIR, "分享訊息.txt")

MESSAGE = (
    "【理財小幫手】每日市場、精選基金／海外債／保險、小學堂都在這裡 📲\n"
    f"安裝教學頁：{URL}\n"
    "iPhone 請用 Safari 開、Android 請用 Chrome 開，照頁面步驟加到主畫面即可。\n"
    "免下載、免帳號。"
)


def main():
    os.makedirs(SHARE_DIR, exist_ok=True)
    qr = qrcode.QRCode(box_size=10, border=2)
    qr.add_data(URL)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    for path in (REPO_QR, SHARE_QR):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        img.save(path)
        print(f"[done] QR -> {path}")
    with open(SHARE_MSG, "w", encoding="utf-8") as f:
        f.write(MESSAGE + "\n")
    print(f"[done] message -> {SHARE_MSG}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run it**

Run: `cd /Users/iriswen/scripts/morning_board && python3 make_install_qr.py`
Expected: three `[done]` lines printing the QR and message paths.

- [ ] **Step 3: Verify the QR is a valid PNG**

Run: `cd /Users/iriswen/scripts/morning_board/repo && file install/qr.png`
Expected: output contains `PNG image data`.

- [ ] **Step 4: Commit**

```bash
cd /Users/iriswen/scripts/morning_board/repo
git add install/qr.png
git commit -m "feat(install): add QR code pointing to 安裝 page"
# Note: make_install_qr.py lives outside the repo (local helper) and is not committed here.
```

---

### Task 5: Add 安裝 entry to the home page nav (`index.html`)

**Files:**
- Modify: `index.html` (insert one nav link after the 小學堂 link at line ~95)

- [ ] **Step 1: Insert the 安裝 nav link**

In `index.html`, find the 小學堂 nav link block that ends with:

```html
    <span>小學堂</span>
  </a>
</nav>
```

Replace it with (adds the 安裝 link before `</nav>`):

```html
    <span>小學堂</span>
  </a>
  <a class="main-tab" href="install/" id="install-link" style="text-decoration:none;">
    <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 3v10"/>
      <path d="M8 11l4 4 4-4"/>
      <path d="M5 21h14"/>
    </svg>
    <span>安裝</span>
  </a>
</nav>
```

- [ ] **Step 2: Verify**

Run: `cd /Users/iriswen/scripts/morning_board/repo && grep -c 'href="install/"' index.html`
Expected: `1`

- [ ] **Step 3: Commit**

```bash
cd /Users/iriswen/scripts/morning_board/repo
git add index.html
git commit -m "feat(install): add 安裝 entry to home nav"
```

---

### Task 6: Playwright smoke test

**Files:**
- Create: `/Users/iriswen/scripts/morning_board/test_install_page.py` (local test, outside the published repo)

- [ ] **Step 1: Write the test**

Create `/Users/iriswen/scripts/morning_board/test_install_page.py` with this exact content:

```python
#!/usr/bin/env python3
"""安裝頁 smoke test：起本機 server，用 Playwright 驗證版面與裝置亮顯。"""
import http.server
import socketserver
import threading
import os
from playwright.sync_api import sync_playwright

REPO = os.path.expanduser("~/scripts/morning_board/repo")
PORT = 8765
BASE = f"http://localhost:{PORT}/install/"

IPHONE_UA = ("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
             "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")
ANDROID_UA = ("Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 "
              "(KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36")


def serve():
    os.chdir(REPO)
    handler = http.server.SimpleHTTPRequestHandler
    httpd = socketserver.TCPServer(("", PORT), handler)
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()
    return httpd


def main():
    httpd = serve()
    failures = []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()

            # 1) Structure present (default desktop UA)
            page = browser.new_page()
            page.goto(BASE)
            for sel in ([".install-hero-title", "#ios-card", "#android-card",
                         ".qr-img", "#install-grid"]):
                if page.query_selector(sel) is None:
                    failures.append(f"missing element: {sel}")
            page.close()

            # 2) iPhone UA highlights the iOS card
            ctx = browser.new_context(user_agent=IPHONE_UA)
            page = ctx.new_page()
            page.goto(BASE)
            cls = page.get_attribute("#ios-card", "class") or ""
            if "is-target" not in cls:
                failures.append("iPhone UA did not highlight #ios-card")
            ctx.close()

            # 3) Android UA highlights the Android card
            ctx = browser.new_context(user_agent=ANDROID_UA)
            page = ctx.new_page()
            page.goto(BASE)
            cls = page.get_attribute("#android-card", "class") or ""
            if "is-target" not in cls:
                failures.append("Android UA did not highlight #android-card")
            ctx.close()

            browser.close()
    finally:
        httpd.shutdown()

    if failures:
        print("FAIL:")
        for f in failures:
            print("  -", f)
        raise SystemExit(1)
    print("PASS: install page smoke test")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run the test**

Run: `cd /Users/iriswen/scripts/morning_board && python3 test_install_page.py`
Expected: `PASS: install page smoke test`

If it fails on a missing Playwright browser, run `python3 -m playwright install chromium` once, then re-run.

- [ ] **Step 3: Commit (test stays local, nothing to commit in repo)**

No repo commit — the test lives outside the published repo. Note completion only.

---

### Task 7: Cache-bust, deploy, verify live

**Files:**
- Modify: `index.html` (bump `app.js`/`style.css` `?v=`), `install/index.html` (bump `install.css`/`install.js` `?v=`)

- [ ] **Step 1: Bump cache-bust on changed front-end files**

Run:
```bash
cd /Users/iriswen/scripts/morning_board/repo && VBUST=$(date '+%Y%m%d-%H%M') && \
/usr/bin/sed -i '' -E "s|app\.js\?v=[0-9-]+|app.js?v=${VBUST}|; s|style\.css\?v=[0-9-]+|style.css?v=${VBUST}|" index.html && \
/usr/bin/sed -i '' -E "s|install\.css\?v=[0-9A-Za-z-]+|install.css?v=${VBUST}|; s|install\.js\?v=[0-9A-Za-z-]+|install.js?v=${VBUST}|; s|style\.css\?v=[0-9-]+|style.css?v=${VBUST}|" install/index.html && \
echo "bumped to $VBUST"
```
Expected: `bumped to <timestamp>`

- [ ] **Step 2: Commit the cache-bust**

```bash
cd /Users/iriswen/scripts/morning_board/repo
git add index.html install/index.html
git commit -m "chore(install): bump cache-bust for 安裝 page release"
```

- [ ] **Step 3: Deploy (rebase on origin, then push)**

Run:
```bash
cd /Users/iriswen/scripts/morning_board/repo && git pull --rebase origin main 2>&1 | tail -3 && git push origin main 2>&1 | tail -3
```
Expected: a `main -> main` push line. (If pull aborts on unstaged unrelated files like `data/system_prompt.json`, those are not ours — leave them; the push still proceeds because we are not behind.)

- [ ] **Step 4: Wait for GitHub Pages build, then verify the live page**

Run:
```bash
for i in $(seq 1 12); do S=$(gh api repos/iriswen518-alt/morning-board/pages/builds/latest 2>/dev/null | python3 -c "import sys,json;print(json.load(sys.stdin).get('status'))"); echo "[try $i] $S"; [ "$S" = "built" ] && break; sleep 15; done
curl -s -o /dev/null -w "%{http_code}\n" https://iriswen518-alt.github.io/morning-board/install/
curl -s -o /dev/null -w "%{http_code}\n" https://iriswen518-alt.github.io/morning-board/install/qr.png
curl -s https://iriswen518-alt.github.io/morning-board/install/install.js | grep -c "beforeinstallprompt"
```
Expected: status reaches `built`; both `curl` HTTP codes are `200`; the grep prints `1`.

- [ ] **Step 5: Manual device check (owner)**

- iPhone Safari: open the install page → iPhone card highlighted → steps correct → "加入主畫面" works.
- Android Chrome: open the install page → "一鍵安裝" appears → tap installs.
- After install, reopen the page in standalone → "✅ 你已經安裝好了" note shows, cards hidden.

---

## Self-Review

- **Spec coverage:** Dedicated install page styled like 小學堂 (Tasks 1-3); two platform sections / 兩個版本 (Task 1 ios-card + android-card); Android one-tap via beforeinstallprompt (Task 3); iOS Safari steps + non-Safari hint (Tasks 1+3); already-installed note (Tasks 1+3); QR + share kit (Task 4); home nav entry (Task 5); testing via node --check + Playwright + manual (Tasks 3,6,7); cache-bust + deploy + live verify (Task 7). All spec sections map to a task.
- **Placeholder scan:** none — every file's full content and every command is given.
- **Type/id consistency:** ids used in install.js (`installed-note`, `install-grid`, `ios-card`, `android-card`, `ios-non-safari-hint`, `android-install-btn`, `android-installed-msg`) all exist in the Task 1 HTML; the highlight class `is-target` matches the CSS rule in Task 2; the Playwright selectors in Task 6 match the same ids/classes.
