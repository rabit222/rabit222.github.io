---
title: 临时重定向
date: 2026-09-28
tags: [CTFHub, WEB, HTTP, 重定向]
excerpt: 抓包查看被浏览器丢弃的 302 响应体，利用 cURL 或拦截获取 Flag。
---

思路：这是 HTTP 协议的基础题，页面提示 "No Flag here!"，点击 "Give me Flag" 后浏览器自动跳转。Flag 大概率隐藏在第一次请求的 302 响应包里，需要绕过浏览器的自动重定向行为。

问题：
1. 一开始点击链接后，页面直接跳回了 index.html，全是 "No Flag here!"。
2. F12 开发者工具“网络”面板里看 302 请求的“响应”标签，显示“无法加载响应数据”。
3. 在控制台用 fetch 请求，返回的依然是跳转后的页面内容。

解决：
1. 分析：浏览器为了效率，遇到 302 会自动丢弃中间响应体（Body），直接跳转，导致 F12 看不到。
2. 使用 cURL 命令行工具，输入 `curl -v "http://challenge-xxx/index.php"`，直接原样打印出 HTTP 响应。
3. 在终端的输出中，清晰地看到了 `HTTP/1.1 302 Moved Temporarily`，并在响应体（Body）中直接拿到了 `ctfhub{...}` 并提交通过。
4. 原理验证：响应头中的 `X-Requested-With: XMLHttpRequest` 也暗示了可以用 AJAX 请求头绕过重定向。

补充：
1. 重定向状态码：301（永久重定向，浏览器会缓存）、302/307（临时重定向，每次都会请求服务器）、303（明确要求用 GET 访问新地址）。
2. 浏览器处理流程：浏览器收到 302 与 Location 头后，立刻丢弃当前响应体，自动发起对 Location 的新请求，因此普通抓包看不到 302 的 Body。
3. Fetch API 的坑：`fetch()` 默认会自动跟随重定向，如果想阻止，需要加上 `{ redirect: 'manual' }` 参数。
4. AJAX 技巧：如果请求头带有 `X-Requested-With: XMLHttpRequest`，后端可能判断为异步请求，直接返回数据而不发起 302 重定向。

工具：浏览器开发者工具（Network）、cURL、Burp Suite

踩坑记录：
1. 卡在 F12 响应面板的“无法加载响应数据:没有可显示的内容，因为此请求被重定向了”，一开始以为没抓到包，其实是浏览器故意丢弃了 302 的响应体。
