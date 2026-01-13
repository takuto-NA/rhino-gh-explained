# Rhino & Grasshopper 解説

VitePressで構築されたRhinoとGrasshopperの解説サイトです。

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
