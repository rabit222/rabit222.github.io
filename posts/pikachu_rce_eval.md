---
title: Pikachu-RCE(eval代码执行)
date: 2026-11-23
tags: [Pikachu, WEB, RCE]
excerpt: 输入被 eval 当 PHP 代码执行，直接写 system 或读文件函数。
---

思路：这一关把用户输入直接交给 eval，等于给了代码执行权限。输入要符合 PHP 语法，末尾的分号不能少。

问题：
1. 不知道 eval 里该写什么。
2. 写了命令但没回显。
3. 报错说语法错误。

解决：
1. 先输入 phpinfo(); 确认代码被执行。
2. 用 system('whoami'); 或 echo file_get_contents('/flag'); 拿数据。
3. 注意分号、引号要配对。
4. 拿到内容，提交通过。

补充：
1. eval 执行的是 PHP 代码，不是 shell 命令——这是和命令执行的区别。
2. 可以用 system/exec/shell_exec 反过来执行系统命令。
3. 防御：永远不要对用户输入用 eval，这在代码规范里是红线。

工具：浏览器、Burp Suite

踩坑记录：
1. 第一句忘了写分号，一直语法错误。
2. 引号嵌套写错，payload 被提前截断。
3. 用了 shell 命令语法，eval 不认。

总结：代码执行和命令执行的界限要分清：eval 的输入是 PHP，system 的输入是 shell。理解这一点，payload 就不会写混。
