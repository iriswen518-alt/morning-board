function renderAcademyCards(listEl, items, tabName, opts) {
  listEl.innerHTML = '';
  items.forEach(item => {
    const inactive = item.active === false;
    const badge = inactive ? '<span class="academy-card-badge">敬請期待</span>' : '';
    const inner = `<div class="academy-card-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${item.icon || ''}</svg>
      </div>
      <div class="academy-card-meta">
        <h3 class="academy-card-name">${item.name}${badge}</h3>
        ${item.description ? `<p class="academy-card-desc">${item.description}</p>` : ''}
      </div>`;
    let node;
    if (inactive) {
      node = document.createElement('div');
    } else if (opts && opts.onClick) {
      node = document.createElement('button');
      node.type = 'button';
      node.addEventListener('click', () => opts.onClick(item));
    } else {
      node = document.createElement('a');
      node.href = item.url || `chapter.html?course=${encodeURIComponent(item.slug)}&tab=${tabName || 'courses'}`;
    }
    node.className = 'academy-card';
    node.innerHTML = inner;
    listEl.appendChild(node);
  });
}

async function loadCourses() {
  const listEl = document.getElementById('course-list');
  if (!listEl) return;
  try {
    const res = await fetch('../data/academy/courses.json');
    if (!res.ok) throw new Error('fetch failed');
    const data = await res.json();
    window.coursesData = data.courses || [];
    renderAcademyCards(listEl, window.coursesData, 'courses');
  } catch (err) {
    listEl.textContent = '載入失敗，請稍後再試。';
    console.error(err);
  }
}

async function loadCertifications() {
  const listEl = document.getElementById('cert-list');
  if (!listEl) return;
  try {
    const res = await fetch('../data/academy/certifications.json');
    if (!res.ok) throw new Error('fetch failed');
    const data = await res.json();
    renderAcademyCards(listEl, data.certifications || [], 'certs');
  } catch (err) {
    listEl.textContent = '載入失敗，請稍後再試。';
    console.error(err);
  }
}

// 主題課程／證照考試已改為折疊區塊（<details class="acc-sec">），
// 折疊狀態存 localStorage（與主站 accSection 共用 accCollapsed key）。
function saveAccSec(d) {
  try {
    const map = JSON.parse(localStorage.getItem('accCollapsed') || '{}') || {};
    map[d.dataset.key] = !d.open;
    localStorage.setItem('accCollapsed', JSON.stringify(map));
  } catch (_) { /* 略 */ }
}
function wireAcademyTabs() {
  // 折疊呈現：初始展開狀態沿用使用者上次記憶（沒記憶則用 HTML 預設 open），
  // 並掛上 toggle 監聽以記住之後的開合（用 JS 綁定，避免 inline handler 早於 script 載入而報錯）。
  let map = {};
  try { map = JSON.parse(localStorage.getItem('accCollapsed') || '{}') || {}; } catch (_) { /* 略 */ }
  [['academy-courses', 'atab-courses'], ['academy-certs', 'atab-certs']].forEach(([key, id]) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (map[key] !== undefined) el.open = !map[key];
    el.addEventListener('toggle', () => saveAccSec(el));
  });
}

