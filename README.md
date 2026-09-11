# Rabit222 Blog

赛博朋克风格的 GitHub Pages 博客。

## 写文章

在 `posts/` 目录新建 `.md` 文件，开头写 frontmatter：

```markdown
---
title: 文章标题
date: 2024-09-12
tags: [标签1, 标签2]
excerpt: 一句话摘要
---

正文用 Markdown 写...
```

push 到 GitHub → Actions 自动更新索引 → 博客刷新即见。

## 部署

仓库 **Settings → Pages → Source** 选 **GitHub Actions**（不是 branch）。

## 本地预览

```bash
python3 build.py
python3 -m http.server 8000
```
访问 http://localhost:8000
