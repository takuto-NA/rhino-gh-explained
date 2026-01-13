# Contributing

## セットアップ

- Node.js: **20以上**（推奨: 20.x）

```bash
npm install
npm run docs:dev
```

## ページ追加（推奨ルール）

このリポジトリは **サイドバーを自動生成**します。基本的に **`docs/` 配下に Markdown を追加するだけ**でOKです。

- Rhino: `docs/rhino/*.md`
- Grasshopper: `docs/grasshopper/*.md`

### 並び順を制御したい場合

Markdown先頭に `order` を入れてください（小さいほど上に表示）。

```md
---
order: 10
---

# タイトル
```

### タイトル

サイドバーの表示名は、原則として Markdown 内の最初の `# 見出し` を使います。

