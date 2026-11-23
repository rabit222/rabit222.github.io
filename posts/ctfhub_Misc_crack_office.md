---
title: 密码破解-Office密码破解
date: 2026-11-18
tags: [CTFHub, Misc, 密码破解]
excerpt: office2john 提取哈希，john 跑字典。
---

思路：Office 文档（docx/xlsx/pptx）加密后，密码哈希存在文件里，office2john 能提取出来交给 john/hashcat 爆破。

问题：
1. 打不开文档，提示需要密码。
2. 不知道怎么提取哈希。
3. 跑字典没结果。

解决：
1. 用 office2john xx.docx > hash.txt 提取。
2. john --wordlist=rockyou.txt hash.txt 跑字典。
3. 成功后用密码打开文档，看内容。
4. 提交通过。

补充：
1. 老格式（doc/xls）和新格式（docx/xlsx，本质是 zip）的加密机制不同，工具会自动识别。
2. 还能用 hashcat 的 -m 9400/9500/9600 等模式，GPU 更快。
3. 如果文档里没有密码提示，优先试常见弱密码和题目相关的词。

工具：office2john、john、hashcat

踩坑记录：
1. 一开始用 Word 直接猜密码，猜了十几次就放弃了。
2. office2john 的 python 依赖没装，脚本跑不起来。
3. 字典里其实有密码，但 john 默认不显示进度，以为卡住了。

总结：Office 密码破解和压缩包破解是同一套流程，区别只在提取哈希的工具。这类题的共同点是：离线验证，速度取决于字典。
