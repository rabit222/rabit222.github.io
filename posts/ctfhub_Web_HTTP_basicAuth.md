---
title: 基础认证
date: 2026-09-29
tags: [CTFHub, Web, 基础认证, Basic Auth, 爆破]
excerpt: 记录通过自动化爆破 HTTP Basic Auth 获取 flag 的过程。
---

思路：访问靶机后，页面提示：“Here is your flag: click”。点击链接后，服务器返回 401 Unauthorized 状态码，并弹出浏览器的原生登录框。结合题目名称“基础认证”，判定考点为 HTTP Basic Auth（HTTP 基本认证）。由于 Basic Auth 仅将用户名和密码进行 Base64 编码后放在请求头中传输，未做加密，因此解题核心是**通过字典爆破获取正确的管理员账号密码**，进而获取 flag。

问题：
1. 使用浏览器开发者工具（F12）的 Console 面板发送 `fetch` 请求时，一旦遇到 401 响应，浏览器会强制弹出原生登录框拦截，导致 JavaScript 脚本卡在 `Promise {<pending>}` 状态，无法自动化连续爆破。
2. 尝试使用 CMD（命令提示符）运行 PowerShell 自动化脚本时报错，提示 `Write-Host 不是内部或外部命令`，由于语法不兼容导致无法执行。
3. 尝试在浏览器地址栏直接拼接 URL（如 `http://admin:123456@url`）逐个测试，手动尝试效率极低。

解决：
1. 确定目标 URL 为：`http://challenge-cb4c7cb6f76bfe3a.sandbox.ctfhub.com:10800/flag.html`（根据实际抓取的请求路径确定）。
2. 更换执行环境：放弃 CMD，打开 Windows PowerShell 以支持脚本语法。
3. 编写 PowerShell 自动化脚本，调用系统自带的 `curl.exe` 进行爆破。利用 `-u "用户名:密码"` 传递认证信息，利用 `-w "%{http_code}"` 提取响应状态码。
4. 引入题目附件提供的密码字典，以 `admin` 为用户名进行遍历尝试。
5. 运行脚本，当遍历到密码 `121212` 时，HTTP 状态码返回 200，成功找到正确密码。随后重新发起请求获取页面内容，成功拿到 flag：`ctfhub{640b0e731f6d357c6342864c}`。
