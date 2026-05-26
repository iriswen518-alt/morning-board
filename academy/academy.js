async function loadCourses() {
  const tabsEl = document.getElementById('course-tabs');
  const panesEl = document.getElementById('course-panes');
  if (!tabsEl || !panesEl) return;
  try {
    const res = await fetch('../data/academy/courses.json');
    if (!res.ok) throw new Error('fetch failed');
    const data = await res.json();
    const courses = data.courses || [];

    const indexes = await Promise.all(courses.map(c =>
      c.active
        ? fetch(`../data/academy/${c.slug}/00_index.json`)
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        : Promise.resolve(null)
    ));

    tabsEl.innerHTML = '';
    panesEl.innerHTML = '';
    courses.forEach((course, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tab' + (i === 0 ? ' active' : '');
      btn.dataset.course = course.slug;
      btn.textContent = course.name;
      tabsEl.appendChild(btn);

      const pane = document.createElement('div');
      pane.className = 'course-pane' + (i === 0 ? ' active' : '');
      pane.dataset.course = course.slug;
      const idx = indexes[i];
      const chapterCount = idx?.chapters?.length || 0;
      const hero = (course.description || course.icon)
        ? `<div class="course-hero">
             <div class="course-hero-icon">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${course.icon || ''}</svg>
             </div>
             <div class="course-hero-meta">
               <h3 class="course-hero-title">${course.name}${chapterCount ? `<span class="course-hero-badge">共 ${chapterCount} 章</span>` : ''}</h3>
               ${course.description ? `<p class="course-hero-desc">${course.description}</p>` : ''}
             </div>
           </div>`
        : '';
      if (!course.active || !idx) {
        pane.innerHTML = hero + '<p class="course-empty">敬請期待</p>';
      } else {
        const items = idx.chapters.map((ch, j) => {
          const href = `chapter.html?course=${encodeURIComponent(course.slug)}&chapter=${encodeURIComponent(ch.slug)}`;
          const desc = ch.description
            ? `<span class="ch-desc">${ch.description}</span>`
            : '';
          return `<li><a href="${href}"><span class="ch-title">${j + 1}. ${ch.title}</span>${desc}</a></li>`;
        }).join('');
        pane.innerHTML = hero + `<ol class="chapter-list">${items}</ol>`;
      }
      panesEl.appendChild(pane);
    });

    tabsEl.addEventListener('click', e => {
      const btn = e.target.closest('button.tab');
      if (!btn) return;
      const slug = btn.dataset.course;
      tabsEl.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === btn));
      panesEl.querySelectorAll('.course-pane').forEach(p => p.classList.toggle('active', p.dataset.course === slug));
    });
  } catch (err) {
    tabsEl.textContent = '載入失敗，請稍後再試。';
    console.error(err);
  }
}

async function loadChapter() {
  const chapterListEl = document.getElementById('chapter-list');
  const heroEl = document.getElementById('chapter-hero');
  const content = document.getElementById('chapter-content');
  const titleEl = document.getElementById('chapter-title');
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
      a.textContent = `${i + 1}. ${ch.title}`;
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
    titleEl.textContent = `${idx.course_name}・${ch.title}`;

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

wireNavToggle();
loadCourses();
loadChapter();
