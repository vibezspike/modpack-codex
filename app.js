(function(){

  const navScroll = document.getElementById('navScroll');
  const content = document.getElementById('content');
  const searchBox = document.getElementById('searchBox');
  const recipeCountEl = document.getElementById('recipeCount');
  const gaugeNum = document.getElementById('gaugeNum');
  const gaugeRing = document.getElementById('gaugeRing');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');

  sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));

  // ---------- count total recipes ----------
  let totalRecipes = 0;
  CODEX.sections.forEach(sec => {
    sec.subsections.forEach(sub => { totalRecipes += sub.recipes.length; });
  });

  recipeCountEl.textContent = totalRecipes;
  gaugeNum.textContent = totalRecipes;
  const circumference = 540;
  requestAnimationFrame(() => {
    const offset = 0; // full ring, since this IS the total
    gaugeRing.style.strokeDashoffset = circumference * 0.08; // small gap for style
  });

  // ---------- build sidebar nav ----------
  function buildNav(){
    navScroll.innerHTML = '';
    CODEX.sections.forEach(sec => {
      const group = document.createElement('div');
      group.className = 'nav-group';
      group.dataset.sectionId = sec.id;

      const count = sec.subsections.reduce((a,s) => a + s.recipes.length, 0);

      const btn = document.createElement('button');
      btn.className = 'nav-group-btn';
      btn.innerHTML = `
        <span>${sec.title}</span>
        <span style="display:flex;align-items:center;gap:8px;">
          <span class="count">${count}</span>
          <span class="chev">▶</span>
        </span>`;
      btn.addEventListener('click', () => {
        group.classList.toggle('open');
      });
      group.appendChild(btn);

      const children = document.createElement('div');
      children.className = 'nav-children';

      sec.subsections.forEach((sub, subIdx) => {
        const leaf = document.createElement('button');
        leaf.className = 'nav-leaf';
        leaf.textContent = sub.title || sec.title;
        leaf.dataset.target = `${sec.id}__${subIdx}`;
        leaf.addEventListener('click', () => {
          document.getElementById(`anchor-${sec.id}__${subIdx}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (window.innerWidth <= 880) sidebar.classList.remove('open');
        });
        children.appendChild(leaf);
      });

      group.appendChild(children);
      navScroll.appendChild(group);
    });

    // open first group by default
    const first = navScroll.querySelector('.nav-group');
    if (first) first.classList.add('open');
  }

  // ---------- icon helper ----------
  function iconImgHtml(iconName, altText, sizeClass){
    if (!iconName) return '';
    const urls = (typeof mcIconUrls === 'function') ? mcIconUrls(iconName) : null;
    if (!urls) return '';
    const primary = urls[0];
    const fallback = urls[1];
    // onerror chain: try block texture, then hide image entirely (text stays visible)
    return `<img src="${primary}" alt="${escapeHtml(altText)}" class="item-icon ${sizeClass||''}"
      onerror="this.onerror=null; if(this.src!=='${fallback}'){this.src='${fallback}';} else {this.style.display='none';}">`;
  }

  // ---------- render a crafting grid widget ----------
  function renderGrid(recipe){
    const size = recipe.size || 3;
    const cells = recipe.grid.join('').split('');
    let html = `<div class="cgrid size-${size}">`;
    cells.forEach(ch => {
      const entry = recipe.key ? recipe.key[ch] : null;
      if (ch === ' ' || !entry) {
        html += `<div class="cslot empty"></div>`;
      } else {
        const name = typeof entry === 'string' ? entry : entry.name;
        const icon = typeof entry === 'string' ? null : entry.icon;
        const img = iconImgHtml(icon, name, 'icon-slot');
        const labelHtml = img
          ? `${img}<span class="cslot-label">${escapeHtml(name)}</span>`
          : escapeHtml(name);
        html += `<div class="cslot filled ${img ? 'has-icon' : ''}">${labelHtml}</div>`;
      }
    });
    html += `</div>`;
    return html;
  }

  function renderFlow(recipe){
    const input = recipe.flowInput;
    const inputText = typeof input === 'string' ? input : input.text;
    const inputIcon = typeof input === 'string' ? null : input.icon;
    const inputImg = iconImgHtml(inputIcon, inputText, 'icon-pill');

    let html = `<div class="flow-row">`;
    html += `<div class="io-pill-group"><div class="io-pill guaranteed ${inputImg?'has-icon':''}">${inputImg}<span>${escapeHtml(inputText)}</span></div></div>`;
    html += `<div class="flow-arrow">→</div>`;
    html += `<div class="io-pill-group">`;
    recipe.flowOutputs.forEach(o => {
      const cls = o.guaranteed ? 'io-pill guaranteed' : 'io-pill';
      const img = iconImgHtml(o.icon, o.text, 'icon-pill');
      let label = `<span>${escapeHtml(o.text)}</span>`;
      if (o.qty) label += ` <span class="qty">${escapeHtml(o.qty)}</span>`;
      if (o.chance) label += ` <span class="chance">${escapeHtml(o.chance)}</span>`;
      html += `<div class="${cls} ${img?'has-icon':''}">${img}${label}</div>`;
    });
    html += `</div></div>`;
    return html;
  }

  function badgeClass(type){
    return `card-badge machine-${type}`;
  }

  function badgeLabel(type){
    const map = {
      shaped: 'Shaped Craft',
      shapeless: 'Shapeless Craft',
      milling: 'Create — Milling',
      crushing: 'Create — Crushing',
      splashing: 'Create — Splashing',
      break: 'Block Break'
    };
    return map[type] || type;
  }

  function highlightCode(code){
    let escaped = escapeHtml(code);
    escaped = escaped.replace(/'([^']*)'/g, `<span class="str">'$1'</span>`);
    escaped = escaped.replace(/\b(event|ServerEvents|StartupEvents|BlockEvents|CreateItem|Item|recipes|forEach|function)\b(?=[.(])/g, `<span class="kw">$1</span>`);
    escaped = escaped.replace(/(\/\/.*$)/gm, `<span class="com">$1</span>`);
    return escaped;
  }

  function escapeHtml(str){
    if (str === undefined || str === null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function extractSearchText(recipe){
    let parts = [recipe.output, recipe.id, recipe.note || ''];
    if (recipe.key) {
      Object.values(recipe.key).forEach(v => parts.push(typeof v === 'string' ? v : v.name));
    }
    if (recipe.flowInput) {
      parts.push(typeof recipe.flowInput === 'string' ? recipe.flowInput : recipe.flowInput.text);
    }
    if (recipe.flowOutputs) {
      recipe.flowOutputs.forEach(o => parts.push(o.text));
    }
    return parts.join(' ').toLowerCase();
  }

  function renderRecipeCard(recipe){
    let body = '';
    if (recipe.grid) {
      body += renderGrid(recipe);
    } else if (recipe.flowInput) {
      body += renderFlow(recipe);
    }

    let note = recipe.note ? `<div class="card-note">${escapeHtml(recipe.note)}</div>` : '';
    let configNote = recipe.configId ? `<div class="card-note"><span class="tag-pill">config id</span> ${escapeHtml(recipe.configId)}</div>` : '';
    let code = recipe.code ? `<div class="code-block">${highlightCode(recipe.code)}</div>` : '';

    return `
      <div class="card" data-search="${escapeHtml(extractSearchText(recipe))}">
        <div class="card-head">
          <div class="card-title">${escapeHtml(recipe.output)}</div>
          <div class="${badgeClass(recipe.type)}">${badgeLabel(recipe.type)}</div>
        </div>
        <div class="card-id">${escapeHtml(recipe.id)}</div>
        ${body}
        ${note}
        ${configNote}
        ${code}
      </div>`;
  }

  // ---------- build main content ----------
  function buildContent(){
    content.innerHTML = '';
    CODEX.sections.forEach(sec => {
      const section = document.createElement('section');
      section.className = 'section';
      section.id = `section-${sec.id}`;

      let html = `
        <div class="section-header">
          <h2 class="section-title">${escapeHtml(sec.title)}</h2>
          <span class="section-eyebrow">${escapeHtml(sec.eyebrow || '')}</span>
        </div>`;

      sec.subsections.forEach((sub, subIdx) => {
        html += `<div id="anchor-${sec.id}__${subIdx}"></div>`;
        if (sub.title) html += `<div class="subsection-title">${escapeHtml(sub.title)}</div>`;
        html += `<div class="recipe-grid-wrap">`;
        sub.recipes.forEach(r => { html += renderRecipeCard(r); });
        html += `</div>`;
      });

      section.innerHTML = html;
      content.appendChild(section);
    });
  }

  // ---------- search filter ----------
  searchBox.addEventListener('input', () => {
    const q = searchBox.value.trim().toLowerCase();
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      const match = !q || card.dataset.search.includes(q);
      card.style.display = match ? '' : 'none';
    });
    // hide subsection wraps / sections that have zero visible cards
    document.querySelectorAll('.section').forEach(sec => {
      const visible = sec.querySelectorAll('.card:not([style*="display: none"])').length;
      sec.style.display = visible === 0 && q ? 'none' : '';
    });
  });

  buildNav();
  buildContent();

})();
