---
title: Pikachu-SSRF(curl)
date: 2026-11-23
tags: [Pikachu, WEB, SSRF]
excerpt: 用 curl 实现请求转发，支持 file/dict/gopher 等协议。
---

思路：这一关用 curl 请求用户给的 URL。curl 支持的协议比 file_get_contents 多，file:// 能读本地文件，gopher:// 能构造任意 TCP 数据。

问题：
1. 不知道 curl 版和 fgc 版的区别。
2. 试了 file:// 不确定能不能用。
3. 回显看不到完整内容。

解决：
1. 先填一个普通 URL 确认功能正常、有回显。
2. 试 file:///etc/passwd，能读就说明协议没被限制。
3. 用 file:// 读站点配置文件、flag 文件。
4. 拿到内容，提交通过。

补充：
1. curl 支持 http/https/ftp/file/dict/gopher/tftp 等，攻击面比想象的大。
2. gopher:// 可以打 Redis、MySQL 等内网服务，是 SSRF 的高级用法。
3. 防御：URL 白名单 + 禁止内网 + 只允许 http(s)。

工具：浏览器、Burp Suite

踩坑记录：
1. 一开始没意识到 curl 支持 file 协议，只试了 http。
2. file:// 的斜杠数量写错，读不到文件。
3. 回显被截断，用 Burp 看完整响应。

总结：SSRF 的能力边界由"请求库支持哪些协议"决定。curl 版本的能力明显更强，值得优先试 file 和 gopher。
