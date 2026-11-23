---
title: 密码破解-ZIP密码破解
date: 2026-11-18
tags: [CTFHub, Misc, 密码破解]
excerpt: zip2john 或 fcrackzip，字典爆破出密码。
---

思路：ZIP 的密码校验机制比较弱，可以离线验证每个候选密码。用工具提取哈希，或者直接用 fcrackzip 跑字典。

问题：
1. 不知道 ZIP 密码能不能离线爆破。
2. 试了几个密码都不对。
3. 爆破速度慢。

解决：
1. 先用 fcrackzip -u -D -p rockyou.txt xx.zip 跑字典。
2. 或者 zip2john 提哈希，john/hashcat 爆破。
3. 密码出来后解压，查看内容。
4. 提交通过。

补充：
1. ZIP 有两种加密方式：传统 ZipCrypto（弱，可被明文攻击）和 AES（强，只能字典/暴力）。
2. 如果压缩包里有个已知文件（比如真的 PNG），可以用明文攻击（bkcrack）直接解出密钥，不用字典。
3. 工具：fcrackzip、zip2john、john、hashcat、bkcrack。

工具：fcrackzip、john、hashcat、bkcrack

踩坑记录：
1. 一开始不知道有明文攻击这回事，傻了才去跑字典。
2. fcrackzip 的参数 -u 忘了加，结果把所有候选都当成功。
3. 字典在 Windows 上换行符不同，导致候选密码全带回车。

总结：ZIP 题先看有没有已知文件（能明文攻击），没有再用字典。这个判断顺序能省很多时间。
