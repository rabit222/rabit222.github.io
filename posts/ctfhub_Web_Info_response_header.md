---
title: 信息泄露-响应头泄露
date: 2026-11-18
tags: [CTFHub, WEB, 信息泄露]
excerpt: Server、X-Powered-By、Set-Cookie 都在告诉你后端是什么。
---

思路：HTTP 响应头会带一堆元信息：服务器类型、语言版本、框架、调试信息。这些信息本身不直接给 flag，但能帮你判断攻击面。

问题：
1. 一开始只看页面内容，没看响应头。
2. 看到一堆头不知道哪些有用。
3. 知道版本号但不知道怎么利用。

解决：
1. 用 Burp 或 curl -i 看完整响应头。
2. 关注 Server（Apache/Nginx 版本）、X-Powered-By（PHP 版本）、Set-Cookie（框架标识）、X-Debug-Token 这类调试头。
3. 根据版本判断有没有已知漏洞或默认文件，再去找入口。
4. 沿着线索找到 flag，提交通过。

补充：
1. 常见泄探头：Server、X-Powered-By、X-AspNet-Version、X-Runtime、X-Debug-Token、Via、Age（CDN）。
2. 调试模式下框架常会泄露路由、SQL 语句、堆栈（Laravel 的 Ignition、ThinkPHP 的调试页）。
3. 防御：隐藏版本号、关闭调试模式、生产环境不返回堆栈。

工具：Burp Suite、curl -i

踩坑记录：
1. 早期做题只看页面，完全不看头，漏掉过好几次线索。
2. 看到 Server：nginx 就以为是环境信息，没往下想。
3. 有一次响应头里有 X-Debug-Token，顺着它找到了调试接口。

总结：响应头是"免费的侦察信息"。养成习惯：每抓一个请求，先扫一眼请求和响应头，成本几乎为零。
