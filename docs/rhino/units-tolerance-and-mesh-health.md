---
order: 20
---

# 単位・公差・メッシュ健全性（製造に入る前のチェック）

この章は、後の工程（厚み付け/分割/穴あけ/ブーリアン/エクスポート）を安定させるための「最初の整地」です。  
有機外装は形状が複雑なぶん、**単位と公差**、そして**入力メッシュの健全性**が結果を左右します。

## 単位（Units）

Rhinoは **ドキュメント単位**で全てが解釈されます。

- モデルがmm想定なら、ドキュメントもmmにする
  - 途中で単位を変えるとスケール問題が出やすいので、最初に固定する

### Rhinoコマンド（単位/精度）

- `Units`（ドキュメント単位の確認/変更）
- `DocumentProperties` → Units / Tolerances（UIから確認する場合）

## 公差（Absolute tolerance）が重要な理由

製造向けの処理で頻出する失敗は、実は公差が原因であることが多いです。

- **Joinができない**（微小な隙間が残る）
- **Offset/Shellが破綻する**（薄肉・強曲率で顕在化）
- **Booleanが失敗する**（当たり面が荒い/交差が微妙）

方針としては、「必要以上に厳しくしない」＋「薄物・細部があるなら粗すぎない」が現実解です。

### Rhinoコマンド（公差が原因か切り分ける）

- `What`（オブジェクト種別の確認：MeshかBrepか）
- `Check`（Brepの健全性チェック）
- `SelBadObjects`（壊れている/問題のあるものを選択）
- `ShowEdges`（Naked edges などを可視化）

## メッシュ健全性（Mesh health）

今回の入力は「製造に向いていない既存メッシュ」なので、**問題の種類を切り分け**ます。

### よくある問題

- **穴（Open edges）**: どこかが開いていて閉じていない
- **法線の乱れ（Flipped/Inconsistent normals）**: 厚み付けやエクスポートで破綻
- **非多様体（Non-manifold）**: “面が枝分かれ”していて、ソリッドにならない
- **自交差（Self-intersection）**: 厚み付けでほぼ確実に失敗
- **薄すぎるディテール**: FDMで再現できない（耳/まぶた/鼻翼など）

### Rhinoコマンド（メッシュのチェック/修復）

- **チェック**
  - `CheckMesh`（メッシュの問題をレポート）
  - `ShowEdges`（Naked edges が穴の場所）
  - `Dir`（法線方向の確認）
- **修復（軽微な場合）**
  - `UnifyMeshNormals`（法線を揃える）
  - `RepairMesh`（自動修復を試す）
  - `FillMeshHoles`（穴埋め）

> スクショ位置案: `ShowEdges` の表示（Naked edges / Non-manifold edges）

### 先にやるチェック（手順の型）

1. **見た目だけでなく断面を見る**（顔は特に）
   - 断面で“裏返り”“極端な薄さ”“折れ”を見つける
2. **穴の位置を特定する**
   - どこが開いているかを把握し、後で首開口や分割面として“設計に取り込める”か判断
3. **法線が揃っているか確認する**
   - 揃っていない場合、厚み方向が破綻する

## Grasshopper（Python）: メッシュ健全性の簡易チェック例

GH Pythonで「自己交差/法線」を簡易的に検出する例です（詳細な修復はRhino側で行います）。

```python
import rhinoscriptsyntax as rs

# input:
#   x: mesh id (Guid)

if x and rs.IsMesh(x):
    if not rs.MeshHasConsistentNormals(x):
        print("WARN: mesh normals are inconsistent")
    if rs.IsMeshSelfIntersecting(x):
        print("WARN: mesh is self-intersecting")
else:
    print("input is not a mesh")
```

## チェックリスト（製造に入る前）

- [ ] `Units` で単位がmm想定になっている
- [ ] `CheckMesh` / `ShowEdges` / `SelBadObjects` で致命傷が無い（または原因が特定できた）
- [ ] 断面で“薄すぎ/折れ/裏返り”が無いことを把握した
- [ ] 修復に時間がかかりそうなら、次章の `QuadRemesh → SubD` に切り替える判断ができている

## テストピース（メッシュ由来の破綻を早期発見）

- **強曲率＋薄肉サンプル**: 目尻/鼻翼のような強曲率を含む小片で、厚み付けが破綻しないか見る
- **穴/非多様体の再現サンプル**: 修復前後で `CheckMesh` の結果が改善しているか比較する

## “直す”より“作り直す”が早い場面

顔のような有機形状は、メッシュ修復に時間を溶かしがちです。  
次章の **`QuadRemesh` → SubD** に切り替えた方が、後工程（分割/厚み/穴/コネクタ）が効率的になります。

## 次にやること

次章で、**メッシュ原型を編集可能な形（SubD）へ**持っていく標準手順をまとめます。

