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
      node.href = `chapter.html?course=${encodeURIComponent(item.slug)}&tab=${tabName || 'courses'}`;
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
        <div style="margin-bottom: 20px;">
          <a class="cards-back-btn" href="index.html?tab=${fromTab}" style="text-decoration: none;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            返回上頁
          </a>
        </div>
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

    let html = '';
    if (ch.objectives && ch.objectives.length) {
      html += '<div class="objectives"><h3>學習目標</h3><ul>';
      for (const obj of ch.objectives) html += `<li>${obj}</li>`;
      html += '</ul></div>';
    }
    for (const sec of ch.sections) {
      html += `<h2>${sec.heading}</h2>${sec.html}`;
    }

    const curIdx = idx.chapters.findIndex(c => c.slug === target.slug);
    const prev = idx.chapters[curIdx - 1];
    const next = idx.chapters[curIdx + 1];
    html += '<div class="chapter-nav">';
    html += prev
      ? `<a href="chapter.html?course=${course}&chapter=${prev.slug}">← ${prev.title}</a>`
      : '<span></span>';
    html += next
      ? `<a href="chapter.html?course=${course}&chapter=${next.slug}">${next.title} →</a>`
      : '<span></span>';
    html += '</div>';

    content.innerHTML = html;

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

