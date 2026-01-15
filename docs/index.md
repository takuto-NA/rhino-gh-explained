---
layout: home

hero:
  name: Rhino / Grasshopper 技術解説
  text: 参照メッシュから編集可能な形状へ再構築し、3Dプリントに耐えるデータに落とすための要点を解説します。
  tagline: Mesh→SubD/Brep→肉厚→出力→スライサー検証
  actions:
    - theme: brand
      text: 3Dプリント最短ルート
      link: /rhino/workflow-mesh-to-manufacturable
    - theme: alt
      text: Rhinoから読む
      link: /rhino/
    - theme: alt
      text: Grasshopper（GH）へ
      link: /grasshopper/

features:
  - title: Rhino 基礎
    details: メッシュ/公差/形式判断から、製造向けの破綻回避までを扱います。
  - title: Grasshopper 入門
    details: 壊れにくい入力設計と、参照メッシュからの再構築の型を扱います。
  - title: 実践チュートリアル
    details: 「プリント可能」に落とすまでの手順と判断基準を紹介します。
---

## はじめに（最短の読み方）

初見の人が迷わないように、このサイトは **「読む順番」** を用意しています。必要なルートだけ辿ってください。

- **3Dプリントが主目的（迷ったらこれ）**: 最短で「失敗しない出力」まで到達する一本道です。  
  - [ワークフロー：品質の低いメッシュ → 編集可能な曲面 → 製造/解析（Rhino 8）](/rhino/workflow-mesh-to-manufacturable) → [単位・公差・メッシュ健全性（製造に入る前のチェック）](/rhino/units-tolerance-and-mesh-health) → [可変肉厚シェル（破綻しにくい順序）](/rhino/variable-thickness-shell) → [エクスポート（STL/3MF）と最終検証（スライサーでの検証）](/rhino/export-and-validation)
- **Rhino中心で進めたい**: まずは「全体像」と「事故を防ぐ前提」を押さえます。  
  - [ワークフロー：品質の低いメッシュ → 編集可能な曲面 → 製造/解析（Rhino 8）](/rhino/workflow-mesh-to-manufacturable) → [単位・公差・メッシュ健全性（製造に入る前のチェック）](/rhino/units-tolerance-and-mesh-health)
- **Grasshopper中心で進めたい**: まずは「壊れにくい作り方」を押さえます。  
  - [Grasshopperの「履歴」と後編集（壊れにくい作り方）](/grasshopper/history-and-editing) → [パラメータ設計（壊れにくい入力の作り方）](/grasshopper/parameter-design)
- **Fusion 360から来た**: 先に「設計思想の違い」を把握してからコマンド・公差へ進みます。  
  - [Fusion 360ユーザー向け: Rhinoの違いと戸惑いポイント（移行チェックリスト）](/rhino/fusion360-to-rhino) → [Rhino コマンド早見表（入力・よく使う・覚えるべき）](/rhino/commands)

## 前提（このサイトが暗黙に置いていること）

- **バージョン**: 断りがない限り、Rhino 7/8 と Grasshopper標準コンポーネントを前提にします（プラグイン依存は明記します）。
- **重要な前提**: 単位・公差・データ形式（Mesh/Brep/SubD）を最初に揃えると、後工程の失敗が大幅に減ります。

**Q: このサイトの目的は？**

A: RhinoとGrasshopperの基礎から実践までを、短い記事で順番に学べるようにまとめています。

**Q: 参考資料はどこにありますか？**

A: このドキュメント全体で参照すべき公式ドキュメントとリソースについては、[参考資料・公式ドキュメント](/references)を参照してください。

**Q: Fusion 360から来た場合、どこから読むべきですか？**

A: Rhinoの設計思想の違いと戸惑いポイントを先に把握してください。以下を参照してください。

- [Fusion 360ユーザー向け: Rhinoの違いと戸惑いポイント（移行チェックリスト）](/rhino/fusion360-to-rhino)

**Q: Rhinoでよく使うコマンドや入力の要点を、まとめて参照できるページはありますか？**

A: 以下を参照してください。

- [Rhino コマンド早見表（入力・よく使う・覚えるべき）](/rhino/commands)