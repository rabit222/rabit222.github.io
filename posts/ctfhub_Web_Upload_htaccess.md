---
title: 文件上传-.htaccess
date: 2026-11-18
tags: [CTFHub, WEB, 文件上传]
excerpt: 后缀白名单只放行图片时，先传 .htaccess 把 png 当 PHP 解析。
---

思路：这题只允许上传图片后缀，直接传 php 不行。但 Apache 的 .htaccess 可以改变目录的解析规则，先传一个 .htaccess 把 .png 映射成 PHP，再传伪装成图片的木马。

问题：
1. 上传 php 被拦，提示只允许图片格式。
2. 不知道 .htaccess 是否能被一起上传。
3. 担心 .htaccess 覆盖了站点配置导致整站挂掉。

解决：
1. 先确认 .htaccess 本身可以被上传（很多只校验后缀的方案会漏掉点开头的文件）。
2. 构造内容：AddType application/x-httpd-php .png，意思是"把 png 当 php 执行"。
3. 上传木马 shell.png（内容是 PHP 代码），访问它，代码被执行。
4. 读取目标文件，提交通过。

补充：
1. .htaccess 生效需要 Apache 开了 AllowOverride，Nginx 不认这个文件，所以这招看服务器。
2. 除了 AddType，还能写 SetHandler、php_value auto_prepend_file 之类的指令，玩法更多。
3. 防御：上传目录用 Nginx 或关闭 AllowOverride，并且禁止上传以点开头的文件、禁止脚本执行。

工具：浏览器、Burp Suite

踩坑记录：
1. 一开始不知道能不能传点开头的文件，试了才知道 .htaccess 没被拦。
2. 第一次写的内容有语法错误，服务器直接 500——把 .htaccess 上传写错会把整个目录搞挂，得能删。
3. 上传完 .htaccess 才发现 shell.png 还是不能执行，原因是 AddType 写的扩展名带点写错了。

总结：文件上传的绕过思路可以分成两类：绕过校验（后缀、类型、内容）和改变解析（.htaccess、ini、user.ini）。后者更隐蔽，也更能说明"上传目录是危险区"这句话。