function renderQuiz(container, ch, course, prev, next) {
  const qs = ch.questions || [];
  let current = 0;
  let score = 0;
  let answered = false;

  function navHtml() {
    let h = '<div class="chapter-nav">';
    h += prev ? `<a href="chapter.html?course=${course}&chapter=${prev.slug}">← ${prev.title}</a>` : '<span></span>';
    h += next ? `<a href="chapter.html?course=${course}&chapter=${next.slug}">${next.title} →</a>` : '<span></span>';
    h += '</div>';
    return h;
  }

  function showQuestion() {
    answered = false;
    const q = qs[current];
    const total = qs.length;
    container.innerHTML = `
      <div class="quiz-wrap">
        <div class="quiz-progress">
          <div class="quiz-progress-bar" style="width:${Math.round(current / total * 100)}%"></div>
        </div>
        <p class="quiz-counter">第 ${current + 1} 題 / 共 ${total} 題</p>
        <p class="quiz-question">${q.text}</p>
        <ul class="quiz-options">
          ${q.options.map((opt, i) => `<li><button class="quiz-opt-btn" data-idx="${i}">${opt}</button></li>`).join('')}
        </ul>
        <div class="quiz-feedback" id="quiz-feedback" style="display:none"></div>
        <div class="quiz-actions" id="quiz-actions" style="display:none">
          <button class="quiz-next-btn" id="quiz-next">${current + 1 < total ? '下一題 →' : '查看結果'}</button>
        </div>
      </div>`;

    container.querySelectorAll('.quiz-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const chosen = parseInt(btn.dataset.idx, 10);
        const correct = q.answer;
        container.querySelectorAll('.quiz-opt-btn').forEach((b, i) => {
          b.disabled = true;
          if (i === correct) b.classList.add('quiz-correct');
          else if (i === chosen) b.classList.add('quiz-wrong');
        });
        if (chosen === correct) score++;
        const fb = document.getElementById('quiz-feedback');
        fb.style.display = '';
        fb.innerHTML = chosen === correct
          ? `<span class="quiz-fb-right">✓ 正確！</span> ${q.explanation || ''}`
          : `<span class="quiz-fb-wrong">✗ 答錯了。</span> 正確答案：${q.options[correct]}。${q.explanation ? ' ' + q.explanation : ''}`;
        document.getElementById('quiz-actions').style.display = '';
      });
    });

    document.getElementById('quiz-next').addEventListener('click', () => {
      current++;
      if (current < qs.length) showQuestion();
      else showResult();
    });
  }

  function showResult() {
    const total = qs.length;
    const pct = Math.round(score / total * 100);
    let grade = pct >= 90 ? '🏆 優秀' : pct >= 70 ? '👍 良好' : pct >= 60 ? '📘 及格' : '📖 需加強';
    container.innerHTML = `
      <div class="quiz-wrap quiz-result">
        <h2>測驗結果</h2>
        <div class="quiz-score-circle">${score}<span>/${total}</span></div>
        <p class="quiz-grade">${grade}　${pct}%</p>
        <p class="quiz-result-msg">${pct >= 70 ? '恭喜完成美股投資課程測驗！' : '建議再複習一次課程內容，加油！'}</p>
        <button class="quiz-restart-btn">重新作答</button>
      </div>
      ${navHtml()}`;
    container.querySelector('.quiz-restart-btn').addEventListener('click', () => {
      current = 0; score = 0; showQuestion();
    });
  }

  showQuestion();
}

