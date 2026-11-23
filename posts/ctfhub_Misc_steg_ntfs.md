---
title: 数据隐写-NTFS流
date: 2026-11-18
tags: [CTFHub, Misc, 隐写]
excerpt: NTFS 的备用数据流（ADS）能藏文件，资源管理器里看不见。
---

思路：NTFS 支持备用数据流（Alternate Data Stream），一个文件可以挂多条数据流，主文件正常、附加流里藏东西。资源管理器和 dir 默认看不到。

问题：
1. 文件看起来完全正常，大小也一样。
2. 不知道怎么查看隐藏的流。
3. 摸鱼流和文件流分不清。

解决：
1. Windows 下用 dir /r 列出文件的所有流，能看到 file.txt:secret 这样的条目。
2. 用 PowerShell：Get-Item -Path file.txt -Stream *，或者 Get-Content -Path "file.txt:secret"。
3. 也可以用 7-Zip 打开（新版能列出 ADS），或者用 streams.exe 工具。
4. 读到隐藏内容，提交通过。

补充：
1. ADS 语法：文件名:流名，默认流是 $DATA。
2. 常见隐藏位置：图片、文本文件、目录本身。
3. 打包成 zip/tar 时 ADS 会丢失，所以这类题一般给的是镜像或者压缩包（用 7z 保留）。

工具：PowerShell、7-Zip、streams.exe

踩坑记录：
1. 一开始只看文件内容，完全没想到还有别的数据流。
2. 用 Get-Content 直接读没加流名，读到的是主内容。
3. 用 7z 解压时没注意流被丢掉了，得直接在原目录看。

总结：NTFS 流是"看不见的附带数据"。这题的价值在于让我知道：文件系统本身也能当隐写载体，不只是文件内容。
