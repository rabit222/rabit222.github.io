---
title: Vim缓存
date: 2026-11-11
tags: [CTFHub, Web, Vim缓存, 源码泄露]
excerpt: 记录通过探测Vim异常退出产生的交换文件（.swp）导致网站源码泄露的过程。
---

思路：题目提示开发人员在线上环境中使用 vim 编辑器，异常退出时缓存会留在服务器上引起源码泄露。说明解题核心是**寻找并下载 Vim 产生的临时交换文件**（如 `.swp`），从中提取网站源码或敏感信息。

问题：
1. 页面没有回显或提示，无法直接从前端获取到 flag。
2. 需要猜测目标文件及其对应的缓存文件名。通常编辑 `index.php` 会产生隐藏文件 `.index.php.swp`。
3. 直接访问 `.swp` 文件时，内容为二进制/乱码格式，无法直接阅读源码。

解决：
1. 确定目标文件极可能为 `index.php`，根据 Vim 缓存文件的命名规则，构造 URL 访问隐藏文件：`http://challenge-169906df73c21123.sandbox.ctfhub.com:10800/.index.php.swp`。
2. 将文件下载到本地（也可以同时尝试探测 `.index.php.swo` 或 `.index.php.bak` 等其他备份文件）。
3. 在本地使用代码编辑器（如 VS Code、Notepad++）直接打开下载的 `.swp` 文件，或者使用 Linux 命令 `vim -r .index.php.swp` 恢复文件。
4. 在文件内容的源码部分（往往在底部或注释中），成功发现了包含 flag 的 PHP 代码片段。
5. 提取出的最终 Flag 为：`ctfhub{c76dc661271ae82bf096aa5c}`。
