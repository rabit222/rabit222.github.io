#!/usr/bin/env python3
"""扫描 posts/ 目录生成 posts.json 索引"""
import os, json, re, glob, sys

POSTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "posts")
OUTPUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "posts.json")

def parse_frontmatter(content):
    """提取 Markdown frontmatter"""
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
        slug = os.path.splitext(os.path.basename(f))[0]
        # 自动提取摘要
        if 'excerpt' not in fm:
            clean = re.sub(r'<[^>]+>', '', body).strip()
            fm['excerpt'] = clean[:100] + '...' if len(clean) > 100 else clean
        posts.append({
            "slug": slug,
            "title": fm.get("title", slug),
            "date": fm.get("date", "2024-01-01"),
            "tags": fm.get("tags", []),
            "excerpt": fm.get("excerpt", "")
        })
    # 按日期倒序
    posts.sort(key=lambda x: x["date"], reverse=True)
    with open(OUTPUT, 'w', encoding='utf-8') as fp:
        json.dump(posts, fp, ensure_ascii=False, indent=2)
    print(f"✓ 生成 {len(posts)} 篇文章索引 → {OUTPUT}")

if __name__ == "__main__":
    main()
