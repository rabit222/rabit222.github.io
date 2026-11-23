---
title: Pikachu-XSS
date: 2026-11-23
tags: [Pikachu, WEB, XSS]
excerpt: 反射、存储、DOM 三种场景，先判断输出上下文再构造 payload。
---

思路：Pikachu 的 XSS 模块覆盖反射型、存储型、DOM 型三个经典场景，还有一关 POST 型反射。每种场景的关键是"输入落在 HTML 的哪里"。

问题：
1. 三种类型看起来都是"输入什么回显什么"，不知道区别。
2. 有的位置输入 script 被转义，不知道换什么。
3. DOM 型在抓包里看不到 payload。

解决：
1. 反射型：在参数里输入 <script>alert(1)</script>，页面弹窗即成功。
2. 存储型：在留言板提交同样的 payload，刷新列表页时执行，说明落库了。
3. DOM 型：读前端代码找到 location.hash 之类的入口，构造 #<script>alert(1)</script>。
4. POST 型：先抓包改请求体，把 payload 放在 POST 字段里提交。
5. 三关都打出弹窗，提交通过。

补充：
1. 判断上下文：输入落在标签体、属性值、script 块、注释里，闭合方式各不相同。
2. 反射是"一次性的"，存储是"持久性的"，DOM 是"纯前端的"，危害排序通常是存储 > DOM > 反射。
3. 防御：输出编码 + CSP + HttpOnly cookie，多管齐下。

工具：浏览器、Burp Suite

踩坑记录：
1. 一开始只有 script 标签，被过滤就卡住了，忘了还有 img/onerror。
2. 存储型的 payload 提交后不去列表页看，以为没成功。
3. DOM 型抓包找半天，最后发现 payload 在 URL 的 # 后面，服务端根本收不到。

总结：XSS 题先看上下文，再选构造方式。三种类型的分界线是"数据存在哪、在哪渲染"——理解了这一点就不会混。
