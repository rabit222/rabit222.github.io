---
title: .DS_Store
date: 2026-11-11
tags: [CTFHub, Web, 信息泄露, .DS_Store]
excerpt: 记录通过解析 Mac OS 产生的 .DS_Store 隐藏文件，获取网站隐藏文件列表从而拿到 flag 的过程。
---

思路：题目提示 `.DS_Store` 是 Mac OS 保存文件夹自定义属性的隐藏文件，通过它可以知道目录下所有文件的清单。说明解题核心是**下载目标网站的 `.DS_Store` 文件，并解析出其中隐藏的文件路径**。

问题：
1. 目标页面没有提供任何直接入口，需要手动探测常见隐藏文件路径。
2. 成功下载 `.DS_Store` 文件后，直接双击用记事本或普通文本编辑器打开，发现显示的是大量乱码，无法直接阅读。
3. `.DS_Store` 是二进制格式文件，普通的文本查看方式失效。

解决：
1. 根据提示，直接尝试访问目标站点根目录下的隐藏文件：`http://challenge-7c359277fb1ee775.sandbox.ctfhub.com:10800/.DS_Store`，将其下载到本地。
2. 由于是乱码的二进制文件，在 Linux 终端中使用 `strings` 命令提取其中的可打印字符：`strings .DS_Store`。（也可以使用 Python 的 `ds_store` 库或在线解析工具进行解析）。
3. 在提取出的字符列表中，发现了一个可疑的隐藏文本文件路径，文件名为一串 32 位的哈希值：`ff6de70c2ff606a393eb78b5b226eb7a.txt`。
4. 将解析出的文件名拼接到 URL 后面进行访问：`http://challenge-7c359277fb1ee775.sandbox.ctfhub.com:10800/ff6de70c2ff606a393eb78b5b226eb7a.txt`。
5. 页面成功回显了 flag，提取出的最终 Flag 为：`ctfhub{d122f8aadce4a62fdaed42baa}`。
