---
title: Pikachu-XSS(DOM型进阶)
date: 2026-11-23
tags: [Pikachu, WEB, XSS]
excerpt: 先点链接才触发，location.search 的内容被塞进 innerHTML。
---

思路：这一关比普通 DOM 型多一步：页面有个链接，点击后才执行 domxss()，函数读取 URL 里 text= 后面的内容，经过 decodeURIComponent 后写进 innerHTML。

问题：
1. 直接刷新页面没有反应。
2. 不知道 payload 该放哪。
3. 放了 payload 也不执行。

解决：
1. 读源码：domxss() 里是 location.search → split("text=") → innerHTML。
2. 构造 URL：xss_dom_x.php?text=<img src=x onerror=alert(1)>，访问后点击页面上的链接。
3. 如果引号被处理，用 ' 闭合 href 属性：' onclick='alert(1)'。
4. 点击触发弹窗，提交通过。

补充：
1. DOM 型 XSS 的 payload 在 URL 里，服务端日志看不到，WAF 也拦不住。
2. 源码注释里给了提示：'><img src="#" onmouseover="alert('xss')">。
3. 防御：用 textContent 代替 innerHTML，或者对插入内容做严格编码。

工具：浏览器 F12、Burp Suite

踩坑记录：
1. 一开始只改 URL 不点链接，函数根本没执行。
2. text= 参数提取后还有 URL 编码，没 decode 就拼，payload 变形。
3. 闭合引号时少写了一个 >，属性没闭合。

总结：DOM 型 XSS 要顺着"源码里的数据流"走：从 location 到 innerHTML，每一步都可能需要闭合或编码。这题比基础 DOM 型多了个"点击触发"的门槛。
