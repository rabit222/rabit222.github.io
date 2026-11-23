---
title: Pikachu-SSRF(file_get_contents)
date: 2026-11-23
tags: [Pikachu, WEB, SSRF]
excerpt: file_get_contents 的实现，受 allow_url_fopen 限制，但仍能读文件、访内网。
---

思路：这一关用 file_get_contents 发请求。它受 allow_url_fopen 控制，协议支持比 curl 少，但 http/https/file 一般都能用。

问题：
1. 填了地址没反应。
2. 不知道能不能用 file://。
3. 和 curl 版表现不一样。

解决：
1. 先确认 allow_url_fopen 是否开启（填个 http 地址看能不能取到内容）。
2. 用 file:// 读本地文件。
3. 用 http 访问内网地址，探测内网服务。
4. 拿到内容，提交通过。

补充：
1. file_get_contents 支持的协议取决于 allow_url_fopen，gopher 一般不支持。
2. 无回显时可以用 error_log 之类做盲打，或者用时间差判断。
3. 防御同 curl 版：白名单 + 禁内网。

工具：浏览器、Burp Suite

踩坑记录：
1. 一开始拿 curl 的技巧套过来，gopher 完全不通。
2. 不知道 allow_url_fopen 开着没有，先测 http 才确认。
3. 内网地址试不通，是端口问题。

总结：实现方式决定攻击面。curl 和 file_get_contents 的差异，本质是"底层库的能力差异"。