async function loadChapter() {
  const chapterListEl = document.getElementById('chapter-list');
  const heroEl = document.getElementById('chapter-hero');
  const content = document.getElementById('chapter-content');
  if (!chapterListEl || !content) return;

  const params = new URLSearchParams(location.search);
  const course = params.get('course');
  const chapterSlug = params.get('chapter');

  if (!course) {
    content.textContent = '缺少課程參數';
    return;
  }

  try {
    const [idxRes, coursesRes] = await Promise.all([
      fetch(`../data/academy/${course}/00_index.json`),
      fetch('../data/academy/courses.json').catch(() => null),
    ]);
    if (!idxRes.ok) throw new Error('index fetch failed');
    const idx = await idxRes.json();
    const coursesData = coursesRes && coursesRes.ok ? await coursesRes.json() : null;
    const courseMeta = coursesData?.courses?.find(c => c.slug === course) || null;

    if (heroEl) {
      const chapterCount = idx.chapters?.length || 0;
      const iconSvg = courseMeta?.icon
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${courseMeta.icon}</svg>`
        : '';
      const fromTab = params.get('tab') || 'courses';
      heroEl.innerHTML = `
        <div class="course-hero">
          ${iconSvg ? `<div class="course-hero-icon">${iconSvg}</div>` : ''}
          <div class="course-hero-meta">
            <h3 class="course-hero-title">
              ${idx.course_name}
              ${chapterCount ? `<span class="course-hero-badge">共 ${chapterCount} 章</span>` : ''}
            </h3>
            ${courseMeta?.description ? `<p class="course-hero-desc">${courseMeta.description}</p>` : ''}
          </div>
        </div>`;
    }

    chapterListEl.innerHTML = '';

    // 手機下拉選單（章節多時比橫向捲動好用）
    const existingSelect = document.getElementById('chapter-select-mobile');
    if (existingSelect) existingSelect.remove();
    const sel = document.createElement('select');
    sel.id = 'chapter-select-mobile';
    sel.className = 'chapter-select-mobile';
    sel.setAttribute('aria-label', '選擇章節');
    // 永遠顯示「選擇章節」提示（切換章節會整頁重載，故提示會復原）
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = '選擇章節';
    placeholder.disabled = true;
    placeholder.selected = true;
    sel.appendChild(placeholder);
    idx.chapters.forEach((ch) => {
      const opt = document.createElement('option');
      opt.value = `chapter.html?course=${encodeURIComponent(course)}&chapter=${ch.slug}`;
      opt.textContent = ch.title;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', () => { if (sel.value) location.href = sel.value; });
    chapterListEl.parentElement.insertBefore(sel, chapterListEl);

    idx.chapters.forEach((ch, i) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `chapter.html?course=${course}&chapter=${ch.slug}`;
      a.textContent = ch.title;
      if (ch.slug === chapterSlug || (!chapterSlug && i === 0)) {
        a.classList.add('current');
      }
      li.appendChild(a);
      chapterListEl.appendChild(li);
    });

    const target = chapterSlug
      ? idx.chapters.find(c => c.slug === chapterSlug)
      : idx.chapters[0];
    if (!target) {
      content.textContent = '找不到章節';
      return;
    }

    const chRes = await fetch(`../data/academy/${course}/${target.file}`);
    if (!chRes.ok) throw new Error('chapter fetch failed');
    const ch = await chRes.json();
    document.title = `${ch.title}・${idx.course_name}・理財小幫手`;
    if (heroEl) {
      const metaEl = heroEl.querySelector('.course-hero-meta');
      if (metaEl && !metaEl.querySelector('.course-hero-chapter')) {
        const crumb = document.createElement('p');
        crumb.className = 'course-hero-chapter';
        crumb.textContent = `目前章節：${ch.title}`;
        metaEl.appendChild(crumb);
      }
    }

    const curIdx = idx.chapters.findIndex(c => c.slug === target.slug);
    const prev = idx.chapters[curIdx - 1];
    const next = idx.chapters[curIdx + 1];

    if (ch.type === 'quiz') {
      renderQuiz(content, ch, course, prev, next);
      return;
    }

    let html = '';
    if (ch.objectives && ch.objectives.length) {
      html += '<details class="section-accordion objectives-accordion"><summary>學習目標</summary><div class="section-body"><ul>';
      for (const obj of ch.objectives) html += `<li>${obj}</li>`;
      html += '</ul></div></details>';
    }
    for (const sec of ch.sections) {
      html += `<details class="section-accordion"><summary>${sec.heading}</summary><div class="section-body">${sec.html}</div></details>`;
    }

    html += '<div class="chapter-nav">';
    html += prev
      ? `<a href="chapter.html?course=${course}&chapter=${prev.slug}">← ${prev.title}</a>`
      : '<span></span>';
    html += next
      ? `<a href="chapter.html?course=${course}&chapter=${next.slug}">${next.title} →</a>`
      : '<span></span>';
    html += '</div>';

    content.innerHTML = html;

    // 自動為子折疊區標上語意 class，讓 CSS 上色
    content.querySelectorAll('.section-body details').forEach(det => {
      const label = det.querySelector('summary')?.textContent?.trim() || '';
      if (/定義|名詞/.test(label)) det.classList.add('det-def');
      else if (/法源|法規|全文/.test(label)) det.classList.add('det-law');
      else if (/問答|話術|問題/.test(label)) det.classList.add('det-qa');
      else if (/錯誤|陷阱/.test(label)) det.classList.add('det-err');
    });

    // Wrap tables for mobile horizontal scroll
    content.querySelectorAll('table').forEach(tbl => {
      if (!tbl.parentElement.classList.contains('table-scroll')) {
        const wrap = document.createElement('div');
        wrap.className = 'table-scroll';
        tbl.parentNode.insertBefore(wrap, tbl);
        wrap.appendChild(tbl);
      }
    });

    if (window.mermaid) {
      window.mermaid.run({ querySelector: '.mermaid' });
    }
  } catch (err) {
    content.textContent = '載入失敗，請稍後再試。';
    console.error(err);
  }
}

function wireNavToggle() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("main-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.addEventListener("click", (e) => {
    if (e.target.closest(".main-tab") && document.body.classList.contains("nav-open")) {
      document.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

function selectTabFromUrl() {
  const params = new URLSearchParams(location.search);
  const tab = params.get('tab');
  if (!tab) return;
  // 折疊呈現：?tab=courses|certs → 展開對應區塊並捲動過去
  const id = tab === 'certs' ? 'atab-certs' : tab === 'courses' ? 'atab-courses' : null;
  const el = id && document.getElementById(id);
  if (el) {
    el.open = true;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

wireNavToggle();
wireAcademyTabs();
loadCourses();
loadCertifications();
loadChapter();
selectTabFromUrl();

