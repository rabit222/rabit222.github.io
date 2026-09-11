/**
 * GitHub 博客核心逻辑
 * ────────────────────
 * 纯前端 SPA，通过 hash 路由切换页面。
 * Markdown 文章存放在 posts/ 目录，索引由 build.py 或 GitHub Actions 自动生成到 posts.json。
 */

(function () {
  "use strict";

  // ========== 工具函数 ==========
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);
  const app = $("#app");

  /** 获取部署基础路径（自动适配 username.github.io/repo/ 子路径） */
  function basePath() {
    let p = window.location.pathname;
    // 去掉 index.html
    p = p.replace(/index\.html$/, "");
    // 确保以 / 结尾
    if (!p.endsWith("/")) p += "/";
    return p;
  }

  /** 发网络请求并缓存 */
  const fetchCache = {};
  async function fetchText(url) {
    if (fetchCache[url]) return fetchCache[url];
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) throw new Error(res.status);
    const text = await res.text();
    fetchCache[url] = text;
    return text;
  }

  /** 格式化日期：2024-01-15 → "2024年1月15日" */
  function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  }

  /** 短日期：MM-DD */
  function shortDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${m}-${dd}`;
  }

  /** HTML 转义 */
  function esc(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /** 估算阅读时间 */
  function readingTime(content) {
    // 中文按字数，英文按词数
    const cn = (content.match(/[\u4e00-\u9fff]/g) || []).length;
    const en = (content.match(/[a-zA-Z]+/g) || []).length;
    const minutes = Math.ceil(cn / 350 + en / 200);
    return Math.max(1, minutes);
  }

  /** 跳转到顶部 */
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ========== 数据加载 ==========
  let postsIndex = null;

  async function loadIndex() {
    if (postsIndex) return postsIndex;
    try {
      const text = await fetchText(basePath() + "posts.json");
      const data = JSON.parse(text);
      postsIndex = Array.isArray(data) ? data : data.posts;
      // 按日期降序排序
      postsIndex.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    } catch (e) {
      console.error("加载 posts.json 失败", e);
      postsIndex = [];
    }
    return postsIndex;
  }

  // ========== Frontmatter 解析 ==========
  function parseFrontmatter(raw) {
    const m = raw.match(/^\ufeff?---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!m) return { data: {}, content: raw };
    const [, fmStr, body] = m;
    const data = {};
    let key = "", val = "", inArr = false, arr = [];
    const flush = () => {
      if (key) {
        if (inArr) { arr.push(val.trim()); data[key] = arr; arr = []; inArr = false; }
        else data[key] = val.trim().replace(/^["']|["']$/g, "");
        key = ""; val = "";
      }
    };
    for (const line of fmStr.split("\n")) {
      if (inArr) {
        if (line.includes("]")) { flush(); continue; }
        if (line.trim().startsWith("-") || line.trim()) { arr.push(line.replace(/^-\s*/, "").trim()); continue; }
      }
      const idx = line.indexOf(":");
      if (idx > -1) {
        flush();
        key = line.slice(0, idx).trim();
        val = line.slice(idx + 1).trim();
        if (val.startsWith("[")) {
          if (val.includes("]")) {
            data[key] = val.replace(/^\[|\]$/g, "").split(",").map(s => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
            key = ""; val = "";
          } else {
            inArr = true; val = "";
          }
        }
      }
    }
    flush();
    return { data, content: body };
  }

  // ========== Markdown 渲染 ==========
  function renderMarkdown(mdContent) {
    if (typeof marked !== "undefined") {
      marked.setOptions({ breaks: true, gfm: true });
    }
    let html = marked.parse(mdContent);
    // 清理 XSS
    html = DOMPurify.sanitize(html, {
      ADD_ATTR: ["target", "rel"],
    });
    return html;
  }

  // 给外链加 target="_blank"
  function addLinkTargets(container) {
    container.querySelectorAll("a[href]").forEach(a => {
      const href = a.getAttribute("href");
      if (href.startsWith("http") && !href.includes(window.location.host)) {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener");
      }
    });
  }

  // 代码高亮
  function highlightCode(container) {
    if (typeof hljs !== "undefined") {
      container.querySelectorAll("pre code").forEach(block => {
        try { hljs.highlightElement(block); } catch (e) { /* 忽略 */ }
      });
    }
  }

  // 生成目录
  function generateTOC(container) {
    const headings = container.querySelectorAll("h2, h3");
    if (headings.length < 3) return null;
    const toc = document.createElement("nav");
    toc.className = "toc";
    const title = document.createElement("div");
    title.className = "toc-title";
    title.textContent = "目录";
    toc.appendChild(title);
    const ol = document.createElement("ol");
    headings.forEach((h, i) => {
      const id = `heading-${i}`;
      h.id = id;
      const li = document.createElement("li");
      if (h.tagName === "H3") li.style.marginLeft = "1.2em";
      const a = document.createElement("a");
      a.href = `#${id}`;
      a.textContent = h.textContent;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById(id).scrollIntoView({ behavior: "smooth" });
      });
      li.appendChild(a);
      ol.appendChild(li);
    });
    toc.appendChild(ol);
    return toc;
  }

  // ========== 页面渲染：首页 / 文章列表 ==========
  async function showHome(tag, page) {
    const posts = await loadIndex();
    let filtered = posts;
    let pageTitle = "最新文章";

    if (tag) {
      filtered = posts.filter(p => (p.tags || []).includes(tag));
      pageTitle = `标签: ${tag}`;
    }

    if (filtered.length === 0) {
      app.innerHTML = `
        <div class="empty-state">
          <div class="emoji">📭</div>
          <p>${tag ? `没有标签为「${esc(tag)}」的文章` : "还没有文章，去 posts/ 目录写一篇试试吧！"}</p>
        </div>`;
      return;
    }

    const perPage = CONFIG.postsPerPage || 10;
    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / perPage));
    page = Math.min(Math.max(1, page || 1), pages);
    const start = (page - 1) * perPage;
    const pagePosts = filtered.slice(start, start + perPage);

    let html = `<h1 class="page-title">${esc(pageTitle)}</h1>`;
    html += '<ul class="post-list">';
    for (const p of pagePosts) {
      const excerpt = p.excerpt || generateExcerptFromContent(p) || "";
      const tags = (p.tags || []).map(t => `<a class="tag" href="#/tag/${encodeURIComponent(t)}">${esc(t)}</a>`).join("");
      const date = p.date ? formatDate(p.date) : "";
      html += `
        <li class="post-card">
          <h2 class="post-card-title">
            <a href="#/post/${encodeURIComponent(p.slug || p.file)}">${esc(p.title)}</a>
          </h2>
          <div class="post-meta">
            ${date ? `<span class="date">${esc(date)}</span>` : ""}
            ${date && tags ? '<span class="dot">·</span>' : ""}
          </div>
          ${excerpt ? `<p class="post-card-excerpt">${esc(excerpt)}</p>` : ""}
          ${tags ? `<div class="tag-list">${tags}</div>` : ""}
        </li>`;
    }
    html += "</ul>";

    // 分页
    if (pages > 1) {
      html += '<div class="pagination">';
      html += `<button onclick="location.hash='#/${tag ? "tag/" + encodeURIComponent(tag) + "/" : ""}${page - 1}'" ${page <= 1 ? "disabled" : ""}>‹ 上一页</button>`;
      for (let i = 1; i <= pages; i++) {
        if (i === page) {
          html += `<span class="current">${i}</span>`;
        } else {
          html += `<button onclick="location.hash='#/${tag ? "tag/" + encodeURIComponent(tag) + "/" : ""}${i}'">${i}</button>`;
        }
      }
      html += `<button onclick="location.hash='#/${tag ? "tag/" + encodeURIComponent(tag) + "/" : ""}${page + 1}'" ${page >= pages ? "disabled" : ""}>下一页 ›</button>`;
      html += "</div>";
    }

    app.innerHTML = html;
  }

  function generateExcerptFromContent(post) {
    // 如果索引里没有 excerpt，此函数返回空（真正的摘要在 build.py 生成）
    return "";
  }

  // ========== 页面渲染：文章详情 ==========
  async function showPost(slug) {
    const posts = await loadIndex();
    const decodedSlug = decodeURIComponent(slug);
    const post = posts.find(p => p.slug === decodedSlug || p.file === decodedSlug || p.file === `posts/${decodedSlug}.md`);

    if (!post) {
      showError("404", "找不到这篇文章", `没有找到 slug 为「${esc(decodedSlug)}」的文章。`);
      return;
    }

    const filePath = post.file.startsWith("posts/") ? post.file : `posts/${post.file}`;
    let raw, fm, mdContent;
    try {
      raw = await fetchText(basePath() + filePath);
      const parsed = parseFrontmatter(raw);
      fm = parsed.data;
      mdContent = parsed.content;
    } catch (e) {
      showError("加载失败", `无法加载文章文件`, `路径: ${esc(filePath)}<br>请确认文件存在且已 push 到 GitHub。`);
      return;
    }

    const title = fm.title || post.title || "无标题";
    const date = fm.date || post.date || "";
    const tags = fm.tags || post.tags || [];
    const author = CONFIG.author || "博主";
    const rtime = readingTime(mdContent);

    // 渲染 Markdown
    const htmlContent = renderMarkdown(mdContent);

    // 构建文章 HTML
    let html = `<article class="article">`;
    html += `
      <header class="article-header">
        <h1 class="article-title">${esc(title)}</h1>
        <div class="article-meta">
          <span class="author">${esc(author)}</span>
          ${date ? `<span class="dot">·</span><span class="date">${formatDate(date)}</span>` : ""}
          <span class="dot">·</span><span>约 ${rtime} 分钟</span>
        </div>
      </header>`;

    html += `<div class="article-body" id="article-body">${htmlContent}</div>`;
    html += "</article>";

    // 文章底部
    const editUrl = `https://github.com/${CONFIG.githubUser}/${CONFIG.repo}/edit/${CONFIG.branch}/${filePath}`;
    html += `
      <footer class="article-footer">
        ${tags.length ? `<div class="tag-list article-tags">${tags.map(t => `<a class="tag" href="#/tag/${encodeURIComponent(t)}">${esc(t)}</a>`).join("")}</div>` : ""}
        <a class="edit-link" href="${editUrl}" target="_blank" rel="noopener">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          在 GitHub 上编辑
        </a>
      </footer>`;

    // 上下篇导航
    const idx = posts.indexOf(post);
    const prev = posts[idx - 1];
    const next = posts[idx + 1];
    html += '<nav class="post-nav">';
    html += prev
      ? `<a class="post-nav-item prev" href="#/post/${encodeURIComponent(prev.slug)}"><div class="post-nav-label">‹ 上一篇</div><div class="post-nav-title">${esc(prev.title)}</div></a>`
      : '<div class="post-nav-item prev placeholder"><div class="post-nav-label">‹ 上一篇</div><div class="post-nav-title">没有更多了</div></div>';
    html += next
      ? `<a class="post-nav-item next" href="#/post/${encodeURIComponent(next.slug)}"><div class="post-nav-label">下一篇 ›</div><div class="post-nav-title">${esc(next.title)}</div></a>`
      : '<div class="post-nav-item next placeholder"><div class="post-nav-label">下一篇 ›</div><div class="post-nav-title">没有更多了</div></div>';
    html += "</nav>";

    app.innerHTML = html;

    // 后处理
    const body = $("#article-body");
    addLinkTargets(body);
    highlightCode(body);
    const toc = generateTOC(body);
    if (toc) {
      const header = $(".article-header");
      header.insertAdjacentElement("afterend", toc);
    }

    scrollToTop();
  }

  // ========== 页面渲染：标签云 ==========
  async function showTags() {
    const posts = await loadIndex();
    const tagMap = {};
    posts.forEach(p => (p.tags || []).forEach(t => { tagMap[t] = (tagMap[t] || 0) + 1; }));
    const sorted = Object.entries(tagMap).sort((a, b) => b[1] - a[1]);

    if (sorted.length === 0) {
      app.innerHTML = `<div class="empty-state"><div class="emoji">🏷️</div><p>还没有标签</p></div>`;
      return;
    }

    let html = `<h1 class="page-title">标签</h1>`;
    html += '<div class="tags-cloud">';
    for (const [tag, count] of sorted) {
      html += `<a class="tag" href="#/tag/${encodeURIComponent(tag)}">${esc(tag)} <span class="count">${count}</span></a>`;
    }
    html += "</div>";
    app.innerHTML = html;
  }

  // ========== 页面渲染：归档 ==========
  async function showArchive() {
    const posts = await loadIndex();
    if (posts.length === 0) {
      app.innerHTML = `<div class="empty-state"><div class="emoji">📦</div><p>暂无文章</p></div>`;
      return;
    }

    // 按年份分组
    const byYear = {};
    posts.forEach(p => {
      const year = (p.date || "未知").slice(0, 4);
      (byYear[year] = byYear[year] || []).push(p);
    });
    const years = Object.keys(byYear).sort().reverse();

    let html = `<h1 class="page-title">归档 <span style="font-size:.9rem;font-weight:400;color:var(--text-tertiary)">(${posts.length} 篇)</span></h1>`;
    for (const year of years) {
      html += `<div class="archive-group"><div class="archive-year">${esc(year)}</div><ul class="archive-list">`;
      for (const p of byYear[year]) {
        html += `<li class="archive-item"><span class="date">${shortDate(p.date)}</span><a href="#/post/${encodeURIComponent(p.slug)}">${esc(p.title)}</a></li>`;
      }
      html += "</ul></div>";
    }
    app.innerHTML = html;
  }

  // ========== 页面渲染：关于 ==========
  function showAbout() {
    const md = CONFIG.aboutContent || "## 关于\n\n暂无内容。请在 `js/config.js` 中编辑。";
    const html = renderMarkdown(md);
    let content = `
      <div class="about-page">
        <div class="author-card">
          <img src="${CONFIG.avatar || ''}" alt="${esc(CONFIG.author || '')}" />
          <div>
            <div class="name">${esc(CONFIG.author || '博主')}</div>
            <div class="bio">${esc(CONFIG.subtitle || '')}</div>
          </div>
        </div>
        <div class="article-body">${html}</div>
      </div>`;
    app.innerHTML = content;
    const body = $(".about-page .article-body");
    if (body) {
      addLinkTargets(body);
      highlightCode(body);
    }
  }

  // ========== 错误页 ==========
  function showError(code, title, desc) {
    app.innerHTML = `
      <div class="error-state">
        <h2>${code} - ${esc(title)}</h2>
        <p>${desc}</p>
        <a href="#/" class="tag">← 回到首页</a>
      </div>`;
  }

  // ========== 路由 ==========
  function handleRoute() {
    let hash = location.hash.replace(/^#/, "") || "/";
    const parts = hash.split("/").filter(Boolean); // e.g. ["post","slug"]

    if (parts.length === 0 || parts[0] === "") {
      // 首页
      showHome(null, 1);
    } else if (parts[0] === "post" && parts[1]) {
      showPost(parts.slice(1).join("/"));
    } else if (parts[0] === "tag") {
      if (!parts[1]) { showTags(); }
      else { showHome(decodeURIComponent(parts[1]), parseInt(parts[2]) || 1); }
    } else if (parts[0] === "tags") {
      showTags();
    } else if (parts[0] === "archive") {
      showArchive();
    } else if (parts[0] === "about") {
      showAbout();
    } else {
      showError("404", "页面不存在", "请检查地址是否正确。");
    }

    // 更新导航高亮
    updateNavActive(hash);
  }

  function updateNavActive(hash) {
    const first = (hash.split("/")[0] || "").toLowerCase();
    $$(".header-nav a").forEach(a => {
      const href = a.getAttribute("href").replace(/^#\//, "");
      a.classList.toggle("active", href === first || (first === "" && href === ""));
    });
  }

  // ========== 搜索 ==========
  function setupSearch() {
    const modal = $("#search-modal");
    const input = $("#search-input");
    const results = $("#search-results");
    const btn = $("#search-btn");
    const close = $("#search-close");

    function open() {
      modal.classList.remove("hidden");
      input.value = "";
      results.innerHTML = "";
      setTimeout(() => input.focus(), 50);
    }
    function closeFn() {
      modal.classList.add("hidden");
    }

    btn.addEventListener("click", open);
    close.addEventListener("click", closeFn);
    modal.addEventListener("click", (e) => { if (e.target === modal) closeFn(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.classList.contains("hidden")) closeFn();
      // 按 / 快捷键打开搜索
      if (e.key === "/" && modal.classList.contains("hidden") && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        open();
      }
    });

    let searchTimer;
    input.addEventListener("input", () => {
      clearTimeout(searchTimer);
      const q = input.value.trim().toLowerCase();
      if (!q) { results.innerHTML = ""; return; }
      searchTimer = setTimeout(async () => {
        const posts = await loadIndex();
        const matched = posts.filter(p =>
          (p.title || "").toLowerCase().includes(q) ||
          (p.excerpt || "").toLowerCase().includes(q) ||
          (p.tags || []).some(t => t.toLowerCase().includes(q))
        ).slice(0, 8);

        if (matched.length === 0) {
          results.innerHTML = `<div class="search-no-result">没有找到相关文章 😅</div>`;
          return;
        }
        results.innerHTML = matched.map(p => `
          <a class="search-result-item" href="#/post/${encodeURIComponent(p.slug)}" onclick="document.getElementById('search-modal').classList.add('hidden')">
            <div class="search-result-title">${esc(p.title)}</div>
            <div class="search-result-excerpt">${esc((p.excerpt || "").slice(0, 80))}…</div>
          </a>
        `).join("");
      }, 200);
    });
  }

  // ========== 主题切换 ==========
  function setupTheme() {
    const toggle = $("#theme-toggle");
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || (prefersDark ? "dark" : "light");
    applyTheme(theme);

    toggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      applyTheme(current === "dark" ? "light" : "dark");
    });

    // 监听系统主题变化（如果用户没手动设置过）
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        applyTheme(e.matches ? "dark" : "light");
      }
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    // 切换 highlight.js 主题
    const light = $("#hljs-light");
    const dark = $("#hljs-dark");
    if (light && dark) {
      light.disabled = theme === "dark";
      dark.disabled = theme === "light";
    }
  }

  // ========== 返回顶部 ==========
  function setupBackToTop() {
    const btn = $("#back-to-top");
    window.addEventListener("scroll", () => {
      btn.classList.toggle("show", window.scrollY > 300);
    });
    btn.addEventListener("click", scrollToTop);
  }

  // ========== 应用配置到页面 ==========
  function applyConfig() {
    document.title = CONFIG.title;
    $("#site-title").textContent = CONFIG.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", CONFIG.description || CONFIG.subtitle || "");
    $("#footer-text").textContent = CONFIG.footer;
    if (CONFIG.social && CONFIG.social.github) {
      $("#github-link").href = CONFIG.social.github;
    } else {
      $("#github-link").style.display = "none";
    }
  }

  // ========== 初始化 ==========
  function init() {
    applyConfig();
    setupTheme();
    setupSearch();
    setupBackToTop();
    handleRoute();
    window.addEventListener("hashchange", handleRoute);
  }

  // DOM 就绪后启动
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
