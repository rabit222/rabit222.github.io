---
title: Linux 基础
date: 2026-09-11
tags: [Bugku, Linux, WSL, 环境搭建]
excerpt: 记录用 WSL 搭建 Linux 环境并完成基础命令题的过程。
---

思路：题目是一道 Linux 基础题，需要用到 Linux 命令行操作。我平时用的是 Windows，没有 Linux 环境，所以第一步得在 Windows 上先装个 Linux。听学长推荐 WSL（Windows Subsystem for Linux），说是比装虚拟机方便很多，决定尝试。

问题：
1. Windows 系统没有 ls、find 等命令，必须得有 Linux 环境才能做题。
2. 没接触过 WSL，不知道怎么安装，也不知道装完去哪里找 Linux 终端。
3. WSL 装好之后，环境里没有现成的工具，对命令也不熟，不知道去哪找 flag。

解决：
1. 安装 WSL：
   - 以管理员身份打开 PowerShell 或 CMD。
   - 输入 `wsl --install` 回车，系统自动下载并安装 Ubuntu。
   - 安装完成后重启电脑。
   - 第一次打开 Ubuntu 会提示设置 Linux 用户名和密码（注意：输入密码时屏幕是不会显示的，这是正常现象）。
   - 遇到报错“请启用虚拟机平台”，去 BIOS 里开启了 CPU 的虚拟化技术（VT-x/AMD-V）后解决。
   - 之后在 Windows 终端输入 `wsl` 或者直接点开始菜单里的 Ubuntu 图标，就能进入 Linux 终端了。
2. 解题过程：
   - 进入终端后，输入 `ls -la` 查看当前目录下所有文件（包含隐藏文件）。
   - 使用 `find / -name "*flag*"` 或者 `grep -r "flag"` 全盘搜索 flag 文件或字符串。
   - 找到文件后，用 `cat 文件名` 读取内容。。
3. 最终成功得到 flag。

总结：linux系统实装成功，正在学习如何使用指令
