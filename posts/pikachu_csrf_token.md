---
title: Pikachu-CSRF(Token型)
date: 2026-11-23
tags: [Pikachu, WEB, CSRF]
excerpt: 服务端校验 token，单靠伪造请求过不去，需要配合 XSS 先偷 token。
---

思路：这一关的修改请求带了 CSRF token，服务端会校验。token 是随机的，伪造不了。但 token 会被渲染在页面里，用 XSS 读出来就能绕过。

问题：
1. 伪造的请求一直返回 token 错误。
2. 不知道 token 从哪来、怎么校验。
3. 想不通怎么拿到受害者的 token。

解决：
1. 抓包看修改请求，确认有 token 字段且每次会话不同。
2. 观察 token 出现在哪个页面（一般在表单的隐藏域里）。
3. 用存储型 XSS 在目标页面注入脚本，读取 token 并发给攻击者。
4. 拿到 token 后构造请求，提交通过。

补充：
1. token 必须绑定会话且一次性，否则仍可被重放。
2. CSRF token 和 XSS 是互补关系：XSS 能绕过 token（读得到），token 能防 CSRF（读不到）。
3. 防御的完整方案：token + SameSite + 关键操作二次验证。

工具：Burp Suite、pkxss 平台

踩坑记录：
1. 一开始硬伪造请求，token 一直错，浪费不少时间。
2. 忘了 token 是会话级的，换账号后要重新取。
3. XSS 拿 token 时跨域被拦，得用图片请求或者后端中转。

总结：这道题把 CSRF 和 XSS 串起来了——单独防一个不够，攻击者往往组合使用。token 是有效防线，但前提是页面里没有 XSS。
