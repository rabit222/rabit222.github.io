---
title: linux2
date: 2026-09-18
tags: [Bugku,linux, 过滤]
excerpt: window系统的linux指令使用
---

思路：下载拿到文件，因为标题是Linux，记事本打开偷懒，结果卡爆了，说明二进制文本内容太大（17kb），调动Linux指令检索加过滤，得到key

操作：powershell（win + x打开终端管理员），wls指令可以免下Linux系统和虚拟机，更重要的是，不用转文件到Linux，当然，功能没有那么好
      wsl strings -a /mnt/d/OpenBrowserDownload/file/brave | wsl grep -i 'KEY' 这个grep就是过滤索引

总结：Linux真难用
