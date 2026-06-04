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
