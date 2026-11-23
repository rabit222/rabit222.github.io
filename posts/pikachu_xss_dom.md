---
title: Pikachu-XSS(DOM型)
date: 2026-11-23
tags: [Pikachu, WEB, XSS]
excerpt: 漏洞在前端 JS，数据不进服务端，服务端日志里看不到。
---

思路：DOM 型 XSS 的输入由前端 JS 读取并写进 DOM，服务端只是发了静态页面。payload 放在 URL 的 # 后面，前端逻辑会把它当 HTML 插入。

问题：
1. 抓包里看不到 payload，怀疑环境有问题。
2. 不知道前端读的是哪个参数。
3. payload 写进去不执行。

解决：
1. F12 读前端源码，找 location.hash、location.search、innerHTML、document.write 之类。
2. 确认数据流：URL → 变量 → 危险汇聚点。
3. 在 URL 后面拼 #<img src=x onerror=alert(1)>，触发执行。
4. 提交通过。

补充：
1. Source（输入源）：location.hash/search、referrer、postMessage。
2. Sink（危险点）：innerHTML、document.write、eval、jQuery 的 html()。
3. 服务端 WAF 对 DOM 型无效，因为 payload 根本不到服务器。

工具：浏览器 F12、Burp Suite

踩坑记录：
1. 全程在看服务器响应，方向错了。
2. payload 放在 search 参数里，但代码读的是 hash。
3. # 后面的特殊字符被浏览器截断，得编码。

总结：DOM 型 XSS 是纯前端漏洞，做这类题要切到前端视角：读 JS、找 source 和 sink、把数据流串起来。
