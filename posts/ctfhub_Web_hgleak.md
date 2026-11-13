---
title: HG源码泄露
date: 2026-11-13
tags: [CTFHub, Web, 源码泄露, Mercurial]
excerpt: 记录通过探测网站隐藏的.hg目录，利用工具下载元数据，并通过分析fncache文件直接获取flag的过程。
---

思路：题目提示“当开发人员使用 HG (Mercurial) 进行版本控制，对站点自动部署...引起了 HG 泄露漏洞”。说明线上环境残留了 `.hg` 隐藏文件夹。解题核心是**探测并下载 `.hg` 目录下的元数据文件，从中找出记录文件路径的索引，从而获取源码或 Flag**。

问题：
1. 直接访问目标主页，无法直接获取 Flag。
2. 初次使用 `rip-hg.pl` 工具时，命令参数写错（误用了 `-a`），导致工具报错 `400 URL must be absolute`。
3. 修正命令后，工具运行输出大量 `404 Not Found`，虽成功下载了部分 `.hg` 目录，但并未直接恢复出含有 Flag 的网页源码。

解决：
1. 确定目标 URL 为：`http://challenge-7a2f1a2f62dd2230.sandbox.ctfhub.com:10800`。
2. 修正自动化工具命令：`perl rip-hg.pl -v -u http://challenge-7a2f1a2f62dd2230.sandbox.ctfhub.com:10800/.hg/`。工具成功获取了 `.hg` 的核心元数据。
3. 进入本地下载的 `.hg/store/` 目录，查看 Mercurial 仓库的文件索引记录：
   ```bash
   cat fncache
