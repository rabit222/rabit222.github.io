---
title: CTFHub Web - 弱口令
date: 2026-11-16
tags: [CTFHub, Web, 暴力破解, Burp Suite, Intruder]
excerpt: 记录使用 Burp Suite Intruder 的集束炸弹（Cluster bomb）模式，通过自定义字典对目标登录框进行穷举，利用响应包长度差异定位正确凭证，最终获取 flag 的过程。
---

## 思路

题目提示“当前大量开发人员使用弱口令……”。访问目标主页，发现是一个简单的登录表单。由于没有验证码、登录失败次数限制等防护机制，解题核心是**暴力破解（Brute-force）**。

攻击流程为：拦截登录请求 -> 发送至 Burp Suite Intruder -> 配置攻击模式与字典 -> 过滤响应结果 -> 提取 Flag。

## 问题

1. **攻击模式的选择**：由于我们需要尝试多种“用户名”和多种“密码”的组合，不能使用简单的 Sniper（狙击手）模式，需要选择能够同时遍历两组字典的模式。
2. **成功响应的识别**：爆破过程会产生大量请求，肉眼看响应内容太慢，需要寻找一个特征来快速筛选出登录成功的请求。

## 解决

1. **抓包与定位**：开启 Burp Suite 代理，在目标页面随意输入用户名和密码（如 admin/123456）并提交。在 Burp 的 `Proxy -> HTTP history` 中拦截到请求体为 `name=admin&password=123456&referer=` 的数据包，右键发送至 `Intruder`（快捷键 `Ctrl+I`）。
2. **配置攻击模式**：进入 Intruder 的 `Positions` 标签页，点击 `Clear §` 清除默认标记。然后分别选中 `name` 的值和 `password` 的值，点击 `Add §` 添加标记。**攻击类型（Attack type）选择 `Cluster bomb`（集束炸弹）**，这样可以确保两个字典的所有可能组合都会被测试。
3. **配置 Payload 字典**：
   * 在 `Payloads` 标签页，`Payload set 1` 对应用户名：
