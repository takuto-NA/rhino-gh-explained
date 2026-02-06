---
order: 90
---

# Rhino コマンド早見表（入力・よく使う・覚えるべき）

**Q: このページの目的は？**

A: このリポジトリ内で登場したRhinoコマンドを、**「入力の型」**と**「用途別の一覧」**として参照できるようにまとめます。コマンドの厳密な仕様・オプションは、必要に応じて [参考資料・公式ドキュメント](/references) のRhinoヘルプを参照してください。

## 入力（覚えておくべき「操作の型」）

**Q: “正確に入力して形状の意図を担保する”ために、最低限なにを使うべきですか？**

A: 本リポジトリで繰り返し登場する前提は、次の組み合わせです（Fusion 360の拘束の代替として扱います）。

- **Osnap（スナップ）＋数値入力**: 端点/中点/中心などを確実に拾い、数値で寸法を固定します。
- **Ortho / Polar**: 直交・角度方向を安定させます。
- **基準（CPlane / 平面 / 点）で管理する**: 分割・穴位置のように後から動く要素は、サーフェス形状ではなく基準に紐付けます。

**Q: コマンド名が環境によって通らない場合、まず何を疑うべきですか？**

A: 次を優先して確認してください。

- **言語差**: UI言語によりコマンド名が異なる場合があります。英語コマンドで統一して運用する場合は、Rhinoヘルプ（日本語/英語）側の表記を併記してください。
- **バージョン差**: Rhino 7/8 でUI・機能差があります。挙動が異なる場合は該当バージョンのヘルプを参照してください。

## まず覚える（診断・単位・検証）

**Q: “壊れているかもしれない”“後工程で事故る”を最短で潰すには？**

A: 次のコマンドは、モデリングの中盤〜終盤での失敗率を下げます。

| 観点 | コマンド | 目的 | 関連ページ |
| --- | --- | --- | --- |
| **形状タイプの把握** | `What` | Mesh / Brep / SubD を判定する | [ワークフロー：品質の低いメッシュ → 編集可能な曲面 → 製造/解析（Rhino 8）](/rhino/workflow-mesh-to-manufacturable) |
| **破損の検出** | `Check` / `SelBadObjects` | 数学的に破損した要素の検出 | [Fusion 360→Rhino（移行チェックリスト）](/rhino/fusion360-to-rhino), [単位・公差・メッシュ健全性](/rhino/units-tolerance-and-mesh-health) |
| **開口の可視化** | `ShowEdges` | Naked Edges等を可視化 | [単位・公差・メッシュ健全性](/rhino/units-tolerance-and-mesh-health), [エクスポートと最終検証](/rhino/export-and-validation) |
| **単位の確認/変更** | `Units` | ドキュメント単位を確認・変更 | [単位・公差・メッシュ健全性](/rhino/units-tolerance-and-mesh-health) |
| **公差の設定** | `DocumentProperties` | 許容差（Tolerances）を設定 | [単位・公差・メッシュ健全性](/rhino/units-tolerance-and-mesh-health) |
| **断面の検査** | `ClippingPlane` | 内部の肉厚/干渉を視覚検査 | [単位・公差・メッシュ健全性](/rhino/units-tolerance-and-mesh-health), [エクスポートと最終検証](/rhino/export-and-validation) |
| **寸法の検証** | `Distance` / `BoundingBox` / `Dim` | 寸法・スケールの確認 | [Blenderメッシュ→Rhino](/rhino/blender-mesh-to-rhino), [FDM設計ルール](/rhino/fdm-design-rules) |
| **曲率の目安** | `Curvature` | 曲率（変化の急所）を観察 | [点列→線/円弧→DXF（GH）](/grasshopper/point-to-curve-line-arc-dxf) |

## メッシュ：診断・修復・再構築

**Q: 受け取ったメッシュが製造に耐えるか、どのコマンドで判定しますか？**

A: まず診断し、修復で済まない場合は再構築へ切り替えます。

| 種別 | コマンド | 用途 | 関連ページ |
| --- | --- | --- | --- |
| **診断** | `CheckMesh` | メッシュの問題点をレポート | [単位・公差・メッシュ健全性](/rhino/units-tolerance-and-mesh-health), [Blenderメッシュ→Rhino](/rhino/blender-mesh-to-rhino) |
| **診断** | `Dir` | 法線方向の確認 | [単位・公差・メッシュ健全性](/rhino/units-tolerance-and-mesh-health) |
| **修復** | `UnifyMeshNormals` | 法線（表裏）を揃える | [単位・公差・メッシュ健全性](/rhino/units-tolerance-and-mesh-health), [Blenderメッシュ→Rhino](/rhino/blender-mesh-to-rhino) |
| **修復** | `FillMeshHoles` | 穴を塞ぐ | [単位・公差・メッシュ健全性](/rhino/units-tolerance-and-mesh-health) |
| **修復** | `RepairMesh` | 総合的な自動修復 | [単位・公差・メッシュ健全性](/rhino/units-tolerance-and-mesh-health) |
| **再構築** | `QuadRemesh` | 四角形リメッシュ（SubD化の起点） | [メッシュ→SubDワークフロー](/rhino/mesh-to-subd-workflow), [ワークフロー：品質の低いメッシュ → 編集可能な曲面 → 製造/解析（Rhino 8）](/rhino/workflow-mesh-to-manufacturable) |

