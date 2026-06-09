function renderAcademyCards(listEl, items) {
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
    } else {
      node = document.createElement('a');
      node.href = `chapter.html?course=${encodeURIComponent(item.slug)}`;
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
    renderAcademyCards(listEl, data.courses || []);
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
    renderAcademyCards(listEl, data.certifications || []);
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
      const cards = document.getElementById('atab-cards');
      if (courses) courses.hidden = which !== 'courses';
      if (certs) certs.hidden = which !== 'certs';
      if (cards) cards.hidden = which !== 'cards';
      if (which === 'cards') {
        loadCards();
      }
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
wireAcademyTabs();
loadCourses();
loadCertifications();
loadChapter();

// ==========================================
// Zettelkasten Card Notes Graph Interaction
// ==========================================

let cardsLoading = false;

async function loadCards() {
  const listEl = document.getElementById('cards-cat-list');
  if (!listEl) return;
  if (window.cardsData) {
    renderCardsCategories(window.cardsData.categories);
    return;
  }
  if (cardsLoading) return;
  cardsLoading = true;
  listEl.textContent = '載入中…';
  
  try {
    const res = await fetch('../data/academy/cards.json');
    if (!res.ok) throw new Error('cards fetch failed');
    const data = await res.json();
    window.cardsData = data;
    renderCardsCategories(data.categories || []);
  } catch (err) {
    listEl.textContent = '載入失敗，請稍後再試。';
    console.error(err);
  } finally {
    cardsLoading = false;
  }
}

function renderCardsCategories(categories) {
  const listEl = document.getElementById('cards-cat-list');
  if (!listEl) return;
  listEl.innerHTML = '';
  listEl.hidden = false;
  
  const graphView = document.getElementById('cards-graph-view');
  if (graphView) graphView.hidden = true;
  
  categories.forEach(cat => {
    const inactive = cat.active === false;
    const badge = inactive ? '<span class="academy-card-badge">敬請期待</span>' : '';
    
    let node;
    if (inactive) {
      node = document.createElement('div');
    } else {
      node = document.createElement('a');
      node.href = '#';
    }
    node.className = 'academy-card';
    node.innerHTML = `
      <div class="academy-card-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          ${cat.icon}
        </svg>
      </div>
      <div class="academy-card-meta">
        <h3 class="academy-card-name">${cat.name}${badge}</h3>
        <p class="academy-card-desc">${inactive ? '內容建置中，敬請期待。' : `點擊查看「${cat.name}」關聯圖與卡片筆記。`}</p>
      </div>
    `;
    if (!inactive) {
      node.addEventListener('click', (e) => {
        e.preventDefault();
        showCategoryGraph(cat);
      });
    }
    listEl.appendChild(node);
  });
}

let activeSimulation = null;

function renderCardsList(container, chapters) {
  if (!chapters || !chapters.length) {
    container.innerHTML = '<div class="folder-empty">（此主題目前無卡片筆記）</div>';
    return;
  }
  
  let html = '';
  chapters.forEach(ch => {
    html += `<div class="cards-list-chapter">`;
    html += `<h3>${ch.title}</h3>`;
    html += `<ul>`;
    ch.cards.forEach(card => {
      const idHtml = card.id ? `<span class="cards-list-id">${card.id}</span>` : '';
      html += `<li>${idHtml}<a class="cards-list-link" data-path="${card.path}">${card.name}</a></li>`;
    });
    html += `</ul>`;
    html += `</div>`;
  });
  container.innerHTML = html;
  
  container.querySelectorAll('.cards-list-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openCardNoteModal(link.getAttribute('data-path'));
    });
  });
}

