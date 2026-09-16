---
title: 入门逆向
date: 2026-09-11
tags: [Bugku, Reverse, IDA, 逆向]
excerpt: 搭建逆向环境并分析 baby.exe 。
---

工具：IDA Free 9.3, DIE

思路：拿到 baby.exe 后，先尝试运行，发现是让输入密码的校验程序。由于不懂汇编，决定借助工具 DIE 查壳，然后用 IDA 进行静态分析。听说 IDA 里按 Shift+F12 找字符串是新手最快找 flag 的方法。

问题：
1. 安装 IDA 时疯狂报错，提示 `loaders\pe.dll: can't load file` 和 `processor type 'metapc' is not included`。
2. 加载 baby.exe 时一直被识别为 Binary file，无法反汇编。
3. 第一次用 IDA，不知道从哪里开始看，不知道怎么找 flag。

解决：
1. 排查发现是安装路径里有中文，修改为纯英文路径（D:\IDA_Free），成功打开。
2. 将 baby.exe 拖入 IDA，这次自动识别为 PE 格式和 x86 处理器，加载成功。
3. 在反汇编界面按 Shift+F12 查看字符串，看到了 "success" 和 "flag" 相关的提示。
4. 双击字符串，按 Ctrl+X 定位到使用它的函数，再按下 F5生成伪代码。

总结：第一次用 IDA 踩了很多坑，光是环境问题就卡了半天。但熟悉了找字符串、交叉引用和反编译（F5）的流程后，学会使用工具是入门的第一步。