## SubD ↔ NURBS / Brep

**Q: SubDをいつNURBSへ変換しますか？**

A: 製造・解析など、曲面の接続精度や面構成を評価したい局面で `ToNURBS` を検討します。

| コマンド | 用途 | 関連ページ |
| --- | --- | --- |
| `ToNURBS` | SubD→NURBS/Brepへ変換 | [メッシュ→SubDワークフロー](/rhino/mesh-to-subd-workflow), [ワークフロー：品質の低いメッシュ → 編集可能な曲面 → 製造/解析（Rhino 8）](/rhino/workflow-mesh-to-manufacturable) |

## “作る/切る/合わせる”の基本（頻出）

**Q: 外装・開口・コネクタなどで頻出する基本コマンドは？**

A: 本リポジトリでは、次の組み合わせが繰り返し登場します（詳細は各ページの手順を参照してください）。

| 目的 | コマンド例 | 関連ページ |
| --- | --- | --- |
| **輪郭を作る** | `Rectangle` / `Circle` / `Line` / `InterpCrv` / `CurveThroughPt` / `Point` | [分割・首開口・後加工穴](/rhino/splitting-and-openings), [コネクタ設計とCAD連携](/rhino/connectors-and-cad-integration), [FDM設計ルール](/rhino/fdm-design-rules) |
| **押し出す** | `ExtrudeCrv` | [分割・首開口・後加工穴](/rhino/splitting-and-openings), [コネクタ設計とCAD連携](/rhino/connectors-and-cad-integration) |
| **合流/切り抜き** | `BooleanUnion` / `BooleanDifference` | [分割・首開口・後加工穴](/rhino/splitting-and-openings), [コネクタ設計とCAD連携](/rhino/connectors-and-cad-integration) |
| **オフセット/フランジ** | `Offset` / `OffsetSrf` / `Loft` | [分割・首開口・後加工穴](/rhino/splitting-and-openings), [コネクタ設計とCAD連携](/rhino/connectors-and-cad-integration) |
| **切り出し** | `Split` | [エクスポートと最終検証](/rhino/export-and-validation) |
| **作業安全** | `Copy` / `Lock` | [メッシュ→SubDワークフロー](/rhino/mesh-to-subd-workflow) |

## フィレット/面取り・連続性（CADなら一発、Rhinoでは設計が要る）

**Q: フィレット/面取り（エッジ丸め・C面）やG1/G2連続の確認で、最低限覚えるべきコマンドは？**

**A:** 用途によって「一発で通る」か「面構成＋ブレンドで作る」かが変わります。まずは次を入口として覚えてください（厳密な仕様はヘルプ参照）。

| 観点 | コマンド例 | 目的 | 関連ページ |
| --- | --- | --- | --- |
| **エッジフィレット** | `FilletEdge` | ソリッド/Brepのエッジに丸みを作る | [フィレット/面取り：なぜRhinoは難しくなるか（CAD比較）](/rhino/fillet-and-chamfer-why-hard) |
| **サーフェスフィレット** | `FilletSrf` | サーフェス同士のフィレット（状況依存で難易度高め） | [サーフェスモデリングのフィレット/ブレンド手順](/rhino/fillet-workflow-for-surface-modeling) |
| **エッジ面取り** | `ChamferEdge` | エッジの面取り（C面） | [フィレット/面取り：なぜRhinoは難しくなるか（CAD比較）](/rhino/fillet-and-chamfer-why-hard) |
| **仕上げ（ブレンド面）** | `BlendSrf` | 2境界の間に滑らかな面を作り、面品質を作る | [G0/G1/G2連続の実務](/rhino/g1-g2-continuity-practical) |
| **仕上げ（マッチ）** | `MatchSrf` | 既存の面同士をG1/G2で合わせる | [G0/G1/G2連続の実務](/rhino/g1-g2-continuity-practical) |
| **面品質の可視化** | `Zebra` / `EnvironmentMap` / `CurvatureAnalysis` | 折れ/うねり/曲率ムラを検出する | [品質チェック（連続性・面品質・水密性）](/rhino/quality-checks-continuity-surface-watertight), [G0/G1/G2連続の実務](/rhino/g1-g2-continuity-practical) |

## 参照先

**Q: コマンドのオプションや正確な仕様はどこで確認しますか？**

A: 以下を参照してください。

- [参考資料・公式ドキュメント](/references)
