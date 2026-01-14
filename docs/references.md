---
order: 999
---

# 参考資料・公式ドキュメント

**Q: このページの目的は？**

A: このドキュメント全体で参照すべき公式ドキュメントとリソースをまとめます。

## 公式ドキュメント

### Rhino

**Q: Rhino公式ドキュメントはどこにありますか？**

A: 以下のリソースを参照します：
- URL: `https://docs.mcneel.com/rhino/`
- 内容: Rhinoのコマンド、機能、操作方法の詳細な説明
- 用途: コマンドの正確な仕様、パラメータ、オプションを確認する際に参照

**Q: Rhinoの日本語ヘルプはどこにありますか？**

A: 以下のリソースを参照します：
- URL: `https://docs.mcneel.com/rhino/8/help/ja-jp/`
- 内容: Rhino 8の日本語ヘルプドキュメント
- 用途: 日本語での詳細な説明が必要な場合

### Grasshopper

**Q: Grasshopper公式ドキュメントはどこにありますか？**

A: 以下のリソースを参照します：
- URL: `https://www.rhino3d.com/docs/grasshopper/`
- 内容: Grasshopperの基本機能、コンポーネント、データ構造の説明
- 用途: コンポーネントの仕様、入力/出力、挙動を確認する際に参照

### RhinoCommon API

**Q: RhinoCommon APIリファレンスはどこにありますか？**

A: 以下のリソースを参照します：
- URL: `https://docs.mcneel.com/rhino/8/rhinocommon/`
- 内容: RhinoCommonのクラス、メソッド、プロパティの詳細なAPIリファレンス
- 用途: Python/C#スクリプト、プラグイン開発時に参照

**Q: RhinoCommon APIの日本語リファレンスはどこにありますか？**

A: 以下のリソースを参照します：
- URL: `https://docs.mcneel.com/rhino/8/rhinocommon/ja-jp/`
- 内容: RhinoCommon APIの日本語リファレンス
- 用途: 日本語でのAPI仕様確認が必要な場合

**Q: `Evaluate Length`の内部実装の根拠はどこにありますか？**

A: `Evaluate Length`は内部的に「弧長を許容誤差内で評価し、指定距離に対応するパラメータを求める」系のAPIに相当します。NURBSでは弧長が一般に解析的に出ないため、これらは **tolerance を指定する数値近似**として設計されています。以下のAPIを参照します：

- **`Rhino.Geometry.Curve.GetLength`（fractionalTolerance つき）**
  - URL: `https://softcn.store/docs/rhino/html/M_Rhino_Geometry_Curve_GetLength_3.htm`
  - メモ: 上記はRhinoCommon APIリファレンスのミラー（公式サイト側のURLが変わることがあるため、メソッド名でも検索推奨）
- **`Rhino.Geometry.Curve.LengthParameter`（fractionalTolerance つき）**
  - URL: `https://softcn.store/docs/rhino/html/M_Rhino_Geometry_Curve_LengthParameter.htm`
  - メモ: 上記はRhinoCommon APIリファレンスのミラー（公式サイト側のURLが変わることがあるため、メソッド名でも検索推奨）

**Q: NURBSの数学的基礎を学ぶための参考書はありますか？**

A: 以下の参考書を参照します：
- **Piegl, Les / Tiller, Wayne: _The NURBS Book_ (2nd Edition), Springer**
  - 内容: NURBSの基礎、評価、微分、弧長・パラメータ化などの定番まとめ

### スクリプト・開発

**Q: Rhinoスクリプト作成のガイドはどこにありますか？**

A: 以下のリソースを参照します：
- URL: `https://www.rhino3d.com/jp/features/developer/scripting/`
- 内容: Rhinoでのスクリプト作成（Python、C#）に関する情報
- 用途: スクリプト開発の基礎を学ぶ際に参照

**Q: Rhinoスクリプトのヘルプはどこにありますか？**

A: 以下のリソースを参照します：
- URL: `https://docs.mcneel.com/rhino/8/help/ja-jp/seealso/sak_scripting.htm`
- 内容: Rhinoのスクリプト作成に関するヘルプ
- 用途: コマンドマクロ、スクリプト用コマンドの詳細確認

## コミュニティ・フォーラム

**Q: Rhino/Grasshopperのコミュニティフォーラムはどこにありますか？**

A: 以下のリソースを参照します：
- **McNeelフォーラム（Discourse）**
  - URL: `https://discourse.mcneel.com/`
  - 内容: Rhino/Grasshopperのユーザーコミュニティフォーラム
  - 用途: 実務での問題解決、ベストプラクティスの共有、質問・回答

**Q: Grasshopper専用のフォーラムはどこにありますか？**

A: 以下のリソースを参照します：
- URL: `https://discourse.mcneel.com/c/grasshopper`
- 内容: Grasshopper専用のフォーラム
- 用途: Grasshopper特有の問題、コンポーネントの使い方、ワークフローの相談

## 技術仕様・アルゴリズム

**Q: NURBSの数学的基礎を学ぶにはどこを参照しますか？**

A: 以下のリソースを参照します：
- 内容: NURBS曲線・曲面の数学的基礎
- 用途: アルゴリズムの理解、挙動の予測、問題の原因特定
- 参考: RhinoCommon APIドキュメント内のNURBS関連クラスの説明

**Q: ジオメトリの単位と公差について学ぶにはどこを参照しますか？**

A: 以下のリソースを参照します：
- 内容: Rhinoの単位系、公差設定、数値精度
- 用途: 薄肉設計、精密な形状作成時の設定確認
- 参考: Rhinoヘルプの「Units」「Tolerance」関連セクション

## バージョン情報

**Q: Rhinoのリリースノートはどこにありますか？**

A: 以下のリソースを参照します：
- URL: `https://www.rhino3d.com/download/rhino/8/`
- 内容: 各バージョンの新機能、変更点、修正内容
- 用途: バージョン間の挙動差を確認する際に参照

**Q: Grasshopperのリリースノートはどこにありますか？**

A: 以下のリソースを参照します：
- 内容: Grasshopperの各バージョンの変更点
- 用途: コンポーネントの挙動変更、新機能の確認

## 使用上の注意

**Q: ドキュメントの信頼性について注意すべきことは？**

A: 以下に注意します：
- このドキュメントは、上記の公式ドキュメントを参照して作成されています
- 仕様の断定を行う場合は、必ず公式ドキュメントで確認してください
- バージョン差による挙動の違いがある場合は、該当バージョンのドキュメントを参照してください

**Q: バージョン確認で注意すべきことは？**

A: 以下に注意します：
- Rhino/Grasshopperのバージョンによって、機能や挙動が異なる場合があります
- 記載している内容は、特に断りがない限り、Rhino 7/8、Grasshopper標準コンポーネントを前提としています
- プラグインコンポーネントの場合は、該当プラグインのドキュメントを参照してください

**Q: リンクが切れている場合はどうしますか？**

A: 以下に注意します：
- 公式ドキュメントのURLは変更される可能性があります
- リンクが切れている場合は、McNeelの公式サイトから最新のURLを確認してください
