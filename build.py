#!/usr/bin/env python3
"""扫描 posts/ 目录生成 posts.json 索引
slug 字段 = URL 编码后的完整文件名（含 .md），前端不用再编码
file 字段 = 原始文件名（用于 GitHub edit 链接）
"""
import os, json, re, glob, sys
from urllib.parse import quote

POSTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "posts")
OUTPUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "posts.json")

def parse_frontmatter(content):
    fm = {}
    match = re.match(r'^---\s*\n(.*?)\n---', content, re.DOTALL)
    if not match:
        return fm, content
    for line in match.group(1).split('\n'):
        if ':' in line:
            key, val = line.split(':', 1)
            val = val.strip()
            if val.startswith('['):
                val = [x.strip() for x in val.strip('[]').split(',') if x.strip()]
            fm[key.strip()] = val
    return fm, content[match.end():]

def main():
    posts = []
    for f in sorted(glob.glob(os.path.join(POSTS_DIR, "*.md"))):
        with open(f, 'r', encoding='utf-8') as fp:
            content = fp.read()
        fm, body = parse_frontmatter(content)
        raw_name = os.path.basename(f)  # 原始文件名（含 .md）
        # slug = URL 编码后的完整文件路径（posts/xxx 编码后），前端拿来直接 fetch
        slug = quote(raw_name, safe='')
        # 自动提取摘要
        if 'excerpt' not in fm:
            clean = re.sub(r'<[^>]+>', '', body).strip()
            fm['excerpt'] = clean[:100] + '...' if len(clean) > 100 else clean
        posts.append({
            "slug": slug,                                  # URL 编码后文件名（带 .md）
            "raw": raw_name,                               # 原始文件名（用于 GitHub edit 链接）
            "title": fm.get("title", os.path.splitext(raw_name)[0]),
            "date": fm.get("date", "2024-01-01"),
            "tags": fm.get("tags", []),
            "excerpt": fm.get("excerpt", "")
        })
    posts.sort(key=lambda x: x["date"], reverse=True)
    with open(OUTPUT, 'w', encoding='utf-8') as fp:
        json.dump(posts, fp, ensure_ascii=False, indent=2)
    print(f"✓ 生成 {len(posts)} 篇文章索引 → {OUTPUT}")
    for p in posts:
        print(f"  {p['slug']}  ←  {p['raw']}")

if __name__ == "__main__":
    main()
