---
title: 电子取证-内存取证
date: 2026-11-18
tags: [CTFHub, Misc, 电子取证]
excerpt: 内存镜像里有进程、命令行、打开的文件，用 Volatility 挖出来。
---

思路：内存镜像（mem/raw/vmem）保存了系统运行时的全部状态：进程、命令行、网络连接、打开的文件、剪贴板。取证工具能把这些还原出来。

问题：
1. 内存镜像大小动辄几 G，不知道怎么下手。
2. 不知道 Volatility 的命令怎么用。
3. 找不到关键信息在哪个进程里。

解决：
1. 先识别镜像类型：volatility -f mem.raw imageinfo，拿到 profile。
2. 列进程：pslist/psxview，找可疑进程和浏览器、记事本这类"人用过"的进程。
3. 列命令行：cmdline，很多题的关键命令就写在这。
4. 文件扫描：filescan + dumpfiles，把内存里的文件导出来看。
5. 找到线索，提交通过。

补充：
1. Volatility 2 用 profile，Volatility 3 自动识别，命令略有不同。
2. 常用插件：imageinfo、pslist、cmdline、filescan、dumpfiles、hashdump、clipboard、screenshot。
3. 浏览器内存里常常有访问过的 URL、输入过的搜索词，是很好的线索源。

工具：Volatility、strings

踩坑记录：
1. 一开始直接 strings 搜关键词，能搜到但文件不全，还是得用专业工具。
2. profile 猜错，导致所有插件都报错。
3. dumpfiles 导出几百个文件，得先 filescan 过滤再导。

总结：内存取证的关键是"先定位再深挖"：imageinfo 确认环境 → pslist 找可疑进程 → 针对那个进程 dump 数据。
