---
title: 宽带信息泄露
date: 2026-09-24
tags: [Bugku, MISC, 信息泄露]
excerpt: 用 RouterPassView 解密路由器备份文件 conf.bin，提取出宽带用户名。
---

思路：下载得到一个 conf.zip，解压出来是 conf.bin，15KB 的二进制文件。题目描述写的是「flag(宽带用户名)」，所以目标很明确——从一个看着像乱码的文件里把宽带账号挖出来。我一开始按常规套路走：strings 捞字符串、binwalk 拆包，结果一无所获，最后才知道这类文件得用专门的工具。

问题：
1. strings 捞不出任何有意义的内容，全是乱码；binwalk 也扫不出任何嵌套的文件系统或压缩流。
2. 不知道 .bin 是什么格式。查了才知道 .bin 只是"二进制"的意思，具体是什么格式得看用途，光看后缀没用。
3. 下载 RouterPassView 时被 Windows 杀毒软件拦截，以为下到病毒了（老师说有的工具本身就不安全）。

解决：
1. 先自己动手分析，确认"不是我不会用工具，而是这文件真的被加密了"：
   - `file conf.bin` 认不出来；`xxd conf.bin | head` 看开头是 `02 f9 5c 97 ac 72...`，没有任何已知的魔数（不是 gzip、不是 zlib、不是 SquashFS）。
   - ai写了个 Python 脚本算分块熵，整篇都在 7.5 以上（满值 8），ai基本可以断定是加密或压缩。
   - 又在所有偏移位置暴力试了 zlib / raw-deflate / gzip 解压，一个都没解出来。
   - ai说：从偏移 10392 开始有一段 48 字节一条的表格，其中两个 16 字节字段各自重复了 92 次，间隔精确 48 字节。说明里面是有结构的数据，只是被加密了。
   - 综合判断：这是加密过的路由器备份文件。
2. 评论区得知这类文件要用 RouterPassView，它内置了各大品牌路由器（TP-Link、D-Link、华为、华硕等）配置文件的解密算法。
3. 下载 RouterPassView，把 conf.bin 拖进去，Ctrl+F 搜索 username，直接就看到宽带用户名了。
4. 提交 flag{053700357621}

工具：
- RouterPassView：http://www.nirsoft.net/utils/router_password_recovery.html
- 不想装软件的话，可以用在线版「配置解密 V2.00 - Config Decoder」，解密后用记事本搜 username 一样能拿到（ai说行，我试了不行）。

总结：这题教我的事是——工具识别比技术操作重要。.bin 不代表"我要硬拆它"，加密的备份文件用通用工具（strings、binwalk）是没有意义的，得先认出这是什么文件、有没有对应的专用工具。另外顺便：中国宽带的 PPPoE 账号通常长成"区号+号码"，比如这题的 053700357621，前面 0537 是山东济宁的区号。
