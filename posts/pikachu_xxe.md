---
title: Pikachu-XXE
date: 2026-11-23
tags: [Pikachu, WEB, XXE]
excerpt: XML 里塞外部实体，让解析器把本地文件读出来。
---

思路：Pikachu 的 XXE 模块接收 XML 输入并解析。如果在 DOCTYPE 里定义外部实体，解析器就会去读指定的文件，把内容替换到实体位置。

问题：
1. 不知道 XML 的实体机制。
2. 不知道能读什么文件。
3. payload 写进去没有回显。

解决：
1. 构造 payload：定义 !ENTITY xxe SYSTEM "file:///etc/passwd"，在元素里引用 &xxe;。
2. 提交后看响应里有没有文件内容被替换进来。
3. 换成读站点配置文件、flag 文件。
4. 拿到内容，提交通过。

补充：
1. XXE 的利用面：读文件、SSRF（http 实体）、拒绝服务（billion laughs）。
2. 现代 PHP 默认不解析外部实体（libxml_disable_entity_loader），所以老环境更容易打。
3. 防御：禁用外部实体解析（LIBXML_NOENT 不开）、用 JSON 替代 XML。

工具：Burp Suite

踩坑记录：
1. 一开始实体定义写错，忘了在文档里引用实体。
2. 读文件路径猜错，试了几个才找到。
3. 回显被 XML 解析器吞了，得看原始响应而不是渲染结果。

总结：XXE 的核心是"XML 允许引用外部资源"这个设计。理解实体机制之后，payload 就只是个固定模板了。
