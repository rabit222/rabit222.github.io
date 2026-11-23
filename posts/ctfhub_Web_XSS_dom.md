---
title: XSS-DOM型
date: 2026-11-18
tags: [CTFHub, WEB, XSS]
excerpt: 漏洞在前端 JS 里，数据根本没到服务器，服务端日志里看不到 payload。
---

思路：DOM 型 XSS 的输入不经过服务器，前端 JS 直接读取 URL 片段/参数，写进 innerHTML 或 eval。所以服务端返回的 HTML 里看不到 payload，必须读 JS 源码。

问题：
1. 用抓包看服务器响应，怎么都找不到 payload，怀疑环境有问题。
2. 不知道前端代码在哪触发。
3. 知道要看 JS，但不熟悉该找哪些函数。

解决：
1. 打开 F12 看前端源码，搜索 location、hash、search、document.write、innerHTML、eval 这些关键字。
2. 找到读取 URL 参数的代码，确认数据流向：URL → 变量 → 危险 API。
3. 构造 payload 放在 URL 里，让前端逻辑把它写进 DOM，触发弹窗。
4. 提交通过。

补充：
1. 危险汇聚点（sink）：innerHTML、outerHTML、document.write、eval、setTimeout 字符串、jQuery 的 html()。
2. 源头（source）：location.hash、location.search、document.referrer、postMessage。
3. DOM 型 XSS 在服务端日志里完全不可见，所以基于 WAF 的防护很难发现，只能靠前端代码审计。

工具：浏览器 F12、Burp Suite（改 URL）

踩坑记录：
1. 一开始全程在看服务器响应，方向完全错了。
2. 找到了 eval 但把 payload 当成 URL 的 search 参数传，而代码读的是 hash，位置不对。
3. 用 # 传参时发现部分字符要编码，直接写会被浏览器截断。

总结：DOM 型 XSS 是"纯前端漏洞"，服务端只是发了个 shell。做这类题要切到前端视角：读 JS、找 source、找 sink，把数据流串起来。
