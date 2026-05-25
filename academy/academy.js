async function loadCourses() {
  const grid = document.getElementById('course-grid');
  if (!grid) return;
  try {
    const res = await fetch('../data/academy/courses.json');
    if (!res.ok) throw new Error('fetch failed');
    const data = await res.json();
    grid.innerHTML = '';
    for (const course of data.courses) {
      const card = document.createElement('a');
      card.className = 'course-card' + (course.active ? '' : ' inactive');
      if (course.active) {
        card.href = `chapter.html?course=${encodeURIComponent(course.slug)}`;
      }
      const meta = course.active ? '點擊進入' : '敬請期待';
      card.innerHTML = `
        <div class="course-name">${course.name}</div>
        <div class="course-meta">${meta}</div>
      `;
      grid.appendChild(card);
    }
  } catch (err) {
    grid.textContent = '載入失敗，請稍後再試。';
    console.error(err);
  }
}

async function loadChapter() {
  const sidebar = document.getElementById('chapter-list');
  const content = document.getElementById('chapter-content');
  const courseNameEl = document.getElementById('course-name');
  const titleEl = document.getElementById('chapter-title');
  if (!sidebar || !content) return;

  const params = new URLSearchParams(location.search);
  const course = params.get('course');
  const chapterSlug = params.get('chapter');

  if (!course) {
    content.textContent = '缺少課程參數';
    return;
  }

  try {
    const idxRes = await fetch(`../data/academy/${course}/00_index.json`);
    if (!idxRes.ok) throw new Error('index fetch failed');
    const idx = await idxRes.json();
    courseNameEl.textContent = idx.course_name;

    sidebar.innerHTML = '';
    idx.chapters.forEach((ch, i) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `chapter.html?course=${course}&chapter=${ch.slug}`;
      a.textContent = `${i + 1}. ${ch.title}`;
      if (ch.slug === chapterSlug || (!chapterSlug && i === 0)) {
        a.classList.add('current');
      }
      li.appendChild(a);
      sidebar.appendChild(li);
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

loadCourses();
loadChapter();
