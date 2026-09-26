---
title: POST
date: 2026-10-01
tags: [Bugku, WEB, POST]
excerpt: POST 方式提交参数，改请求方法传参拿 flag。
---

思路：和 GET 那题配套的，页面要求用 POST 方式提交参数。有了上一题的经验，知道这次参数不在 URL 里，得放在请求体里。

问题：
1. 在地址栏直接拼 ?what=flag 不行，因为没有提交按钮，页面根本没有发起 POST 请求。
2. 不知道在浏览器里怎么手搓一个 POST 请求。
3. 试过用 F12 控制台发请求，写 fetch 的时候卡在跨域和地址拼写上。

解决：
1. 最省事的办法是用 Burp：先正常访问页面抓到一个请求，右键 Send to Repeater。
2. 在 Repeater 里把请求方法从 GET 改成 POST，参数按 application/x-www-form-urlencoded 的格式写进请求体，同时补上 Content-Type 和 Content-Length。
3. 发送，响应里就是 flag。提交通过。
4. 后来也试了 curl 的写法（-X POST -d "what=flag"），一样能通。

补充：
1. 表单提交默认就是 POST，Content-Type 是 application/x-www-form-urlencoded，格式是 键=值&键=值，值里的特殊字符同样要 URL 编码。另外还有 multipart/form-data（传文件用）和 application/json（接口用），不同 Content-Type 服务端解析方式完全不同。
2. Content-Length 是字节数不是字符数，中文或特殊字符会算错，这是手改包时最常见的失败原因。
3. curl 的常用参数值得记一下：-X 指定方法、-d 带请求体（自动变成 POST）、-H 加头、-i 显示响应头、-v 看全过程。

工具：Burp Suite、curl

踩坑记录：
1. 先在地址栏拼参数，不行——地址栏发出去的一律是 GET。
2. 试过在 Console 里用 fetch 发 POST，被跨域和地址拼写卡住，写了两遍都不对。
3. 改用 Burp 改方法之后第一次还是失败：忘了改 Content-Length，服务端按旧的长度读请求体，结果读不到参数。
4. 补上 Content-Type: application/x-www-form-urlencoded 和新的 Content-Length 之后才成功。

总结：这题把 GET 和 POST 的区别彻底讲清楚了——GET 的参数在 URL 里、POST 的参数在请求体里，同时 POST 还需要 Content-Type 告诉服务端怎么解析。另外知道了改包的三要素：请求行的方法、请求头、请求体，改完记得同步 Content-Length，否则服务端可能读不到完整数据。这两个知识点（方法 + Content-Length）几乎是所有"改包类"题目的基础，后面做上传、注入那些题都反复用到。
