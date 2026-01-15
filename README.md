# Rhino / Grasshopper 技術解説

VitePressで構築されたRhinoおよびGrasshopperの技術解説サイトです。

## 公開サイト

- [Rhino / Grasshopper 技術解説（公開サイト）](https://takuto-na.github.io/rhino-gh-explained/)

## 想定読者（このサイトが刺さる人）

- CADには精通しているが、**有機形状を製造（3Dプリンタ/CNC）に耐えるデータ**に落とすのが難しい
- 参照用のメッシュ（スキャン/彫刻/Blender等）があり、そこから **編集可能な形状**へ持っていきたい
- 単位・公差・水密性（Watertight）・薄肉や自己交差など、**失敗しやすい落とし穴**を先に潰したい

## 最短の読み方（初見向け）

「何から読めばいいか分からない」を最優先で潰すために、サイト側のトップに **読む順番** を用意しています。

- **サイトトップ（読む順番）**: [docs/index.md](docs/index.md)（公開サイトではホーム）
- **Rhinoの入口**: [docs/rhino/index.md](docs/rhino/index.md)
- **Grasshopperの入口**: [docs/grasshopper/index.md](docs/grasshopper/index.md)
- **公式リンク集**: [docs/references.md](docs/references.md)

### 3Dプリント最短ルート（迷ったらこれ）

Rhino側の「前提→形式判断→厚み→出力→スライサー検証」を一気に通します。

- [ワークフロー：品質の低いメッシュ → 編集可能な曲面 → 製造/解析（Rhino 8）](docs/rhino/workflow-mesh-to-manufacturable.md)
- [単位・公差・メッシュ健全性（製造に入る前のチェック）](docs/rhino/units-tolerance-and-mesh-health.md)
- [メッシュ原型 → SubDへ（QuadRemeshを軸に再構築）](docs/rhino/mesh-to-subd-workflow.md)
- [可変肉厚シェル（破綻しにくい順序）](docs/rhino/variable-thickness-shell.md)
- [エクスポート（STL/3MF）と最終検証（スライサーでの検証）](docs/rhino/export-and-validation.md)

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