function showCategoryGraph(category) {
  const listEl = document.getElementById('cards-cat-list');
  const graphView = document.getElementById('cards-graph-view');
  const titleEl = document.getElementById('cards-view-title');
  const canvasEl = document.getElementById('cards-canvas');
  const listContainer = document.getElementById('cards-list-container');
  const canvasContainer = document.getElementById('cards-canvas-container');
  const toggleListBtn = document.getElementById('toggle-list-btn');
  const toggleGraphBtn = document.getElementById('toggle-graph-btn');
  
  if (listEl) listEl.hidden = true;
  if (graphView) graphView.hidden = false;
  if (titleEl) titleEl.textContent = `卡片筆記・${category.name}`;
  
  // Set default view to List View
  if (listContainer) listContainer.hidden = false;
  if (canvasContainer) canvasContainer.hidden = true;
  if (toggleListBtn) toggleListBtn.classList.add('active');
  if (toggleGraphBtn) toggleGraphBtn.classList.remove('active');
  
  if (activeSimulation) {
    activeSimulation.stop();
    activeSimulation = null;
  }
  if (canvasEl) canvasEl.innerHTML = '';
  
  // Render list view
  if (listContainer) {
    renderCardsList(listContainer, category.graph.chapters);
  }
  
  // Setup toggle button click handlers
  if (toggleListBtn && toggleGraphBtn) {
    toggleListBtn.onclick = () => {
      toggleListBtn.classList.add('active');
      toggleGraphBtn.classList.remove('active');
      if (listContainer) listContainer.hidden = false;
      if (canvasContainer) canvasContainer.hidden = true;
      if (activeSimulation) {
        activeSimulation.stop();
      }
    };
    
    toggleGraphBtn.onclick = () => {
      toggleListBtn.classList.remove('active');
      toggleGraphBtn.classList.add('active');
      if (listContainer) listContainer.hidden = true;
      if (canvasContainer) canvasContainer.hidden = false;
      
      // Render the force-directed graph on demand
      if (canvasEl && !canvasEl.innerHTML) {
        renderD3Graph(canvasEl, category.graph, category.name);
      } else if (activeSimulation) {
        activeSimulation.alpha(0.3).restart();
      }
    };
  }
  
  const backBtn = document.getElementById('cards-back-btn');
  if (backBtn) {
    const newBackBtn = backBtn.cloneNode(true);
    backBtn.parentNode.replaceChild(newBackBtn, backBtn);
    newBackBtn.addEventListener('click', () => {
      if (activeSimulation) {
        activeSimulation.stop();
        activeSimulation = null;
      }
      if (canvasEl) canvasEl.innerHTML = '';
      if (listContainer) listContainer.innerHTML = '';
      if (graphView) graphView.hidden = true;
      if (listEl) listEl.hidden = false;
    });
  }
}

