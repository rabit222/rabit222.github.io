---
title: 数据隐写-图片隐写
date: 2026-11-18
tags: [CTFHub, Misc, 隐写]
excerpt: 图片尾部藏文件、LSB 藏比特、EXIF 藏文本，逐个查。
---

思路：图片隐写是最常见的一类，隐藏方式五花八门：文件尾部追加数据、像素最低位藏比特、EXIF 注释里写文本、改宽高藏内容。先做基本排查，再针对性深入。

问题：
1. 图片肉眼正常，不知道藏了什么。
2. 排查方向太多，不知道从哪开始。
3. 试了几个工具都没结果。

解决：
1. 基础排查：exiftool 看元数据、strings 看可读串、binwalk 看有没有嵌入文件。
2. 文件尾追加：用 010 Editor 或 foremost 看文件结束标记之后的内容。
3. LSB 隐写：用 zsteg、stegsolve 逐通道看，有时能看到二维码或文字。
4. 找到线索，提交通过。

补充：
1. 常见载体：PNG（LSB、IDAT 块）、JPG（EXIF、尾部追加）、GIF（多帧、调色板）。
2. 工具清单：exiftool、binwalk、foremost、zsteg、stegsolve、steghide、010 Editor。
3. 有些题会改图片高度，数据藏在被裁掉的部分，需要修复宽高。

工具：exiftool、binwalk、zsteg、stegsolve、010 Editor

踩坑记录：
1. 一开始只用 strings，没结果就卡住了，其实应该先看元数据。
2. LSB 扫描的通道选错，换了好几次才有东西。
3. 改宽高的题不懂原理，直接换工具试出来的。

总结：图片隐写题的排查是有顺序的：先看元数据，再看文件尾部，再看像素层。按顺序走比乱试快得多。
