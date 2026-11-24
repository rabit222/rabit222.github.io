---
title: Pikachu-XSS(过滤绕过)
date: 2026-11-23
tags: [Pikachu, WEB, XSS]
excerpt: script 被替换为空，换 img/onerror 或变形写法绕过去。
---

思路：这一关用 str_ireplace 把 <script> 关键字替换成空字符串。过滤只针对一个标签，换一个不需要 script 的 payload 就能执行。

问题：
1. 提交 <script>alert(1)</script> 没反应。
2. 不知道过滤的是哪个词。
3. 换了几种写法都不生效。

解决：
1. 先提交一个不带攻击性的 <script>test</script>，观察返回里还剩什么，确认是"删除"而不是"拒绝"。
2. 换成不需要 script 标签的写法：<img src=x onerror=alert(1)>。
3. 或者用变形：<sCrIpT>、<script >（带空格）、<scr<script>ipt> 这类嵌套。
4. 弹窗出现，提交通过。

补充：
1. 只过滤单个标签是最常见的"假防护"，HTML 里能执行 JS 的标签有一堆。
2. 变形绕过依赖过滤实现粗糙：不区分大小写但只匹配完整串、只匹配一次等。
3. 防御：输出编码 + 白名单富文本过滤 + CSP。

工具：浏览器、Burp Suite

踩坑记录：
1. 一开始以为被拒绝，其实是被删了一半，payload 结构已经不完整。
2. 用 <script > 加空格绕过时，浏览器对空格的容忍度没搞清楚。
3. onerror 里的引号被转义，换成不带引号的写法才通。

总结：黑名单过滤永远绕得过去。这题最直观地说明：过滤"某个标签"不等于过滤"JS 执行"。
