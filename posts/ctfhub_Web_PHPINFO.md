---
title: PHPINFO
date: 2026-10-08
tags: [CTFHub, Web, 信息泄露, phpinfo]
excerpt: 记录通过 phpinfo 页面敏感信息泄露获取 flag 的过程。
---

思路：进入题目环境后直接呈现一个完整的 `phpinfo()` 页面，结合题目名称"PHPINFO"，判断考点为 phpinfo 页面的敏感信息泄露。`phpinfo()` 会打印 PHP 运行环境的全部信息，包括环境变量、请求头、已加载模块等，出题人常将 flag 藏在环境变量（如 `REDIRECT_FLAG`）或某个配置项的值中，无需任何漏洞利用即可直接读取。

问题：

1. phpinfo 页面输出内容极其庞大（数百个表格、上万个字段），手动逐段翻找效率极低，容易遗漏。
2. 部分变体题不会将 flag 直接放在显眼的段落，需要确认搜索关键词足够宽泛（`flag`、`ctfhub`），避免只搜完整 flag 格式导致漏报。

解法：

1. 确定目标 URL 为：`http://challenge-684c195eacc98ef4.sandbox.ctfhub.com:10800/`（题目直接给出的入口，无需路径拼接）。
2. 在浏览器打开页面后，直接使用 `Ctrl + F` 页内搜索，依次搜索关键词 `ctfhub` 与 `flag`，定位包含 flag 的表格行。
3. 搜索命中 Environment 段落的环境变量处（形如 `REDIRECT_FLAG` 的条目），其值即为 flag：`ctfhub{...}`（以实际抓到的值为准）。
4. 将 flag 提交至题目 Flag 输入框，验证通过，本题完成。
