# Grasshopper 解説

**Q: Grasshopperとは何ですか？**

A: Grasshopperは、Rhino上で動作するビジュアルプログラミングツールです。パラメトリックなモデル作成やアルゴリズミックデザインを可能にします。

**Q: このセクションのコンテンツは？**

A: 以下の内容を扱います：
- `history-and-editing.md`: Grasshopperの「履歴」と後編集（壊れにくい作り方）
- `parameter-design.md`: パラメータ設計（壊れにくい入力の作り方）
- `mesh-reference-to-brep-rebuild.md`: 参照メッシュ→曲線→NURBS/Brep（壊れにくい再構築の型）
- `parametric-shell-example.md`: 実例: メッシュ原型→編集可能な外装（最小GH構成）
- `point-to-curve.md`: 点列からCurveを作る（選定基準：概要）
- `point-to-curve-interpolate.md`: Interpolate（補間）の詳細
- `point-to-curve-fit-polyline.md`: Fit Curve（近似）とPolyline（折れ線）
- `point-to-curve-line-arc-dxf.md`: 直線・円弧（LINE/ARC）で点列を再現（DXF）
- `point-to-curve-nurbs-interpolation-notes.md`: 付録: NURBS補間のアルゴリズム要点と制御点抽出
- `diagrams.md`: MermaidでGH配線図（ポート/グループ）を描く仕様とテンプレ

**Q: おすすめの読み順は？（Blender等のメッシュ→最終Brep）**

A: 以下の順序で読むことを推奨します：
- `history-and-editing.md`（参照とベイク、不安定な参照の回避）
- `parameter-design.md`（入力設計：基準/ランドマーク/断面）
- `mesh-reference-to-brep-rebuild.md`（参照メッシュから曲線/面/Brepへ組み直す）
- `parametric-shell-example.md`（最小構成の全体像と運用）
- `point-to-curve.md`（点列→Curveの選定基準：概要）
  - 詳細: `point-to-curve-interpolate.md` / `point-to-curve-fit-polyline.md` / `point-to-curve-line-arc-dxf.md`

**Q: Rhino側のワークフローとの関係は？**

A: Rhinoでの「品質の低いメッシュ→編集可能な形状→製造/解析」全体像は、`../rhino/workflow-mesh-to-manufacturable.md`にまとめています。

**Q: 参考資料はどこにありますか？**

A: 公式ドキュメントやAPIリファレンスについては、[参考資料・公式ドキュメント](/references)を参照してください。
