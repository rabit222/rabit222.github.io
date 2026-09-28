---
title: "CTFHub HTTP Method"
date: 2026-09-27
tags: [CTFHub, Web, HTTP, 请求方法]
excerpt: 记录通过修改 HTTP 请求方法获取 flag 的过程。
---

思路：访问靶机后，页面直接提示：“HTTP Method is GET, Use CTF**B Method, I will give you flag.”。同时给出了 Hint：“如果遇到 [HTTP Method Not Allowed] 错误，你应该请求 index.php”。这说明解题核心是**修改 HTTP 请求方法**为题目要求的 `CTF**B`，并针对 `index.php` 发起请求。

问题：
1. 浏览器地址栏直接回车只能发送 GET 请求，无法自定义 `CTF**B` 这种非标准的 HTTP 方法。
2. 不知道怎么构造并发送这种自定义方法的请求。
3. 一开始没有带 `index.php` 路径，可能触发了 `Method Not Allowed` 提示。

解决：
1. 确定目标 URL 为：`http://challenge-1c6285a051a2677d.sandbox.ctfhub.com:10800/index.php`。
2. 由于浏览器地址栏只能发 GET，决定使用浏览器开发者工具（F12）的 Console 面板，利用 `fetch` API 发送自定义请求。
3. 在 Console 中输入以下 JavaScript 代码：
```javascript
fetch("http://challenge-1c6285a051a2677d.sandbox.ctfhub.com:10800/index.php", {method: "CTF**B"})
  .then(res => res.text())
  .then(text => console.log(text));
