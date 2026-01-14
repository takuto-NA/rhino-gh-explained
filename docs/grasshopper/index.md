# Grasshopper 解説

Grasshopperは、Rhino上で動作するビジュアルプログラミングツールです。パラメトリックなモデル作成やアルゴリズミックデザインを可能にします。

## コンテンツ

- `history-and-editing.md`: Grasshopperの「履歴」と後編集（壊れにくい作り方）
- `parameter-design.md`: パラメータ設計（壊れにくい入力の作り方）
- `mesh-reference-to-brep-rebuild.md`: 参照メッシュ→曲線→NURBS/Brep（壊れにくい再構築の型）
- `parametric-shell-example.md`: 実例: メッシュ原型→編集可能な外装（最小GH構成）
- `point-to-curve.md`: 点列からCurveを作る（選定基準とアルゴリズムの要点）
- `diagrams.md`: MermaidでGH配線図（ポート/グループ）を描く仕様とテンプレ

## おすすめの読み順（Blender等のメッシュ→最終Brep）

- `history-and-editing.md`（参照とベイク、不安定な参照の回避）
- `parameter-design.md`（入力設計：基準/ランドマーク/断面）
- `mesh-reference-to-brep-rebuild.md`（参照メッシュから曲線/面/Brepへ組み直す）
- `parametric-shell-example.md`（最小構成の全体像と運用）
- `point-to-curve.md`（点列からCurveを生成する際の選定基準とアルゴリズムの要点）

## Rhino側のワークフローとの関係

Rhinoでの「汚いメッシュ→編集可能な形→製造/解析」全体像は、こちらにまとめています。

- `../rhino/workflow-mesh-to-manufacturable.md`
