---
title: 瑞士军刀
date: 2026-09-11  
tags: [Bugku, 交互连网, Pwn, Netcat]
excerpt: 关于网络交互题的工具替换踩坑过程。
---

## 0. 题目信息
- 方向：Misc / 交互
- 目标：连接目标服务器，获取 flag

## 1. 初步分析
题目提示“交互连网”，说明需要与靶机建立 TCP 连接。根据提示，连接成功后需要发送 `cat flag` 来获取旗帜。

## 2. 踩坑与排错过程
**问题 1：Windows 本地缺少 Netcat（nc）指令**
- 尝试直接在 Windows CMD 中执行 `nc` 命令，提示命令不存在。
- **解决**：由于本地无 Netcat，决定改用 Python 脚本实现网络连接。

**问题 2：脚本缺少对应库 & pip 版本过低**
- 直接运行 Python 脚本时，提示缺少 socket（或其他库）。
- pip 安装时提示版本过低，无法拉取最新包。
- **解决**：
  1. 运行 `python -m pip install --upgrade pip` 升级 pip。
  2. 安装所需库。

**问题 3：PyCharm 无法使用 Python 环境**
- 在 PyCharm 中运行脚本时无法识别解释器(找不到原因)。
- **解决**：在 CMD 交互模式下直接运行 Python 脚本，绕过 PyCharm 环境问题。

## 3. 利用过程 / EXP
使用 Python 编写交互脚本：

```python
import socket

host = "靶机IP"
port = 端口
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((host, port))
# 发送命令
s.sendall(b"cat flag\n")
# 接收回显
print(s.recv(1024).decode())
s.close()
