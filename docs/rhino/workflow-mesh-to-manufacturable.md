---
order: 5
---

# ワークフロー: 汚いメッシュ → 編集可能な曲面 → 製造/解析へ（Rhino 8）

このサイトの中心テーマは、次のような **“再構築”** です。

- **入力**: 既存の汚いデータ（スキャン/彫刻/ゲーム用/三角形だらけのメッシュなど）
- **目的**: 編集可能な形に再構築して、厚み・分割・穴・機構統合を行い、**3Dプリント**または**解析**へ回す

アニマトロニクスは1つの題材ですが、同じ悩みはプロップ、フィギュア、建築モック、工業デザイン、解析用モデル化などでも起きます。  
ここではフロー自体を一般化して整理します。

## 全体像（おすすめの分岐）

### 1) データタイプを確定する

- Meshなのか、Brep（NURBSソリッド）なのか、SubDなのか
  - コマンド: `What`

### 2) メッシュが汚い場合の基本方針

- **修復より再構築を優先する**（時間効率を重視）
  - `CheckMesh` / `ShowEdges` で致命的な問題の有無を確認
  - 直すと破綻しそうなら **`QuadRemesh` → SubD** に切り替える

### 3) 造形（有機形状）はSubD、精密/当たり面はBrep

- SubDは造形（有機形状の作成）に適している
- Brep（NURBS）は穴あけ/厚み付け/ソリッド演算/当たり面の作成に適している

> SubD/NURBS/Brepの概念: `subd-vs-nurbs-brep.md`
> 受け渡し（STEP/IGES/STL/3MF）: `subd-cad-interoperability-and-formats.md`

### 4) 厚みは「均一殻 → 後で補強」が安全

- いきなり可変厚みにしない
- 均一厚みで“閉じた殻”を作り、最後にフランジ/リブ/ボスを足す

> 厚み付けの実務手順: `variable-thickness-shell.md`

### 5) 分割・開口・穴は“基準”で後から確定できるように

- 目などの穴は“基準点/基準面”を先に作っておき、形状は後段で確定
- 分割は合わせ面（フランジ）と位置決めが鍵

> 分割/開口/穴: `splitting-and-openings.md`

### 6) 製造/解析に回す前に必ず検証する

- Rhino側の健全性チェック＋スライサー/メッシュ品質の確認

> 出力/検証: `export-and-validation.md`

## どこまでNURBSにすべきか？

目的で変わります。

- **3Dプリントが主目的**: 最終がSTL/3MFなので、“壊れない殻”になっていれば、必ずしも全てをNURBSにする必要はない
- **解析/面品質が主目的**: NURBS/Brepで面構成を管理する価値が上がる

このサイトでは、効率的に成功する方向（SubD中心）を主軸に、必要に応じてNURBSへ移行する判断を解説します。

## ケーススタディ（例）

同じフローを、用途別の具体例として見ると理解が速いです。

- **FDMでの薄肉/補強/分割の考え方**: `fdm-design-rules.md`
- **コネクタ/機構CADとの統合**: `connectors-and-cad-integration.md`

## 関連ページ

- `units-tolerance-and-mesh-health.md`（単位/公差/メッシュ健全性）
- `mesh-to-subd-workflow.md`（QuadRemesh→SubD）
- `variable-thickness-shell.md`（Offset/Shell/OffsetMesh）
- `splitting-and-openings.md`（分割/開口/穴）
- `connectors-and-cad-integration.md`（当たり面/コネクタ/機構統合）
- `export-and-validation.md`（STL/3MFと検証）