function renderD3Graph(container, data, title) {
  container.innerHTML = '';
  if (!window.d3 || !data || !data.nodes) {
    container.textContent = '無法載入圖形庫。';
    return;
  }
  
  const d3 = window.d3;
  const W = container.clientWidth || 900;
  const H = container.clientHeight || 560;
  
  const svg = d3.select(container).append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .style('display', 'block');
    
  const root = svg.append('g');
  
  const zoom = d3.zoom()
    .scaleExtent([0.12, 5])
    .on('zoom', (ev) => {
      root.attr('transform', ev.transform);
    });
    
  svg.call(zoom).on('dblclick.zoom', null);
  
  const nodes = data.nodes.map(n => Object.assign({}, n));
  const byId = {};
  nodes.forEach(n => { byId[n.id] = n; });
  
  const links = (data.edges || [])
    .filter(e => byId[e.source] && byId[e.target])
    .map(e => ({ source: e.source, target: e.target }));
    
  const deg = {};
  const nbr = {};
  nodes.forEach(n => { nbr[n.id] = new Set(); });
  links.forEach(l => {
    deg[l.source] = (deg[l.source] || 0) + 1;
    deg[l.target] = (deg[l.target] || 0) + 1;
    nbr[l.source].add(l.target);
    nbr[l.target].add(l.source);
  });
  
  const palette = ['#4e79a7','#f28e2c','#e15759','#76b7b2','#59a14f','#edc949','#af7aa1','#ff9da7','#9c755f','#bab0ab'];
  const groups = (data.groups || []).slice();
  nodes.forEach(n => {
    if (groups.indexOf(n.group) < 0) groups.push(n.group);
  });
  
  const gi = {};
  groups.forEach((g, i) => { gi[g] = i; });
  
  function colorOf(g) {
    return (g === '其他' || g === '跨類連入') ? '#9aa6b2' : palette[(gi[g] || 0) % palette.length];
  }
  
  const K = Math.max(1, groups.length);
  const R = Math.min(W, H) * 0.38;
  const cx = W / 2;
  const cy = H / 2;
  const anchor = {};
  
  groups.forEach((g, i) => {
    const a = (i / K) * 2 * Math.PI - Math.PI / 2;
    anchor[g] = { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
  });
  
  function rad(d) {
    return d.ext ? 4.5 : (d.moc ? 10.5 : (6 + Math.min(7.5, (deg[d.id] || 0))));
  }
  
  function isHub(d) {
    return !!d.moc;
  }
  
  const sim = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(48).strength(0.12))
    .force('charge', d3.forceManyBody().strength(-140))
    .force('x', d3.forceX(d => (anchor[d.group] || { x: cx }).x).strength(0.28))
    .force('y', d3.forceY(d => (anchor[d.group] || { y: cy }).y).strength(0.28))
    .force('collide', d3.forceCollide(d => rad(d) + 7));
    
  activeSimulation = sim;
  
  const link = root.append('g')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', '#c7d2dd')
    .attr('stroke-opacity', 0.45)
    .attr('stroke-width', 1);
    
  const node = root.append('g')
    .selectAll('g')
    .data(nodes)
    .join('g')
    .attr('class', 'node-group')
    .call(d3.drag()
      .on('start', (ev, d) => {
        if (!ev.active) sim.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (ev, d) => {
        d.fx = ev.x;
        d.fy = ev.y;
      })
      .on('end', (ev, d) => {
        if (!ev.active) sim.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }));
      
  node.append('circle')
    .attr('r', rad)
    .attr('fill', d => colorOf(d.group))
    .attr('fill-opacity', d => d.ext ? 0.45 : 1)
    .attr('stroke', d => d.moc ? '#003D91' : '#fff')
    .attr('stroke-width', d => d.moc ? 2.5 : 1.3);
    
  const label = node.append('text')
    .text(d => d.name)
    .attr('x', d => rad(d) + 4)
    .attr('y', 4)
    .attr('font-size', d => d.moc ? 13.5 : 11.5)
    .attr('font-weight', d => d.moc ? 700 : 400)
    .attr('fill', '#1a2733')
    .attr('paint-order', 'stroke')
    .attr('stroke', '#fff')
    .attr('stroke-width', 3)
    .attr('stroke-linejoin', 'round')
    .style('display', d => isHub(d) ? null : 'none');
    
  function setHL(keep, linkActive, accent) {
    node.select('circle').attr('opacity', d => keep.has(d.id) ? 1 : 0.1);
    label.style('display', d => keep.has(d.id) ? null : 'none');
    link.attr('stroke', l => linkActive(l) ? (accent || '#019AB3') : '#c7d2dd')
        .attr('stroke-opacity', l => linkActive(l) ? 0.95 : 0.03)
        .attr('stroke-width', l => linkActive(l) ? 2.2 : 1);
  }
  
  function resetHL() {
    node.select('circle').attr('opacity', 1);
    label.style('display', d => isHub(d) ? null : 'none');
    link.attr('stroke', '#c7d2dd')
        .attr('stroke-opacity', 0.45)
        .attr('stroke-width', 1);
  }
  
  let locked = false;
  
  function focusNode(id) {
    const keep = new Set([id]);
    (nbr[id] || new Set()).forEach(x => keep.add(x));
    setHL(keep, l => l.source.id === id || l.target.id === id, colorOf((byId[id] || {}).group));
  }
  
  function focusGroup(g) {
    const keep = new Set();
    nodes.forEach(n => { if (n.group === g) keep.add(n.id); });
    setHL(keep, l => keep.has(l.source.id) && keep.has(l.target.id), colorOf(g));
  }
  
  node.on('mouseenter', (ev, d) => {
    if (!locked) focusNode(d.id);
  }).on('mouseleave', () => {
    if (!locked) resetHL();
  });
  
  node.on('click', (ev, d) => {
    ev.stopPropagation();
    locked = true;
    focusNode(d.id);
    showGraphDetail(container, d);
  });
  
  svg.on('click', (ev) => {
    if (ev.target === svg.node()) {
      locked = false;
      resetHL();
      closeGraphDetail(container);
    }
  });
  
  sim.on('tick', () => {
    link.attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
    node.attr('transform', d => `translate(${d.x},${d.y})`);
  });
  
  // Render Legend
  const legend = document.createElement('div');
  legend.className = 'zk-graph-legend';
  const cnt = {};
  nodes.forEach(n => { if (!n.ext) cnt[n.group] = (cnt[n.group] || 0) + 1; });
  
  legend.innerHTML = `
    <div class="zk-graph-legend-header">小學堂課程</div>
    ${groups.filter(g => g !== '跨類連入').map(g => `
      <button class="zk-graph-legend-item" data-g="${g}">
        <span class="zk-graph-legend-dot" style="background:${colorOf(g)}"></span>
        <span>${g}</span>
        <span class="zk-graph-legend-count">${cnt[g] || 0}</span>
      </button>
    `).join('')}
  `;
  container.appendChild(legend);
  legend.addEventListener('click', (ev) => {
    const item = ev.target.closest('.zk-graph-legend-item');
    if (!item) return;
    locked = true;
    focusGroup(item.getAttribute('data-g'));
  });
  
  // Auto Zoom Fit
  setTimeout(() => {
    try {
      const b = { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 };
      nodes.forEach(n => {
        b.x0 = Math.min(b.x0, n.x);
        b.y0 = Math.min(b.y0, n.y);
        b.x1 = Math.max(b.x1, n.x);
        b.y1 = Math.max(b.y1, n.y);
      });
      const gw = b.x1 - b.x0 || 1;
      const gh = b.y1 - b.y0 || 1;
      const k = Math.min(1.4, 0.82 * Math.min(W / gw, H / gh));
      const tx = W / 2 - k * (b.x0 + gw / 2);
      const ty = H / 2 - k * (b.y0 + gh / 2);
      svg.transition().duration(450)
        .call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(k));
    } catch (e) {
      console.error('zoom fit error', e);
    }
  }, 950);
}

