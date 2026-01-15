# Rhino 解説

> - はじめに（読む順番）: [ホーム](/)
> - 公式リンク集: [参考資料・公式ドキュメント](/references)

## 最短ルート（3Dプリントで失敗しない）

参照メッシュがあり、「まずプリント可能なデータに落とす」ことが目的なら、以下の順序で進めます。

- [ワークフロー：品質の低いメッシュ → 編集可能な曲面 → 製造/解析（Rhino 8）](/rhino/workflow-mesh-to-manufacturable)
- [単位・公差・メッシュ健全性（製造に入る前のチェック）](/rhino/units-tolerance-and-mesh-health)
- [メッシュ原型 → SubDへ（QuadRemeshを軸に再構築）](/rhino/mesh-to-subd-workflow)
- [可変肉厚シェル（破綻しにくい順序）](/rhino/variable-thickness-shell)
- [分割・首開口・後加工穴](/rhino/splitting-and-openings)
- [エクスポート（STL/3MF）と最終検証（スライサーでの検証）](/rhino/export-and-validation)

**Q: Rhinoとは何ですか？**

A: Rhino（Rhinoceros）は、建築、プロダクトデザイン、ジュエリーデザインなど、幅広い分野で使用されている高精度な3Dモデリングソフトです。

**Q: このセクションのコンテンツは？**

A: 「外部から来たデータを破綻させずに扱い、製造/解析に渡す」ために必要な **Rhino側の前提・判断・コマンド** をまとめます。

- **全体像（最初に読む）**: [ワークフロー：品質の低いメッシュ → 編集可能な曲面 → 製造/解析（Rhino 8）](/rhino/workflow-mesh-to-manufacturable)
- **事故を防ぐ前提**: [単位・公差・メッシュ健全性（製造に入る前のチェック）](/rhino/units-tolerance-and-mesh-health)
- **コマンド参照（困ったら戻る）**: [Rhino コマンド早見表（入力・よく使う・覚えるべき）](/rhino/commands)

## この記事群で扱うこと（リンク集）

- **入力メッシュの受け渡し**: [Blenderメッシュ→Rhino（読み込みと破綻予防）](/rhino/blender-mesh-to-rhino)
- **メッシュ→SubD**: [メッシュ→SubDワークフロー](/rhino/mesh-to-subd-workflow)
- **SubDとBrepの違い**: [SubD vs NURBS/Brep（何をいつ使うか）](/rhino/subd-vs-nurbs-brep)
- **SubDのCAD連携/形式**: [SubD：CAD互換とデータ形式](/rhino/subd-cad-interoperability-and-formats)
- **厚み付け**: [可変肉厚シェル（破綻しにくい順序）](/rhino/variable-thickness-shell)
- **分割・開口**: [分割・首開口・後加工穴](/rhino/splitting-and-openings)
- **コネクタ設計**: [コネクタ設計とCAD連携](/rhino/connectors-and-cad-integration)
- **FDM設計**: [FDM設計ルール](/rhino/fdm-design-rules)
- **書き出しと最終検証**: [エクスポート（STL/3MF）と最終検証（スライサーでの検証）](/rhino/export-and-validation)

**Q: 参考資料はどこにありますか？**

A: 公式ドキュメントやAPIリファレンスについては、[参考資料・公式ドキュメント](/references)を参照してください。

## 概要（移行ガイド）

Q: Fusion 360からRhinoに移行する場合、最初に読むべきページは？

A: まずは以下を参照してください。

- [Rhino コマンド早見表（入力・よく使う・覚えるべき）](/rhino/commands)
- [Fusion 360ユーザー向け: Rhinoの違いと戸惑いポイント（移行チェックリスト）](/rhino/fusion360-to-rhino)