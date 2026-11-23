---
title: Pikachu-CSRF(POST型)
date: 2026-11-23
tags: [Pikachu, WEB, CSRF]
excerpt: POST 请求不能靠链接触发，写一个自动提交的 HTML 表单。
---

思路：参数在请求体里，URL 拼不出来。需要构造一个本地 HTML 页面，用表单自动提交到目标站点。

问题：
1. 不知道怎么用 HTML 伪造 POST 请求。
2. 写了表单提交后页面跳走了，看不到结果。
3. 不确定 target 写什么。

解决：
1. 抓一次正常修改资料的请求，记下 action、字段名、值。
2. 写一个 HTML 表单：action 指向目标 URL，method 是 POST，字段按原样填。
3. 加一段 JS 自动 submit，或者把 target 指向 iframe 避免跳走。
4. 诱导受害者访问页面，验证资料被改，提交通过。

补充：
1. POST 型 CSRF 一般需要诱导点击，比 GET 型成本高但同样可行。
2. 表单的 enctype 要和原请求一致（普通表单是 urlencoded）。
3. 防御同上：token + SameSite。

工具：本地 HTML、Burp Suite

踩坑记录：
1. 表单字段名和原请求不一致，服务端收不到。
2. 没写自动提交，以为打开页面就生效。
3. target 忘了设，提交后跳转把结果页覆盖了。

总结：CSRF 的利用方式是"让受害者的浏览器替你发请求"。GET 靠链接、POST 靠表单，本质相同。
