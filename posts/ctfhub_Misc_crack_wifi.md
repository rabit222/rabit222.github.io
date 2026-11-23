---
title: 密码破解-WiFi密码破解
date: 2026-11-18
tags: [CTFHub, Misc, 密码破解]
excerpt: 抓到的握手包用 aircrack-ng 跑字典，验证 PMK。
---

思路：WiFi 密码不是直接存在握手包里的，而是用 WPA 的四次握手反推。aircrack-ng 会对字典里每个密码计算 PMK 并验证 MIC 是否匹配，匹配上就是密码。

问题：
1. 拿到 pcap 不知道是不是握手包。
2. 不知道怎么跑字典。
3. 跑出来结果不确定真假。

解决：
1. 用 aircrack-ng xx.pcap 打开，看是否包含 EAPOL 握手（显示 handshake）。
2. 用 aircrack-ng -w rockyou.txt xx.pcap 跑字典。
3. 匹配成功会显示 KEY FOUND。
4. 拿到密码，提交通过。

补充：
1. 必须先抓到完整四次握手（至少包含一条有效 EAPOL），只有 beacon 是不够的。
2. 字典质量决定成败，CTF 里通常用 rockyou 或者题目给的字典。
3. 也可以先看 SSID，很多题会把提示放在 SSID 里。

工具：aircrack-ng、Wireshark

踩坑记录：
1. 一开始抓的 pcap 只有 beacon，跑半天说没握手。
2. 字典没指绝对路径，aircrack 报错。
3. 密码是手机号格式，rockyou 里没有，得自己生成字典。

总结：WiFi 破解的本质是"字典命中"。理解握手包里有 MIC 校验，就知道为什么能离线试密码。
