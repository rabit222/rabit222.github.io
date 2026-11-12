---
title: Git 泄露 - Index
date: 2026-11-12
tags: [CTFHub, Web, 源码泄露, Git泄露, Git Index]
excerpt: 记录通过 GitHack 下载泄露的 .git 目录，利用 .git/index 文件恢复暂存区未提交的源码，从而提取 flag 的过程。
---

思路：题目提示“当前大量开发人员使用git进行版本控制……引起 git 泄露漏洞。”解题核心是**利用工具下载泄露的 `.git` 目录，并还原 `git add` 到暂存区（Index）但未提交的代码**。

问题：
1. 直接访问目标主页，页面无任何直接暴露的 Flag。
2. 下载泄露的 `.git` 后，尝试使用 `git log` 查看历史提交，发现找不到 Flag（因为开发者没有执行 `git commit`）。
3. 尝试使用 `git stash list` 查看隐藏记录，也找不到 Flag（因为开发者没有执行 `git stash`）。

解决：
1. 确定目标 URL 为：`http://challenge-d4d50eeb008b8409.sandbox.ctfhub.com:10800`。
2. 使用 GitHack 工具下载并自动恢复泄露的 `.git` 文件，命令如下：
   `python2 GitHack.py http://challenge-d4d50eeb008b8409.sandbox.ctfhub.com:10800/.git/`
3. GitHack 在运行过程中，会自动解析 `.git/index`（暂存区索引文件），并根据索引中记录的哈希值，去 `.git/objects` 目录中把未提交的文件内容“捞”出来，恢复到本地。
4. 进入 GitHack 自动生成的源码目录，使用 `ls` 查看，发现存在被暂存的文件。
5. 直接使用 `cat` 命令读取该文件，即可看到被藏在暂存区里的 Flag：`ctfhub{d8bda744d33d6b215f6531f6}`。
6. 回到题目页面，输入该 Flag 并提交，通关。

【知识点拓展】：
Index 题型的核心在于 `.git/index` 文件泄露了 `git add` 之后未 commit 的文件名和哈希值。GitHack 工具相当于帮我们完成了“解析索引 -> 提取对象 -> 还原文件”的全套动作，因此恢复后直接在工作区找文件即可，无需使用复杂的 git 命令。
