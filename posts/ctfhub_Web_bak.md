---
title: bak文件
date: 2024-11-11
tags: [CTFHub, Web, 源码泄露, 备份文件]
excerpt: 记录通过探测网站常见的备份文件后缀（.bak）获取源码，从中提取 flag 的过程。
---

思路：题目提示“当开发人员在线上环境中对源代码进行了备份操作，并且将备份文件放在了 web 目录下，就会引起网站源码泄露。”。说明解题核心是**探测网站目录下的隐藏备份文件**。常见的备份文件后缀有 `.bak`、`.swp`、`.old`、`.zip` 等。因为首页通常是 `index.php`，所以尝试访问其备份文件。

问题：
1. 直接访问目标主页，页面仅显示 "Flag in index.php source code."，说明前端无法直接获取 Flag。
2. 页面源码中也没有任何显眼的入口链接或提示。
3. 需要利用常见的备份文件命名规则去猜测 URL。

解决：
1. 确定目标 URL 为：`http://challenge-963fbab8e6cb9a50.sandbox.ctfhub.com:10800`。
2. 尝试在 URL 后拼接常见的备份文件后缀 `index.php.bak`，即访问 `http://challenge-963fbab8e6cb9a50.sandbox.ctfhub.com:10800/index.php.bak`。
3. 浏览器自动下载了一个名为 `index.php.bak` 的文件。
4. 使用代码编辑器（如 VSCode）打开该文件，发现里面是完整的 PHP 源码。
5. 在代码的注释中直接找到了 Flag：`// FLAG: ctfhub{2a1612ca7522c71d5f28b119}`。
6. 回到题目页面，输入该 Flag 并提交，通关。
