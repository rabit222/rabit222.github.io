// ===== Rabit222 博客核心逻辑 =====
// slug 是 build.py 直接生成的 URL 编码文件名（含 .md），前端不做任何编码
const BASE = window.location.pathname.replace(/\/$/, '');
const API = `${BASE}/posts.json`;
const POSTS_DIR = `${BASE}/posts`;

let allPosts = [];

// 文章页/子页面统一的「返回首页」入口。
// 手机端（<=640px）顶栏导航整条被 CSS 隐藏，没有这个按钮就会卡在文章里出不去。
const BACK_HOME = '<a class="back-home" href="#/">← 返回首页</a>';

// marked 配置
marked.setOptions({ breaks: true, gfm: true });
marked.use({ renderer: { code: (code, lang) => {
  const valid = lang && hljs.getLanguage(lang);
  const highlighted = valid ? hljs.highlight(code, { language: lang }).value : code;
  return `<pre><code class="hljs">${highlighted}</code></pre>`;
}}});

// fetch（no-store + 时间戳，永远拿新响应）
async function fetchText(url) {
  const sep = url.includes('?') ? '&' : '?';
  const res = await fetch(`${url}${sep}_=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.text();
}

async function loadPosts() {
  try {
    const text = await fetchText(API);
    allPosts = JSON.parse(text);
    return allPosts;
  } catch (e) {
    console.error('加载 posts.json 失败:', e);
    return [];
  }
}

// 渲染列表页
async function renderList(page = 1, filter = null) {
  const app = document.getElementById('app');
  let posts = [...allPosts];
  if (filter) posts = posts.filter(filter);
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  const perPage = CONFIG.perPage;
  const totalPages = Math.max(1, Math.ceil(posts.length / perPage));
  page = Math.min(page, totalPages);
  const start = (page - 1) * perPage;
  const pagePosts = posts.slice(start, start + perPage);

  let html = `<h1 style="color:var(--accent);font-family:var(--font-mono);margin-bottom:20px">// 文章 (${posts.length})</h1><ul class="post-list">`;
  for (const p of pagePosts) {
    // slug 已经是 URL 编码后的完整文件名（含 .md），直接拼接到链接
    html += `<li class="post-item">
      <div class="post-item-title"><a href="#/post/${p.slug}">${escapeHtml(p.title)}</a></div>
      <div class="post-meta">${p.date} · ${(p.tags||[]).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
      <div class="post-excerpt">${escapeHtml(p.excerpt || '')}</div>
    </li>`;
  }
  html += '</ul>';
  if (totalPages > 1) {
    html += '<div style="text-align:center;margin:24px 0">';
    if (page > 1) html += `<a href="#/page/${page-1}" style="margin-right:16px">← 上一页</a>`;
    html += `<span style="color:var(--muted);font-family:var(--font-mono)">${page} / ${totalPages}</span>`;
    if (page < totalPages) html += `<a href="#/page/${page+1}" style="margin-left:16px">下一页 →</a>`;
    html += '</div>';
  }
  app.innerHTML = html;
  window.scrollTo(0, 0);
}

// 渲染文章页
async function renderPost(slug) {
  const app = document.getElementById('app');
  // slug 已经是编码后的完整文件名（含 .md），用原始 raw 字段找文章
  const post = allPosts.find(p => p.slug === slug);
  if (!post) { app.innerHTML = '<p>文章不存在。</p>'; return; }

  app.innerHTML = '<div class="loading"><div class="spinner"></div><p>加载中…</p></div>';
  try {
    // 直接用 slug 拼接路径（slug 已编码）
    const md = await fetchText(`${POSTS_DIR}/${slug}`);
    const body = md.replace(/^---[\s\S]*?---/, '').trim();
    const html = DOMPurify.sanitize(marked.parse(body));

    const sorted = [...allPosts].sort((a,b) => new Date(b.date) - new Date(a.date));
    const idx = sorted.findIndex(p => p.slug === slug);
    const prev = idx > 0 ? sorted[idx - 1] : null;
    const next = idx < sorted.length - 1 ? sorted[idx + 1] : null;

    // GitHub edit 链接用原始文件名（需要原始字符）
    const editUrl = `https://github.com/${CONFIG.githubUser}/${CONFIG.repo}/edit/${CONFIG.branch}/${CONFIG.postsDir}/${post.raw}`;

    app.innerHTML = `<article class="article">
      ${BACK_HOME}
      <div class="article-header">
        <h1 class="article-title">${escapeHtml(post.title)}</h1>
        <div class="article-meta">${post.date} · ${(post.tags||[]).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
      </div>
      <div class="article-body">${html}</div>
      <div class="post-nav">
        ${prev ? `<a href="#/post/${prev.slug}">← ${escapeHtml(prev.title)}</a>` : '<span></span>'}
        ${next ? `<a href="#/post/${next.slug}">${escapeHtml(next.title)} →</a>` : '<span></span>'}
      </div>
      <a class="edit-link" href="${editUrl}" target="_blank">在 GitHub 上编辑 →</a>
    </article>`;
    document.title = `${post.title} · ${CONFIG.title}`;
    enhanceArticle(app, post);
    window.scrollTo(0, 0);
  } catch (e) {
    app.innerHTML = `<p style="color:var(--accent2)">文章加载失败: ${escapeHtml(e.message)}</p>
      <p style="color:var(--muted);font-size:0.85rem;margin-top:8px">尝试访问 <a href="${POSTS_DIR}/${slug}" target="_blank">${POSTS_DIR}/${slug}</a> 检查文件是否存在。</p>`;
  }
}

// 标签页
async function renderTags(tag) {
  const app = document.getElementById('app');
  const tagSet = {};
  allPosts.forEach(p => (p.tags||[]).forEach(t => tagSet[t] = (tagSet[t]||0)+1));

  if (tag) {
    return renderList(1, p => (p.tags||[]).includes(tag));
  }

  let html = `${BACK_HOME}<h1 style="color:var(--accent);font-family:var(--font-mono);margin-bottom:20px">// 标签</h1><div class="tag-cloud">`;
  for (const [t, c] of Object.entries(tagSet).sort((a,b)=>b[1]-a[1])) {
    html += `<a href="#/tags/${encodeURIComponent(t)}"><span class="tag">${escapeHtml(t)} (${c})</span></a>`;
  }
  html += '</div>';
  app.innerHTML = html;
  document.title = `标签 · ${CONFIG.title}`;
}

// 归档页
async function renderArchive() {
  const app = document.getElementById('app');
  const sorted = [...allPosts].sort((a,b) => new Date(b.date) - new Date(a.date));
  let curYear = '';
  let html = `${BACK_HOME}<h1 style="color:var(--accent);font-family:var(--font-mono);margin-bottom:20px">// 归档</h1>`;
  for (const p of sorted) {
    const y = p.date.slice(0, 4);
    if (y !== curYear) { curYear = y; html += `<div class="archive-year">${y}</div>`; }
    html += `<div class="archive-item"><span class="archive-date">${p.date.slice(5)}</span><a href="#/post/${p.slug}">${escapeHtml(p.title)}</a></div>`;
  }
  app.innerHTML = html;
  document.title = `归档 · ${CONFIG.title}`;
}

// 关于页
async function renderAbout() {
  const app = document.getElementById('app');
  const html = DOMPurify.sanitize(marked.parse(CONFIG.about));
  app.innerHTML = `<article class="article">${BACK_HOME}<div class="article-body">${html}</div></article>`;
  document.title = `关于 · ${CONFIG.title}`;
}

// 搜索
function initSearch() {
  const modal = document.getElementById('search-modal');
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');

  document.getElementById('search-btn').addEventListener('click', () => {
    modal.classList.remove('hidden');
    input.focus();
  });
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      modal.classList.remove('hidden');
      input.focus();
    }
    if (e.key === 'Escape') modal.classList.add('hidden');
  });
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { results.innerHTML = ''; return; }
    const matched = allPosts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.excerpt||'').toLowerCase().includes(q) ||
      (p.tags||[]).some(t => t.toLowerCase().includes(q))
    );
    results.innerHTML = matched.length
      ? matched.map(p => `<div class="search-result-item" onclick="location.hash='#/post/${p.slug}';document.getElementById('search-modal').classList.add('hidden')">
          <div class="search-result-title">${escapeHtml(p.title)}</div>
          <div class="search-result-excerpt">${escapeHtml(p.excerpt||'')}</div>
        </div>`).join('')
      : '<p style="color:var(--muted);padding:12px">无匹配结果</p>';
  });
}

