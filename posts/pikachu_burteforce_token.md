---
title: Pikachu-Token防爆破绕过
date: 2026-11-23
tags: [Pikachu, WEB, 暴力破解]
excerpt: 每次请求带一次性 token，脚本先取 token 再提交就能继续撞。
---

思路：这一关的登录表单带了 token，服务端会校验 token 是否有效、是否一次性。手工爆破会被"token 无效"挡住，需要脚本化：每次先 GET 页面拿新 token，再带着它提交。

问题：
1. 直接重放请求返回"token 错误"。
2. 不知道 token 是一次性的还是会话级的。
3. 手工复制 token 太慢，不可能跑字典。

解决：
1. 分析流程：GET 登录页 → 从 HTML 里提取 token → POST 带上 token 和密码。
2. 用 Python requests 写循环：每个候选密码前先取一次 token。
3. 观察响应，找到成功的那条。
4. 拿到密码，提交通过。

补充：
1. token 也分质量：会话级 token 可以重复用，一次性 token 必须每次取；这题是一次性的。
2. 如果 token 存在 cookie 里且可预测，还能直接构造。
3. 防御：token 绑定会话 + 一次性 + 服务端限速，三者结合才有效。

工具：Python requests、Burp Suite

踩坑记录：
1. 一开始用 Intruder 的 pitchfork 想复用 token，失败。
2. 正则提取 token 写错，取到的是空字符串。
3. 忘了带 cookie，取 token 和提交密码不是同一个会话。

总结：token 防护让"无脑爆破"失效，但只要流程能被脚本复现，防护就只是提高了成本。这题是第一次让我意识到：爆破题本质上是"自动化能力"的比拼。
