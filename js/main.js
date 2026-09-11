// ===== Rabit222 博客核心逻辑 =====
const BASE = window.location.pathname.replace(/\/$/, '');
const API = `${BASE}/posts.json`;
const POSTS_DIR = `${BASE}/posts`;

let allPosts = [];

// marked 配置
marked.setOptions({ breaks: true, gfm: true });
marked.use({ renderer: { code: (code, lang) => {
  const valid = lang && hljs.getLanguage(lang);
  const highlighted = valid ? hljs.highlight(code, { language: lang }).value : code;
  return `<pre><code class="hljs">${highlighted}</code></pre>`;
}}});

// fetch（no-store，永远拿新响应，避免缓存坑）
async function fetchText(url) {
  const res = await fetch(url, { cache: 'no-store' });
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
  const post = allPosts.find(p => p.slug === slug);
  if (!post) { app.innerHTML = '<p>文章不存在。</p>'; return; }

  app.innerHTML = '<div class="loading"><div class="spinner"></div><p>加载中…</p></div>';
  try {
    const md = await fetchText(`${POSTS_DIR}/${slug}.md`);
    const body = md.replace(/^---[\s\S]*?---/, '').trim();
    const html = DOMPurify.sanitize(marked.parse(body));

    // 找上下篇
    const sorted = [...allPosts].sort((a,b) => new Date(b.date) - new Date(a.date));
    const idx = sorted.findIndex(p => p.slug === slug);
    const prev = idx > 0 ? sorted[idx - 1] : null;
    const next = idx < sorted.length - 1 ? sorted[idx + 1] : null;

    const editUrl = `https://github.com/${CONFIG.githubUser}/${CONFIG.repo}/edit/${CONFIG.branch}/${CONFIG.postsDir}/${slug}.md`;

    app.innerHTML = `<article class="article">
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
    window.scrollTo(0, 0);
  } catch (e) {
    app.innerHTML = `<p style="color:var(--accent2)">文章加载失败: ${escapeHtml(e.message)}</p>
      <p style="color:var(--muted);font-size:0.85rem;margin-top:8px">尝试访问 <a href="${POSTS_DIR}/${slug}.md" target="_blank">${POSTS_DIR}/${slug}.md</a> 检查文件是否存在。</p>`;
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

  let html = `<h1 style="color:var(--accent);font-family:var(--font-mono);margin-bottom:20px">// 标签</h1><div class="tag-cloud">`;
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
  let html = `<h1 style="color:var(--accent);font-family:var(--font-mono);margin-bottom:20px">// 归档</h1>`;
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
  app.innerHTML = `<article class="article"><div class="article-body">${html}</div></article>`;
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

// 路由
async function router() {
  const hash = location.hash.slice(2) || '/';
  const app = document.getElementById('app');
  app.innerHTML = '<div class="loading"><div class="spinner"></div><p>加载中…</p></div>';

  if (hash === '/' || hash === 'page/1') {
    document.title = CONFIG.title;
    await renderList(1);
  } else if (hash.startsWith('page/')) {
    await renderList(parseInt(hash.split('/')[1]) || 1);
  } else if (hash.startsWith('post/')) {
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
}

// 启动
(async function init() {
  initTheme();
  initSearch();
  initBackToTop();
  document.getElementById('github-link').href = CONFIG.social.github;
  await loadPosts();
  router();
  window.addEventListener('hashchange', router);
})();
