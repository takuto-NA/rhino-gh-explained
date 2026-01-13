---
order: 40
---

# 可変厚み（1mmベース＋局所補強）を破綻させない手順

アニマトロニクス外装は「基本1mm」でも、首周り・コネクタ周り・分割フランジなどで**局所的に厚く**する必要があります。  
ここでのポイントは、**最初から可変厚みにしない**ことです。

## 結論：安全な順序

1. **均一厚みで“閉じた殻”を作る**（まず1mm相当）
2. **前後分割/首開口/穴あけの設計を入れる**（位置を確定できる基準を持つ）
3. **局所補強を“足す”**（ボス/フランジ/リブ/当たり面）
4. 最後に **出力検証**（スライサーで壁数・薄肉・サポートを確認）

## “均一厚み”の作り方（形状の種類で分岐）

どの表現（Mesh/SubD/Brep）で進めるかで手段が変わります。

- **Brep（NURBSソリッド）**: `Shell` が最短
- **開いた面（サーフェス）**: `OffsetSrf`（必要なら Solid=Yes）
- **SubD/メッシュ**: まずは“殻を作れる表現”に寄せる
  - どのみち最終出力はSTL/3MFなので、「壊れない殻」（穴/非多様体/自交差が無い）になっているかが最重要

## 可変厚みを“足す”方法（FDM向け）

局所補強は、外装そのものを膨らませるより **別パーツとして追加**する方が安定します。

- **フランジ（合わせ面）**: 前後分割の合わせ面を作る（面で組む）
- **リブ**: 広い薄板がたわむ/割れる箇所に入れる
- **ボス**: ねじ止め、機構固定、嵌合の基礎になる
- **当たり面**: 機構CADと接触する箇所に平面/円筒などの“基準面”を作る

## Rhinoコマンド：オフセット/シェルを“失敗させない”具体手順

### ケースA: 開いた面（サーフェス）を1mm厚にしたい → `OffsetSrf`

1. 厚みにしたいサーフェスを選択
2. `OffsetSrf` を実行
3. **Distance=1**（mm想定）
4. **Solid=Yes**（端が閉じられるならこれが最短）
5. “外側に膨らむ/内側に入り込む”を意図に合わせて調整（必要なら距離を **-1** にする）

> スクショ位置案: `OffsetSrf` のオプション（Distance / Solid / BothSides）

**失敗しやすい症状**と対処:

- 自己交差で失敗: 形状を分割して局所ごとに処理（強曲率部を先に分ける）
- 端が閉じない: `Solid=No` でオフセットだけ作り、端部を `Loft`/`EdgeSrf`/`BlendSrf` で繋いでから `Join`

### ケースB: 閉じたBrep（ポリサーフェス）を薄肉化したい → `Shell`

1. 対象のソリッドを選択
2. `Shell` を実行
3. **Thickness=1**（mm想定）
4. 必要に応じて「開ける面」を選ぶ（首開口にしたい面など）

> スクショ位置案: `Shell` の面選択（どの面を開けるか）

### ケースC: メッシュを厚くしたい（最終STL前提） → `OffsetMesh`

メッシュのまま加工する場合は `OffsetMesh` を使います。

- まず `CheckMesh` で穴/非多様体/自交差を確認してから実行する
- 1mmが破綻する場合は、先に分割してから部分ごとにオフセットする

### SubDの扱い（実務の落とし所）

SubDは造形に強い一方、“製造用の殻/当たり面”を作る段階では、次のどちらかが安定です。

- `ToNURBS` して Brep に寄せ、`Shell` / `OffsetSrf` で厚みを作る
- `ToMesh` してメッシュに寄せ、`OffsetMesh` で厚みを作る

## RhinoCommon（C#）: Brepを1mmオフセットしてソリッド化

Rhino上での `OffsetSrf` / `Shell` と同じ発想を、RhinoCommonで行う例です。厚み方向を反転したい場合は距離を負にします（-1 など）。

```csharp
using Rhino;
using Rhino.Geometry;
using System;

public static class ThicknessExample
{
  public static Brep MakeOffsetShell(Brep inputBrep, double distance)
  {
    if (inputBrep == null) throw new ArgumentNullException(nameof(inputBrep));

    double tol = RhinoDoc.ActiveDoc?.ModelAbsoluteTolerance ?? 0.01;

    // solid=true で側面（wall）を作り、閉じた殻を狙う
    Brep[] blendBreps;
    Brep[] wallBreps;
    var breps = Brep.CreateOffsetBrep(
      inputBrep,
      distance,
      solid: true,
      extend: false,
      tolerance: tol,
      out blendBreps,
      out wallBreps
    );

    if (breps == null || breps.Length == 0) return null;

    // 返ってくるのが複数の場合もあるので、必要に応じて Join する
    Brep joined = Brep.JoinBreps(breps, tol)?.Length > 0 ? Brep.JoinBreps(breps, tol)[0] : breps[0];
    return joined;
  }
}
```

## Grasshopper（Python）: RhinoCommonで1mmオフセット（GH Pythonコンポーネント）

GHのPythonコンポーネントで、入力Brepを1mm厚にします。

```python
import Rhino
import scriptcontext as sc

# inputs:
#   x: Brep
#   d: distance (float) 例: 1.0

tol = sc.doc.ModelAbsoluteTolerance

blend = None
walls = None
breps = Rhino.Geometry.Brep.CreateOffsetBrep(x, d, True, False, tol)

# outputs:
#   a: Brep (or list of Breps)
a = breps
```

> メモ: 厚み方向を内側にしたいなら `d = -1.0` のように符号で制御します。

## 失敗の典型と対策

- **強曲率部で自己交差**
  - 対策: その領域を先に分割し、局所ごとに処理する
- **薄肉のまま大開口を作って割れる**（首周り）
  - 対策: 開口縁にフランジ/リブを前提で設計する
- **可変厚みを先に入れて、後段の穴あけ/分割で破綻**
  - 対策: 先に均一殻→設計（分割/穴）→最後に補強

## チェックリスト（厚み付けの前後）

- [ ] 単位と公差を確認した（薄肉は公差の影響を受けやすい）
- [ ] 断面で“極端な曲率/折れ”を把握した（自己交差の予兆）
- [ ] まず均一厚みで閉じた殻ができた
- [ ] 分割/首開口/穴あけを入れてから局所補強を足した

## テストピース（厚みの“再現性”確認）

- **壁数確認プレート**: 0.8/1.0/1.2mm の薄板を1枚に並べて出力し、壁数と剛性を確認
- **強曲率サンプル**: 小さなR（曲率の強い部分）を含む形状で、1mmが破綻しないか確認
- **開口縁補強サンプル**: 首開口の縁（リング）＋リブ有無の比較

## 次にやること

次章では、**前後2分割**、**首の大開口**、**目などの後加工穴**を「後で位置を変えられる基準の持ち方」込みで整理します。

