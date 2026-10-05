---
title: 目录遍历
date: 2026-10-04
tags: [CTFHub, Web, 目录遍历, Directory Indexing]
excerpt: 记录通过探测并遍历 Web 服务器上的隐藏目录获取 flag 的过程。
---

思路：访问靶机后，页面显示 Apache 服务器的目录索引页面（Index of /flag_in_here/）。页面直接列出了 `1/`、`2/`、`3/`、`4/` 等多个子目录。题目暗示 flag 藏在这些层层嵌套的目录深处，需要不断向下遍历寻找 `flag.txt`。

问题：
1. 手动在浏览器点击效率极低，目录存在多层“套娃”现象。
2. 使用 `wget -r` 递归下载时，因 Apache 的列表排序参数（如 `?C=N;O=A`）导致陷入无限循环下载 `index.html` 变体，甚至因为 `-R "index.html*"` 过滤掉了唯一的导航路标，导致无法深入。
3. 使用 `grep -rn "ctfhub" .` 进行全局搜索时，错误地在本地用户目录递归搜索，搜出了一堆与题目无关的本地系统缓存文件，造成干扰。
4. 环境未安装 `dirsearch` 等专业扫描工具，直接运行报错。

解决：
1. 确定目标 URL 为：`http://challenge-xxx.sandbox.ctfhub.com:10800/flag_in_here/`。
2. 由于目录层级较深，最直接的方法是**手动遍历**：在浏览器不断点击子目录（如 `1/1/`、`1/2/`），直到发现 `flag.txt` 并打开获取 `ctfhub{...}`。
3. 如果需要使用命令行，可以在 WSL 或 Kali 中安装工具扫描：
   ```bash
   sudo apt update
   sudo apt install dirsearch
   dirsearch -u http://challenge-xxx.sandbox.ctfhub.com:10800/flag_in_here/ -e txt -r
