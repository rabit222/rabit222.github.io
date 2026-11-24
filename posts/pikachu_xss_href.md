---
title: Pikachu-XSS(href输出)
date: 2026-11-23
tags: [Pikachu, WEB, XSS]
excerpt: 引号都转义了，但 href 里可以放 javascript: 伪协议。
---

思路：这一关用 ENT_QUOTES 转义了单双引号，属性注入走不通。但输出落在 href 属性里，只要填 javascript:alert(1) 就能执行。

问题：
1. 用单引号闭合属性，被转义成实体。
2. 不知道还能怎么打。
3. 试了 javascript: 但没反应。

解决：
1. 先确认输出位置：输入作为 <a href='输入'> 的地址。
2. 填 javascript:alert(1)，点击链接触发。
3. 如果被过滤（比如去掉 javascript），试大小写、tab/换行、HTML 实体编码变体。
4. 触发成功，提交通过。

补充：
1. href 里的伪协议：javascript:、data:、vbscript:（老 IE）。
2. 防御：只允许 http/https 协议，对协议做白名单校验，而不是只转义引号。
3. 这也是"输出上下文"的经典案例：同一个输入在标签体里安全，在 href 里就危险。

工具：浏览器、Burp Suite

踩坑记录：
1. 一直在试引号闭合，方向错了。
2. javascript: 写成 julia... 之类的手误。
3. 被过滤后没试大小写变体。

总结：XSS 的防御要针对"输出在什么位置"。href 属性需要校验协议，属性值需要转义引号，标签体需要编码——三种情况三种处理。
