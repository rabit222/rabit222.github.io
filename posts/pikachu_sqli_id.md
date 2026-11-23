---
title: Pikachu-SQL注入(数字型)
date: 2026-11-23
tags: [Pikachu, WEB, SQL注入]
excerpt: id 是数字，直接用 and 判断，union 取数据。
---

思路：数字型注入点，id 直接拼进 SQL，没有引号包裹。用 and 1=1 / and 1=2 判断，再 union 取数据。

问题：
1. 不知道用不用加引号。
2. 列数猜了几次都不对。
3. union 之后原查询还有数据，干扰判断。

解决：
1. 先试 id=1 and 1=1 和 id=1 and 1=2，页面结果不同，确认数字型。
2. order by 数出列数。
3. 用 id=-1 让原查询为空，再 union select 取 users 表的 username/password。
4. 拿到账号密码，提交通过。

补充：
1. 数字型不需要闭合引号，payload 最简洁。
2. order by 报错说明列数超了，不报错说明还在范围内。
3. Pikachu 的表结构固定：users(id, username, password, level)。

工具：浏览器、Burp Suite

踩坑记录：
1. 一开始自作聪明加了单引号，导致语法错误。
2. 数错列数，union 报"列数不匹配"。
3. 没让原查询为空，结果里混着 id=1 的数据，看着乱。

总结：数字型和字符型的区别只在"闭合"，后面取数据的思路完全一样。这题是所有注入题的地基。
