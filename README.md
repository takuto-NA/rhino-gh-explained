# Rhino / Grasshopper 技術解説

VitePressで構築されたRhinoおよびGrasshopperの技術解説サイトです。

## 公開サイト

- **Rhino / Grasshopper 技術解説**: `https://takuto-na.github.io/rhino-gh-explained/`

## 最短の読み方（初見向け）

「何から読めばいいか分からない」を最優先で潰すために、サイト側のトップに **読む順番** を用意しています。

- **サイトトップ（読む順番）**: `docs/index.md`（公開サイトではホーム）
- **Rhinoの入口**: `docs/rhino/index.md`
- **Grasshopperの入口**: `docs/grasshopper/index.md`
- **公式リンク集**: `docs/references.md`

## ローカル開発

推奨Node.js: **20.x**（GitHub Actions と合わせるため。20以上で動作します）

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run docs:dev
```

## ビルド

```bash
npm run docs:build
```

## デプロイ

`main`ブランチにプッシュすると、GitHub Actionsによって自動的にGitHub Pagesへデプロイされます。
デプロイ先の設定は `docs/.vitepress/config.mts` の `base` フィールドを確認してください。

## ページ追加

`docs/rhino/` または `docs/grasshopper/` に Markdown を追加すると、サイドバーは自動で更新されます（詳細は `CONTRIBUTING.md`）。

## 執筆方針（文章のルール）

記事のトーン・出典・ファクトチェック方針は `docs/writing-guidelines.md` を参照してください（GitHubで要点だけ見たい場合は `WRITING_GUIDE.md`）。
