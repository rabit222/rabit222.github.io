---
title: Git leak- Stash
date: 2026-11-12
tags: [CTFHub, Web, 源码泄露, Git泄露, Git Stash]
excerpt: 记录通过 GitHack 下载泄露的 .git 目录，利用 git stash 查看被隐藏的暂存代码，从而提取 flag 的过程。
---

思路：题目提示“当前大量开发人员使用git进行版本控制，对站点自动部署。如果配置不当，可能会将.git文件夹直接部署到线上环境。这就引起了git泄露漏洞。”解题核心是**利用工具下载泄露的 `.git` 目录，并恢复被开发人员暂存（stash）的隐藏代码**。

问题：
1. 直接访问目标主页，页面仅显示 `<h1>Where is flag?</h1>`，前端没有直接暴露 Flag。
2. 下载源码后，执行 `git log` 或查看普通提交（如 `a6a4cb6`），发现 diff 内容里只有一句 `where is flag`，这是出题人设置的障眼法。
3. 尝试直接使用 `git stash pop` 恢复暂存区，提示“冲突（修改/删除）”，因为当前工作区（master分支）没有该文件，而 stash 中有修改，导致无法直接合并。

解决：
1. 确定目标 URL 为：`http://challenge-41de15d59628764b.sandbox.ctfhub.com:10800`。
2. 使用 GitHack 等工具（或直接抓取）下载目标站点的 `.git` 泄露文件，完整恢复到本地目录（如 `~/ctf-out/845d5f655890df82e6f43d855b213aa3`）。
3. 进入该目录，执行 `git stash list` 查看暂存栈，发现存在一条记录：`stash@{0}: WIP on master: a6a4cb6 add flag`。
4. 绕过 `git stash pop` 的冲突问题，直接查看底层 diff 数据。执行命令：`git show stash@{0}`。
5. 在命令输出的比对信息（diff）中，发现被隐藏的真实代码：`+ctfhub{ecac368cd2671d53a7ca70fe}`。
6. 回到题目页面，输入该 Flag 并提交，通关。