function showGraphDetail(container, d) {
  let detail = container.querySelector('.zk-graph-detail');
  if (!detail) {
    detail = document.createElement('div');
    detail.className = 'zk-graph-detail';
    container.appendChild(detail);
  }
  
  const pathText = d.group && d.group !== '其他' && d.group !== '跨類連入'
    ? `${d.group} › ${d.name}`
    : d.name;
    
  detail.innerHTML = `
    <button class="zk-graph-detail-close" aria-label="關閉">✕</button>
    <div class="zk-graph-detail-path">${pathText}${d.ext ? ' (跨類連入)' : ''}</div>
    <div class="zk-graph-detail-title">${d.name}</div>
    <button class="zk-graph-detail-open" data-path="${d.path}">
      開啟卡片筆記 ›
    </button>
  `;
  detail.style.display = 'block';
  
  detail.querySelector('.zk-graph-detail-close').addEventListener('click', () => {
    detail.style.display = 'none';
  });
  
  detail.querySelector('.zk-graph-detail-open').addEventListener('click', () => {
    openCardNoteModal(d.path);
  });
}

function closeGraphDetail(container) {
  const detail = container.querySelector('.zk-graph-detail');
  if (detail) detail.style.display = 'none';
}

function openCardNoteModal(path) {
  if (!window.cardsData || !window.cardsData.notes) return;
  const htmlContent = window.cardsData.notes[path];
  if (htmlContent === undefined) {
    console.error('Note not found in cardsData:', path);
    return;
  }
  
  const title = path.split('/').pop().replace(/\.md$/, '').replace(/＿/g, ' ');
  const cleanTitle = title.replace(/^\d+(?:\.\d+)*\s+/, ''); // clean moc prefix
  
  const modal = document.getElementById('card-note-modal');
  const titleEl = document.getElementById('zk-modal-title');
  const bodyEl = document.getElementById('zk-modal-body');
  
  if (modal && titleEl && bodyEl) {
    titleEl.textContent = cleanTitle;
    bodyEl.innerHTML = htmlContent;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeCardNoteModal() {
  const modal = document.getElementById('card-note-modal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

function linkKey(s) {
  s = s.split('|')[0].split('#')[0].trim();
  s = s.split('/').pop();
  if (s.toLowerCase().endsWith('.md')) {
    s = s.slice(0, -3);
  }
  return s.trim().replace(/＿/g, '_');
}

function openCardByName(targetName) {
  if (!window.cardsData || !window.cardsData.notes) return;
  const key = Object.keys(window.cardsData.notes).find(k => {
    const lastPart = k.split('/').pop();
    return linkKey(lastPart) === linkKey(targetName);
  });
  if (key) {
    openCardNoteModal(key);
  } else {
    alert(`找不到此卡片筆記：${targetName}`);
  }
}

function wireZkModalEvents() {
  const modal = document.getElementById('card-note-modal');
  if (!modal) return;
  
  const closeBtn = document.getElementById('zk-modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeCardNoteModal);
  }
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeCardNoteModal();
    }
    
    const wikilink = e.target.closest('.zk-wikilink');
    if (wikilink) {
      e.preventDefault();
      const target = wikilink.getAttribute('data-target');
      openCardByName(target);
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCardNoteModal();
    }
  });
}

wireZkModalEvents();
