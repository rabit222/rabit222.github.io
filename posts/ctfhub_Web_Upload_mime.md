---
title: 文件上传-MIME绕过
date: 2026-11-18
tags: [CTFHub, WEB, 文件上传]
excerpt: 服务器只信 Content-Type 请求头，改成 image/png 就过了。
---

思路：这题校验的是请求头里的 Content-Type，不看文件本身。判断依据来自客户端，等于让客户端自己声明"我是安全的"。

问题：
1. 传 php 被提示"文件类型不正确"。
2. 不知道校验的是后缀还是 Content-Type。
3. 改了这个头之后页面还报错，一度怀疑还有别的检查。

解决：
1. 用 Burp 截上传请求，观察 Content-Type 是 multipart/form-data 里的每个 part 各自带一个。
2. 把文件那一段的 Content-Type 从 application/x-php 改成 image/png，放行。
3. 服务器放行，文件按原名保存为 .php，访问即执行。
4. 提交通过。

补充：
1. multipart 请求里每个 part 都有独立的 Content-Type，校验通常只看文件那一段。
2. 只校验 MIME 的方案等于没有校验，因为客户端可以随便声明。
3. 真实防御要靠服务端读取文件头（magic number）+ 白名单后缀 + 重命名。

工具：Burp Suite

踩坑记录：
1. 一开始在浏览器里改，改不了，必须抓包改。
2. 只改了外层请求头，没改文件 part 里的那个，改错了地方。
3. 改完 Content-Type 之后又碰到文件头检查，才发现这题其实叠了两层校验。

总结：MIME 校验错在"信任客户端声明"。这题最直观地展示了：任何来自请求的字段都可以被伪造，服务端只能信自己读出来的东西。
