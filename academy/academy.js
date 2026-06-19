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

function wireAcademyTabs() {
  const buttons = document.querySelectorAll('.academy-toptabs .tab[data-atab]');
  if (!buttons.length) return;
  buttons.forEach(t => {
    t.addEventListener('click', () => {
      buttons.forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      const which = t.dataset.atab;
      const courses = document.getElementById('atab-courses');
      const certs = document.getElementById('atab-certs');
      if (courses) courses.hidden = which !== 'courses';
      if (certs) certs.hidden = which !== 'certs';
    });
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
      html += '<div class="objectives"><h3>學習目標</h3><ul>';
      for (const obj of ch.objectives) html += `<li>${obj}</li>`;
      html += '</ul></div>';
    }
    for (const sec of ch.sections) {
      html += `<h2>${sec.heading}</h2>${sec.html}`;
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
  if (tab) {
    const btn = document.querySelector(`.academy-toptabs .tab[data-atab="${tab}"]`);
    if (btn) {
      btn.click();
    }
  }
}

wireNavToggle();
wireAcademyTabs();
loadCourses();
loadCertifications();
loadChapter();
selectTabFromUrl();

