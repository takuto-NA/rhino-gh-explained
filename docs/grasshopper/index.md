# Grasshopper 解説

> - はじめに（読む順番）: [ホーム](/)
> - 公式リンク集: [参考資料・公式ドキュメント](/references)

**Q: Grasshopperとは何ですか？**

A: Grasshopperは、Rhino上で動作するビジュアルプログラミングツールです。パラメトリックなモデル作成やアルゴリズミックデザインを可能にします。

**Q: このセクションのコンテンツは？**

A: 「後から変更できる形」を作るために、Grasshopperの **壊れにくい設計** と **定番ワークフロー** をまとめます。

## 最短の読み順（迷ったらこれ）

- [Grasshopperの「履歴」と後編集（壊れにくい作り方）](/grasshopper/history-and-editing)
- [パラメータ設計（壊れにくい入力の作り方）](/grasshopper/parameter-design)
- [参照メッシュからNURBS/Brepへ再構築（Grasshopperの"壊れにくい型"）](/grasshopper/mesh-reference-to-brep-rebuild)
- [実例: メッシュ原型→編集可能な外装（最小GH構成）](/grasshopper/parametric-shell-example)

## 3Dプリント目的でGHを使う場合（入口）

Rhino側の最短ルート（肉厚→出力→スライサー検証）に対して、Grasshopperは「参照メッシュから、壊れにくい曲線/面/Brepを組む」局面で効きます。

- **全体像（Rhino側）**: [ワークフロー：品質の低いメッシュ → 編集可能な曲面 → 製造/解析（Rhino 8）](/rhino/workflow-mesh-to-manufacturable)
- **GH側の型**: [参照メッシュからNURBS/Brepへ再構築（Grasshopperの"壊れにくい型"）](/grasshopper/mesh-reference-to-brep-rebuild)

## 用途別リンク

- **点列からCurveを作る（選び方）**: [点列からCurveを作る（選定基準：概要）](/grasshopper/point-to-curve)
  - 詳細: [Interpolate（補間）の詳細](/grasshopper/point-to-curve-interpolate) / [Fit Curve（近似）とPolyline（折れ線）](/grasshopper/point-to-curve-fit-polyline) / [直線・円弧（LINE/ARC）で点列を再現（DXF）](/grasshopper/point-to-curve-line-arc-dxf)
  - 付録: [NURBS補間のアルゴリズム要点と制御点抽出](/grasshopper/point-to-curve-nurbs-interpolation-notes)
- **配線図を文章で残す**: [MermaidによるGrasshopper（GH）配線図の作成](/grasshopper/diagrams)

**Q: おすすめの読み順は？（Blender等のメッシュ→最終Brep）**

A: 以下の順序で読むことを推奨します：
- [Grasshopperの「履歴」と後編集（壊れにくい作り方）](/grasshopper/history-and-editing)（参照とベイク、不安定な参照の回避）
- [パラメータ設計（壊れにくい入力の作り方）](/grasshopper/parameter-design)（入力設計：基準/ランドマーク/断面）
- [参照メッシュからNURBS/Brepへ再構築（Grasshopperの"壊れにくい型"）](/grasshopper/mesh-reference-to-brep-rebuild)（参照メッシュから曲線/面/Brepへ組み直す）
- [実例: メッシュ原型→編集可能な外装（最小GH構成）](/grasshopper/parametric-shell-example)（最小構成の全体像と運用）
- [点列からCurveを作る（選定基準：概要）](/grasshopper/point-to-curve)（点列→Curveの選定基準：概要）
  - 詳細: [Interpolate（補間）の詳細](/grasshopper/point-to-curve-interpolate) / [Fit Curve（近似）とPolyline（折れ線）](/grasshopper/point-to-curve-fit-polyline) / [直線・円弧（LINE/ARC）で点列を再現（DXF）](/grasshopper/point-to-curve-line-arc-dxf)

**Q: Rhino側のワークフローとの関係は？**

A: Rhinoでの「品質の低いメッシュ→編集可能な形状→製造/解析」全体像は、[ワークフロー：品質の低いメッシュ → 編集可能な曲面 → 製造/解析（Rhino 8）](/rhino/workflow-mesh-to-manufacturable) にまとめています。

**Q: 参考資料はどこにありますか？**

A: 公式ドキュメントやAPIリファレンスについては、[参考資料・公式ドキュメント](/references)を参照してください。