// 主题切换
function initTheme() {
  const btn = document.getElementById('theme-toggle');
  const saved = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  btn.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
}

// 返回顶部
function initBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.innerHTML = '↑';
  btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  document.body.appendChild(btn);
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  });
}

// 转义
function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ===== 阅读体验增强 =====

// 1) 顶部阅读进度条
function initReadingProgress() {
  const bar = document.createElement('div');
  bar.className = 'reading-progress';
  document.body.appendChild(bar);
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0})`;
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

// 2) 骨架屏
function skeletonHtml(kind) {
  if (kind === 'article') {
    return `<div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-meta"></div>
      <div class="skeleton skeleton-line"></div>
      <div class="skeleton skeleton-line"></div>
      <div class="skeleton skeleton-line short"></div>`;
  }
  let html = '';
  for (let i = 0; i < 4; i++) {
    html += `<div class="skeleton-card">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-meta"></div>
      <div class="skeleton skeleton-line"></div>
      <div class="skeleton skeleton-line short"></div>
    </div>`;
  }
  return html;
}

// 4) 文章页增强：目录 + 标题锚点
function enhanceArticle(app, post) {
  const body = app.querySelector('.article-body');
  if (!body) return;

  // 目录 + 标题锚点
  const headings = [...body.querySelectorAll('h2, h3')];
  if (headings.length >= 2) {
    const toc = document.createElement('nav');
    toc.className = 'toc';
    const title = document.createElement('div');
    title.className = 'toc-title';
    title.textContent = '// 目录';
    toc.appendChild(title);

    const ul = document.createElement('ul');
    headings.forEach((h, i) => {
      const label = h.textContent.trim();       // 先取文字，再往里塞锚点按钮
      const id = `sec-${i}`;
      h.id = id;

      // 注意：本站是 hash 路由，标题锚点绝不能用 href="#id"
      // —— 那会被 router 当成路由解析成 404。所以只做点击滚动。
      const anchor = document.createElement('button');
      anchor.type = 'button';
      anchor.className = 'heading-anchor';
      anchor.title = '复制本段链接';
      anchor.textContent = '#';
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const url = `${location.origin}${location.pathname}?p=${encodeURIComponent(post.slug)}`;
        if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
        anchor.classList.add('copied');
        setTimeout(() => anchor.classList.remove('copied'), 1200);
      });
      h.appendChild(anchor);

      const li = document.createElement('li');
      li.className = h.tagName === 'H3' ? 'toc-h3' : 'toc-h2';
      const a = document.createElement('a');
      a.href = 'javascript:void(0)';
      a.textContent = label;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        h.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      li.appendChild(a);
      ul.appendChild(li);
    });
    toc.appendChild(ul);

    const header = app.querySelector('.article-header');
    if (header) header.insertAdjacentElement('afterend', toc);
    else body.insertAdjacentElement('beforebegin', toc);
  }
}

// 路由
async function router() {
  const hash = location.hash.slice(2) || '/';
  const app = document.getElementById('app');
  app.classList.remove('page-enter');
  // 骨架屏：文章页用文章骨架，其余用列表骨架
  app.innerHTML = skeletonHtml(hash.startsWith('post/') ? 'article' : 'list');

  if (hash === '/' || hash === 'page/1') {
    document.title = CONFIG.title;
    await renderList(1);
  } else if (hash.startsWith('page/')) {
    await renderList(parseInt(hash.split('/')[1]) || 1);
  } else if (hash.startsWith('post/')) {
    // 直接用编码后的 slug，不再 decode
    await renderPost(hash.slice(5));
  } else if (hash.startsWith('tags/')) {
    await renderTags(decodeURIComponent(hash.slice(5)));
  } else if (hash === 'tags') {
    await renderTags();
  } else if (hash === 'archive') {
    await renderArchive();
  } else if (hash === 'about') {
    await renderAbout();
  } else {
    app.innerHTML = '<p>404 - 页面不存在 <a href="#/">返回首页</a></p>';
  }

  // 入场动画：每次路由切换都重新触发
  void app.offsetWidth;
  app.classList.add('page-enter');
}

// 启动
(async function init() {
  initTheme();
  initSearch();
  initBackToTop();
  initReadingProgress();
  document.getElementById('github-link').href = CONFIG.social.github;
  await loadPosts();
  router();
  window.addEventListener('hashchange', router);
})();
