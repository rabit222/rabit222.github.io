---
title: 密码破解-RAR密码破解
date: 2026-11-18
tags: [CTFHub, Misc, 密码破解]
excerpt: rar2john 提取哈希，john 跑字典。
---

思路：RAR 压缩包有密码时不能解密，但有密码哈希的话可以对字典做验证。rar2john 能从压缩包里提取出可攻击的哈希。

问题：
1. 不知道 RAR 的密码怎么处理。
2. 没有合适的字典。
3. 跑半天没结果，怀疑字典不对。

解决：
1. 用 rar2john xx.rar > hash.txt 提取哈希。
2. 用 john --wordlist=rockyou.txt hash.txt 跑字典。
3. 跑出密码后解压，拿到文件内容。
4. 提交通过。

补充：
1. 同类流程：zip2john、7z2john、office2john、pdf2john，都是"先提取哈希再爆破"。
2. 字典优先用 rockyou；跑不动再考虑规则扩展（john --rules）。
3. 也可以换 hashcat，GPU 跑得快很多。

工具：john、rar2john、hashcat

踩坑记录：
1. 一开始直接用 unrar 试密码，速度慢得离谱。
2. 字典路径写错，john 报找不到文件。
3. 密码里有特殊字符，shell 里要处理转义。

总结：密码破解的通用流程是"提取哈希 → 字典/规则 → 验证"。理解了这条链路，压缩包、Office、PDF、WiFi 的题都是同一套打法。
