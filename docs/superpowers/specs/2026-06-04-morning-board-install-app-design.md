# 理財小幫手 — 讓同事安裝 App 設計 / Install-for-Colleagues Design

- **Date:** 2026-06-04
- **Status:** Approved (design), pending implementation plan
- **Owner:** iris wen
- **Live app:** https://iriswen518-alt.github.io/morning-board/

## Goal / 目標

Make it easy for RM colleagues to install the existing 理財小幫手 PWA on their
own phones (iPhone **and** Android). The app is already a complete, installable
PWA (manifest.json with `display: standalone`, service-worker.js, icons). No
rebuild is needed — the work is to (1) guide installation from inside the app and
(2) provide a forwardable share kit.

讓理專同事能輕鬆把現有的 理財小幫手 PWA 裝到自己手機（iPhone 和 Android）。
App 本身已是完整、可安裝的 PWA，不需重做；要做的是「App 內引導安裝」＋「對外分享包」。

## Users / 使用者

- RM colleagues at 板信商銀, mixed iPhone and Android.
- Non-technical; most have never used "Add to Home Screen."

## Decisions (from brainstorming) / 已定決策

| Decision | Choice |
|---|---|
| App type | Installable PWA (Add to Home Screen), **not** App Store |
| Access control | **Public link, no lock** — anyone with the link can open |
| Platforms | **Both iPhone and Android** |
| Approach | **A — in-app Install button + share kit** |

## Non-goals / 範圍外 (YAGNI)

- No App Store / native wrapper, no Apple Developer account.
- No login, password, or any access gating.
- No push notifications.
- No backend / accounts — everything is client-side and static.

## Part 1 — In-app Install helper / App 內安裝幫手 (front-end)

A self-service install prompt inside the existing PWA (`index.html` + `app.js` +
`style.css`).

### Behavior

- **Banner:** a slim dismissible top banner — `📲 把理財小幫手裝到手機` with an
  **安裝** button and a **✕** close.
- **Visibility rules:**
  - Hidden if the app is already installed / running standalone
    (`window.matchMedia('(display-mode: standalone)').matches` **or**
    `navigator.standalone === true` on iOS).
  - Hidden on desktop (no install value for colleagues' phones). Detect via
    coarse pointer / UA; when unsure, prefer hiding on clear desktop only.
  - Hidden permanently once the user taps ✕ (persist a flag in `localStorage`,
    e.g. `mb_install_dismissed=1`).
- **Tap "安裝" — platform-specific:**
  - **Android / Chromium:** capture the `beforeinstallprompt` event on load
    (call `preventDefault()` and stash it). On tap, call `prompt()` to show the
    native one-tap install dialog. After the choice resolves, hide the banner.
  - **iOS Safari:** no install API exists. On tap, open an illustrated bottom
    sheet with the steps:
    `① 點下方的「分享」圖示 → ② 往下捲 → ③ 點「加入主畫面」→ ④ 右上角「加入」`,
    including the iOS Share-icon glyph for clarity.
  - **iOS but not Safari (e.g. Chrome/LINE in-app browser):** show a hint
    `請改用 Safari 開啟才能安裝` (Chrome/in-app browsers on iOS cannot install PWAs).
  - **Android where `beforeinstallprompt` never fired** (already installed, or
    unsupported browser): fall back to a manual-steps sheet
    (`選單 ⋮ → 安裝應用程式／加入主畫面`).

### Placement & style

- Banner injected at the top of the app shell, above the existing content, using
  the existing theme color (`#019AB3`). Must not overlap or break existing tabs.
- Follow existing front-end patterns in `app.js` / `style.css` (e.g. the existing
  cache-bust and render structure). Add a focused, well-named module/section
  rather than scattering logic.

## Part 2 — Share kit / 對外分享包 (forwardable files)

Static artifacts the owner can forward; no hosting required beyond the existing
GitHub Pages URL.

1. **QR code** (PNG) pointing to https://iriswen518-alt.github.io/morning-board/.
2. **Forwardable message** (plain text for LINE / email): one-line intro + link +
   `iPhone 用 Safari 開、Android 用 Chrome 開`.
3. **Two one-page illustrated install guides** (PNG, LINE-friendly): one for
   **iPhone (Safari)**, one for **Android (Chrome)**. These are the "兩個版本."

### How Part 1 and Part 2 fit together

Colleague scans the QR → board opens → the in-app banner pops the install guide
itself. The PNG guides are a backup for anyone who wants to read the steps first.
No backend, no accounts, zero ongoing maintenance.

## Data flow / 資料流

All client-side. Install state derives from `display-mode`, `navigator.standalone`,
and the `beforeinstallprompt` event. No network calls, no storage beyond a single
`localStorage` dismissal flag.

## Edge cases / 邊界情況

- Already installed → no banner (both platforms).
- iOS non-Safari browser → "open in Safari" hint, not the Add-to-Home steps.
- Android `beforeinstallprompt` absent → manual-steps fallback.
- Desktop → banner hidden.
- Dismissed → stays hidden across sessions via `localStorage`.

## Testing / verification / 測試驗證

Manual on real devices + light checks:

- iPhone Safari: banner shows; tapping 安裝 shows correct illustrated steps.
- Android Chrome: `beforeinstallprompt` captured; tap → native install succeeds.
- Already-installed (standalone): no banner on either platform.
- Desktop browser: no banner.
- Existing board functionality unaffected (tabs, tables, sort all still work).
- Bump the `?v=` cache-bust on `app.js` / `style.css` so colleagues get the new
  build immediately; confirm the live files serve the new version after deploy.

## Deliverables & locations / 產出與位置

- Front-end changes in `repo/index.html`, `repo/app.js`, `repo/style.css`.
- Share kit files (QR PNG, message text, two guide PNGs) saved to a folder the
  owner can reach and forward (exact path decided at build time; default to a
  clearly named folder under Downloads or the Obsidian vault per the owner's
  "store locally" preference).

## Rollout / 上線

1. Implement front-end helper; verify on devices.
2. Generate share-kit artifacts.
3. Bump cache-bust, commit only the touched front-end files, push to deploy via
   GitHub Pages; confirm live.
4. Hand the QR + guides to the owner to forward.
