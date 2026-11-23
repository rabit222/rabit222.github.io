---
title: 文件包含-PHP伪协议
date: 2026-11-18
tags: [CTFHub, WEB, 文件包含]
excerpt: 用 php://filter 把源码 base64 编码后读出来，绕过 PHP 解析。
---

思路：直接包含 index.php 只会执行，看不到源码。php://filter 可以在读取时套一层过滤器，把内容 base64 编码后输出，PHP 解析器就不会把它当代码执行了。

问题：
1. 包含 .php 文件时页面是空白或者只显示执行结果，看不到源码。
2. 知道 php://filter 但参数格式记不住。
3. 不知道有哪些可用的过滤器。

解决：
1. 构造：?file=php://filter/convert.base64-encode/resource=index.php
2. 页面输出一段 base64 字符串，复制出来解码，得到源码明文。
3. 逐个文件读：config.php、flag.php、flag 文件，找到目标。
4. 提交通过。

补充：
1. php://filter 的语法：php://filter/[read=过滤器链]/[resource=目标文件]。
2. 常用过滤器：convert.base64-encode、convert.iconv.*（编码转换链，能做更复杂的绕过）、string.strip_tags。
3. 这是"读源码"的通用手法，做 CTF 里绝大多数源码泄露/敏感文件题都会用到。

工具：Burp Suite、本地 base64 解码

踩坑记录：
1. 第一次把 resource 参数写错了位置，过滤器语法必须严格按顺序。
2. 输出太长，浏览器里复制不全，改用 Burp 的响应内容复制。
3. 读 index.php 拿到的源码里有 include 别的文件，顺着链条才找到 flag 位置。

总结：php://filter 的价值是"不执行只读取"，它是文件包含题里最有用的一个协议。理解它之后，很多"看源码"的题就有了统一解法。
