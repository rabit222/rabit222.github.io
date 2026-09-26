---
title: 闪的好快
date: 2026-09-24
tags: [Bugku, MISC, 图片处理]
excerpt: GIF 拆帧 + 二维码解码，WPS 提取帧立大功。
---

## 解题思路

下载附件得到一张 `.gif` 动图，画面闪得很快，猜测每一帧里都藏了二维码，需要逐帧扫码。

一开始想录屏、调速度再截图，但太麻烦。后来在 WPS 里看到“提取每一帧”的功能，直接得到全部帧图。先扫了一两张，发现内容以 `s` 开头，说明大概率要把每帧结果按顺序拼接。于是找二维码批量/在线解码工具，用草料二维码解码站处理，拿到结果。

## 工具

- WPS：提取 GIF 每一帧
- 草料二维码解码：https://cli.im/deqr

## 更推荐的本地方案

在线站可能有次数、付费或隐私限制，CTF 里更稳的是本地拆帧 + 本地扫码。

```bash
# 1. 提取 GIF 所有帧
ffmpeg -i flash.gif -vsync 0 frames/frame_%04d.png

# 或者用 ImageMagick
magick convert flash.gif -coalesce frames/frame_%04d.png

# 2. 批量识别二维码
for f in frames/*.png; do
  echo "== $f =="
  zbarimg -q "$f"
done
