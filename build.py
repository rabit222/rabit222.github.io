#!/usr/bin/env python3
"""
博客文章索引生成器
────────────────
扫描 posts/ 目录下的 Markdown 文件，提取 frontmatter 元数据，生成 posts.json。
博客前端通过读取 posts.json 来获取文章列表，无需后端。

用法：
    python3 build.py
"""

import os
import re
import json

POSTS_DIR = "posts"
OUTPUT_FILE = "posts.json"


def parse_frontmatter(text):
    """解析 Markdown 文件开头的 YAML frontmatter"""
    match = re.match(r'^\ufeff?---\s*\n(.*?)\n---\s*\n(.*)', text, re.DOTALL)
    if not match:
        return {}, text

    fm_str, body = match.groups()
    meta = {}
    current_key = None

    for line in fm_str.split('\n'):
        stripped = line.strip()
        # 列表项: - value
        if stripped.startswith('-') and current_key and isinstance(meta.get(current_key), list):
            val = stripped.lstrip('-').strip().strip('"\'')
            meta[current_key].append(val)
            continue

        # key: value
        m = re.match(r'^(\w+)\s*:\s*(.*)', line)
        if m:
            key, val = m.groups()
            val = val.strip()
            if val.startswith('[') and val.endswith(']'):
                # 行内数组 [a, b, c]
                items = val[1:-1].split(',')
                meta[key] = [item.strip().strip('"\'') for item in items if item.strip()]
                current_key = None
            elif val == '':
                # 多行数组，后续行是列表项
                meta[key] = []
                current_key = key
            else:
                meta[key] = val.strip('"\'')
                current_key = None
        elif stripped == '' and current_key:
            continue

    return meta, body


def extract_slug(filename):
    """从文件名提取 slug: 2024-01-15-welcome.md -> welcome"""
    name = filename
    if name.endswith('.md'):
        name = name[:-3]
    name = re.sub(r'^\d{4}-\d{2}-\d{2}-', '', name)
    return name


def extract_excerpt(content, length=120):
    """从正文内容生成摘要"""
    text = re.sub(r'```[\s\S]*?```', '', content)          # 代码块
    text = re.sub(r'!\[.*?\]\(.*?\)', '', text)            # 图片
    text = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', text)        # 链接保留文字
    text = re.sub(r'[#*`>~]', '', text)                    # 去掉 markdown 符号
    text = re.sub(r'\s+', ' ', text).strip()
    return text[:length] + ('...' if len(text) > length else '')


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    posts_path = os.path.join(script_dir, POSTS_DIR)
    output_path = os.path.join(script_dir, OUTPUT_FILE)

    posts = []

    if not os.path.isdir(posts_path):
        print(f"[warn] posts/ 目录不存在，生成空索引。")
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump({"posts": []}, f, ensure_ascii=False, indent=2)
        return

    for filename in sorted(os.listdir(posts_path)):
        if not filename.endswith('.md'):
            continue

        filepath = os.path.join(posts_path, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            text = f.read()

        meta, body = parse_frontmatter(text)

        slug = meta.get('slug') or extract_slug(filename)
        title = meta.get('title') or slug
        date = meta.get('date', '')
        tags = meta.get('tags', [])
        if isinstance(tags, str):
            tags = [tags]
        excerpt = meta.get('excerpt') or extract_excerpt(body)

        # 如果 frontmatter 没有日期，尝试从文件名提取
        if not date:
            m = re.match(r'(\d{4}-\d{2}-\d{2})', filename)
            if m:
                date = m.group(1)

        posts.append({
            "slug": slug,
            "file": f"posts/{filename}",
            "title": title,
            "date": date,
            "tags": tags,
            "excerpt": excerpt,
        })

    # 按日期降序排序
    posts.sort(key=lambda p: p.get('date', ''), reverse=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump({"posts": posts}, f, ensure_ascii=False, indent=2)

    print(f"[ok] 索引生成完成：{len(posts)} 篇文章 -> {OUTPUT_FILE}")
    for p in posts:
        print(f"     [{p['date']}] {p['title']}")


if __name__ == '__main__':
    main()
