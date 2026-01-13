---
order: 14
---

# Blenderのメッシュ（.blend）→ Rhinoへ（初心者向け：安全に受け渡す）

Blenderの`.blend`はRhinoで直接開けません。  
いったん **メッシュを書き出して（OBJなど）**、Rhinoで取り込みます。

このページは「Blenderは分からない」前提で、**最小手順**と **詰まりどころ（単位/法線/回転/密度）**だけを整理します。

## 結論：まずはOBJで渡す（最短で壊れにくい）

- **推奨**: OBJ（参照メッシュ用途に十分・Rhinoで扱いやすい）
- **次善**: FBX（複数オブジェクトや階層を保ちたい時）
- **非推奨（再構築用途）**: STL（単位やメタ情報が弱く、トラブルの原因になりやすい）

## 手順0：単位を揃える（mm推奨）

「メッシュが小さすぎ/大きすぎる」問題のほとんどは単位です。

### Blender（mm想定に寄せる）

Blenderの画面で次を探して設定します（UI名は多少変わっても“目的”は同じです）。

- **Scene / Units**
  - Unit System: **Metric**
  - Length: **Millimeters**
  - Unit Scale: **0.001**（= 1 Blender unit を 1m ではなく 1mm相当で扱う）

> ここが曖昧な場合でも、次の「Rhino側で実寸チェック」を必ずやればリカバリできます。

### Rhino（取り込み前にmmへ）

- `Units` でドキュメント単位を **mm** にする（途中で変えるより最初に固定が安全）

> 関連: `units-tolerance-and-mesh-health.md`

## 手順1：Blender側で“変換ミス”を潰す（これだけ）

Blenderをほぼ触れない場合でも、次の2点だけは押さえると事故が減ります。

### 1) トランスフォームを適用（スケールが1になる状態）

- 対象メッシュを選択
- **Apply（適用）**: Rotation / Scale（またはAll Transforms）

狙いは「書き出し後にRhinoで回転やスケールが暴れない」状態にすることです。

### 2) 必要なら“軽量化”（参照メッシュは軽いほど良い）

GHで参照に使うなら、**見た目がほぼ同じでポリゴン数が少ない方が強い**です。

- 目安: まずは「動く」密度まで落とす（細部は後段の曲線/面で作り直す前提）

## 手順2：OBJで書き出す（推奨）

Blenderで `File > Export > Wavefront (.obj)` を探して書き出します。

設定は“迷ったらこれ”でOKです。

- **Selection Only**: ON（必要なものだけ出す）
- **Apply Modifiers**: ON（モディファイアが見た目通りに出る）
- **Include Normals**: ON（陰影が破綻しにくい）
- **Scale**: 1.0（単位を揃えている前提）

## 手順3：Rhinoで取り込み → 実寸と健全性をチェック

### 1) 取り込み

- `Import` でOBJを読み込む

### 2) サイズが合っているか（必須）

Rhinoで次をやって、想定寸法になっているか確認します。

- `BoundingBox`（大きさの確認）
- `Distance`（代表寸法を測る）

合っていなければ、まず単位問題を疑って「Blender側のUnits」か「書き出しスケール」を見直します。

### 3) メッシュが壊れていないか（必須）

- `CheckMesh`（問題のレポート）
- `ShowEdges`（穴＝Naked edges の場所が分かる）
- `UnifyMeshNormals`（法線がバラバラなら揃える）

軽微なら:

- `RepairMesh` / `FillMeshHoles`

> 関連: `units-tolerance-and-mesh-health.md`

## 手順4：Rhino側で“参照メッシュ”として固定する（GHの安定化）

Grasshopperで参照するなら、Rhino側で次を徹底すると壊れにくいです。

- レイヤを分ける（例: `00_ref_blender_mesh`）
- 原型は `Lock` して触らない（比較/参照専用にする）

> 参照元のトポロジが変わるとGHが壊れやすい、という注意とセットです（`../grasshopper/history-and-editing.md`）。

## 次の分岐：作り直すか / 参照から再構築するか

### A) メッシュが汚い/重い → 作り直す（QuadRemesh→SubD）

- メッシュ修復で時間を溶かすなら、`QuadRemesh` → SubD編集へ切り替える方が速いです

> 関連: `mesh-to-subd-workflow.md`

### B) 参照としては十分 → GHで「曲線/断面」へ落としてBrep再構築

目的が「パラメトリックに組み直して最終Brep」なら、このルートが本命です。

> 関連: `../grasshopper/mesh-reference-to-brep-rebuild.md`

## 形式の選び方（早見表）

- **OBJ**: 参照メッシュに最適。迷ったらこれ。
- **FBX**: 複数オブジェクト/階層を保ちたい場合に便利（ただし設定が増える）。
- **STL**: 3Dプリント最終出力向け。受け渡しの“中間”としては事故が増えやすい。
- **PLY**: スキャン由来などで“頂点カラー”が重要なら候補（用途が限定的）。

