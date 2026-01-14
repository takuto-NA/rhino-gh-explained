---
order: 39
---

# 直線・円弧（LINE/ARC）で点列を再現する（セグメント化とDXF）

**Q: このページの目的は？**

A: このページは、`point-to-curve.md` の詳細版です（CAD/CAM・DXF向けに「直線/円弧」へ落とす話に集中します）。

## LINE（直線）とARC（円弧）で構成された幾何学セグメントで点列を再現する

**Q: CAD/CAMで扱いやすい形式が必要な場合は？**

A: 点列を直線セグメントと円弧セグメントに分割して近似します。

### 基本的なアプローチ

**Q: 点列を直接セグメントに分割する方法は？**

A: 以下の手順で進めます：

1. **点列をセグメントに分割する**
   - 点列を複数のグループに分割し、各グループが直線または円弧で近似できるようにする
   - 分割点は、曲率が大きい箇所や方向が変わる箇所を基準にする

2. **各セグメントに直線または円弧をフィットする**
   - **直線セグメント**: `Fit Line`コンポーネント（Curve → Utilカテゴリ）を使用。最小二乗法で直線をフィットする（Grasshopper標準機能）
   - **円弧セグメント**: `Fit Arc`コンポーネント（Curve → Utilカテゴリ）を使用。最小二乗法で円弧をフィットする（Grasshopper標準機能）
   - 許容誤差を設定して、フィットの精度を制御する

3. **セグメントを接続する**
   - 直線と円弧のセグメントを順番に接続して、連続した曲線（PolyCurve）を作成する
   - 接続点での連続性（位置・接線）を確認する

**Q: NURBS曲線を作成してから曲率分析で自動セグメント化する方法は？（推奨）**

A: 以下の手順で進めます：

1. **まずNURBS曲線を作成する**
   - 点列から`Interpolate`または`Fit Curve`でNURBS曲線を作成
   - 滑らかな曲線として一度表現する

2. **曲率を分析する**
   - `Curvature`コンポーネント（Curve → Analysisカテゴリ）で曲線上の各点の曲率を計算（Grasshopper標準機能）
   - 曲率の変化率（曲率の微分）を分析して、セグメント境界を自動検出
   - **曲率がほぼ0の領域** → 直線セグメント候補
   - **曲率がほぼ一定の領域** → 円弧セグメント候補
   - **曲率が急変する箇所** → セグメント境界

3. **セグメント境界で分割する**
   - 検出した境界点で曲線を分割（`Divide Curve`または`Split Curve`）
   - 各セグメントに対して`Fit Line`または`Fit Arc`を適用

4. **セグメントを再構築する**
   - フィットした直線・円弧を`Join Curves`で接続
   - 必要に応じて、接続点での連続性を調整

## 別解: RhinoCommonの `Curve.ToArcsAndLines` を使うと「一発で」LINE/ARC化できる

**Q: RhinoCommonの `Curve.ToArcsAndLines` を使うとどうなりますか？**

A: RhinoCommonには `Curve.ToArcsAndLines(...)` があり、これは **曲線を「直線＋円弧のPolyCurve」に変換**してくれます。

**Q: `ToArcsAndLines` を使うメリットは？**

A: スクリプト（Python/C#）を使えるなら、ページ冒頭の「曲率→境界検出→Fit」の流れを省略して、**まず `ToArcsAndLines` を試すのが最短**になることがあります。

**Q: それでもこのページで必須にしていない理由（使い分け）は？**

A: 以下の理由があります：
- **スクリプト前提（ただし"標準扱い"の範囲）**: `ToArcsAndLines` はRhinoCommon APIなので、Grasshopperでは通常 **Python/C#コンポーネント経由**になります。  
  - ※このドキュメントでは「Python/C#コンポーネント（外部ライブラリ不要）」は**標準コンポーネント扱い**とします。
- **"フィット"ではなく"近似分解"**: 出力は「許容誤差（tolerance）と角度許容差（angleTolerance）を満たすように分解した結果」です。  
  - DXFに落とす用途では大抵これで十分ですが、「セグメント境界を自分の規則で決めたい」「最小二乗で直線/円弧を当てたい」なら、既存の `Fit Line` / `Fit Arc` ワークフローの方がコントロールしやすいです。
- **パラメータ調整が結果を支配する**: `tolerance / angleTolerance / minLength / maxLength` の設定で、セグメント数・形状が大きく変わります。運用ルール（公差や最小長）を決めておかないと結果が不安定になりがちです。

**Q: `Curve.ToArcsAndLines` のAPI仕様は？**

A: RhinoCommonの `Curve.ToArcsAndLines` は以下の説明です：

- `Curve.ToArcsAndLines(...)`: 曲線を円弧セグメントからなるPolyCurveに変換し、**ほぼ直線の区間は直線セグメントにする**  
- パラメータ: `tolerance`, `angleTolerance`, `minimumLength`, `maximumLength`

### C#スクリプト例（Grasshopper Script / C#）: `ToArcsAndLines` をコピペで実行

入力の想定：

- **inputCurveObject**: Curve
- **linearToleranceObject**: 距離許容差（未指定ならドキュメントのAbsolute tolerance）
- **angleToleranceDegreesObject**: 角度許容差（度）。内部でラジアンに変換（未指定ならドキュメントのAngle tolerance）
- **minimumSegmentLengthObject**: 最小セグメント長
- **maximumSegmentLengthObject**: 最大セグメント長
- **outputPolyCurve**: 変換後の PolyCurve（Line/Arc セグメント）

```csharp
// Grasshopper Script Instance
#region Usings
using System;
using System.Linq;
using System.Collections;
using System.Collections.Generic;
using System.Drawing;

using Rhino;
using Rhino.Geometry;

using Grasshopper;
using Grasshopper.Kernel;
using Grasshopper.Kernel.Data;
using Grasshopper.Kernel.Types;
#endregion

public class Script_Instance : GH_ScriptInstance
{
    #region Notes
    /* Members:
        RhinoDoc RhinoDocument
        GH_Document GrasshopperDocument
        IGH_Component Component
        int Iteration

      Methods (Virtual & overridable):
        Print(string text)
        Print(string format, params object[] args)
        Reflect(object obj)
        Reflect(object obj, string method_name)
    */
    #endregion

    // 引数名を記述的な名称に変更しました（x, y 等の廃止）
    private void RunScript(
        object inputCurveObject, 
        object linearToleranceObject, 
        object angleToleranceDegreesObject, 
        object minimumSegmentLengthObject, 
        object maximumSegmentLengthObject, 
        ref object outputPolyCurve)
    {
        // 1. Curve の取得と検証
        Curve inputCurve = inputCurveObject as Curve;
        if (inputCurve == null)
        {
            Print("Error: inputCurve に有効なカーブが入力されていません。");
            return;
        }

        // 2. Linear Tolerance (距離許容差) の取得
        // 入力がない、または不正な場合はドキュメントの絶対許容値を使用
        double linearTolerance = RhinoDocument.ModelAbsoluteTolerance;
        if (linearToleranceObject != null)
        {
            if (!GH_Convert.ToDouble(linearToleranceObject, out linearTolerance, GH_Conversion.Both))
            {
                Print("Warning: linearTolerance が数値ではありません。ドキュメント設定値を使用します。");
            }
        }

        // 3. Angle Tolerance (角度許容差) の取得とラジアン変換
        // ユーザーは度数法(Degree)で入力することを想定し、内部でラジアンに変換します
        double angleToleranceDegrees = 0.0;
        double angleToleranceRadians = RhinoDocument.ModelAngleToleranceRadians;

        if (angleToleranceDegreesObject != null && GH_Convert.ToDouble(angleToleranceDegreesObject, out angleToleranceDegrees, GH_Conversion.Both))
        {
            // 度数法をラジアンに変換
            angleToleranceRadians = RhinoMath.ToRadians(angleToleranceDegrees);
        }
        else
        {
            // 入力がない場合はドキュメント設定値を使用（ログに出力）
            Print($"Note: angleToleranceDegrees が指定されていないため、ドキュメント設定値 ({RhinoMath.ToDegrees(angleToleranceRadians):F1}度) を使用します。");
        }

        // 4. Minimum Segment Length (最小セグメント長) の取得
        double minimumSegmentLength = 0.0;
        if (minimumSegmentLengthObject != null)
        {
            GH_Convert.ToDouble(minimumSegmentLengthObject, out minimumSegmentLength, GH_Conversion.Both);
        }

        // 5. Maximum Segment Length (最大セグメント長) の取得
        double maximumSegmentLength = 0.0;
        if (maximumSegmentLengthObject != null)
        {
            GH_Convert.ToDouble(maximumSegmentLengthObject, out maximumSegmentLength, GH_Conversion.Both);
        }

        // 6. メソッドの実行: ToArcsAndLines
        // 全てのパラメータを渡して変換を実行します
        PolyCurve resultPolyCurve = inputCurve.ToArcsAndLines(
            linearTolerance, 
            angleToleranceRadians, 
            minimumSegmentLength, 
            maximumSegmentLength
        );

        // 7. 結果の出力
        if (resultPolyCurve != null)
        {
            outputPolyCurve = resultPolyCurve;
            
            // 参考情報として変換結果の情報を出力（デバッグ用）
            Print($"Conversion Success: {resultPolyCurve.SegmentCount} segments generated.");
        }
        else
        {
            Print("Error: 変換に失敗しました。パラメータを調整してください。");
            outputPolyCurve = null;
        }
    }
}
```

**Q: 曲率分析による自動セグメント化の利点は？**

A: 以下の利点があります：
- 点列のノイズの影響を受けにくい（一度NURBSで滑らかにしてから分析）
- 曲率の変化を定量的に評価できる
- セグメント境界の判断が客観的になる

**Q: 実装のヒントは？**

A: 以下を参考にします：
- 曲率の閾値を設定して、直線（曲率 < 閾値）と円弧（曲率 > 閾値）を判別
- 曲率の変化率（曲率の微分）が大きい箇所をセグメント境界として検出
- GrasshopperのPythonコンポーネント（`Script`コンポーネント）で曲率分析と自動分割を実装することも可能。RhinoCommonのAPIを使用して、曲率計算とセグメント分割のロジックを記述する

**Q: Grasshopperで曲線の曲率を可視化する方法は？**

A: 以下の方法があります。

**方法1: Curvature Graphコンポーネント（標準機能）**

- `Curvature Graph`コンポーネント（Curve → Analysisカテゴリ）を使用（Grasshopper標準機能）
- 入力: Curve（分析対象の曲線）
- 出力: 曲率を可視化したジオメトリ（曲線上の各点から曲率半径に比例した長さの線分が表示される）
- 曲率が大きい箇所（半径が小さい）ほど、線分が長く表示される
- 曲率の方向も可視化される（曲線の法線方向に線分が伸びる）

**方法2: 手動で曲率を計算して可視化**

1. `Divide Curve`で曲線を分割し、評価点を取得
2. 各点で`Curvature`コンポーネントを使用して曲率を計算
   - 出力: 曲率ベクトル（大きさと方向）
3. `Vector Display`または`Line`コンポーネントで曲率ベクトルを可視化
   - 曲率の大きさに比例した長さの線分を描画

**方法3: 曲率のグラフ化（数値として可視化）**

1. `Divide Curve`で曲線を分割
2. 各点で`Curvature`を計算し、曲率の大きさ（スカラー値）を取得
3. `Graph Mapper`や`Line`コンポーネントで、パラメータ位置と曲率の関係をグラフ化
   - X軸: 曲線のパラメータ値（0〜1）
   - Y軸: 曲率の大きさ

**Q: 曲率変化の可視化方法は？**

A: 曲率の変化率（曲率の微分）を可視化するには：

1. `Divide Curve`で曲線を細かく分割
2. 各点で曲率を計算
3. 隣接する点間の曲率の差分を計算（`Subtract`コンポーネントなど）
4. 差分の大きさを`Vector Display`や`Graph Mapper`で可視化
   - 差分が大きい箇所 = 曲率が急変する箇所 = セグメント境界の候補

**Q: 実用的なワークフロー例は？**

A: 以下のワークフローがあります：

```
Curve → Divide Curve（細かく分割） → Curvature（各点で計算） → 
→ [曲率の可視化] Vector Display / Curvature Graph
→ [曲率変化の可視化] 隣接点間の差分計算 → Graph Mapper / Vector Display
```

**Q: Grasshopperでの実装例は？**

A: 以下の方法があります：

**方法1（直接分割）**:
```
点列 → セグメント分割（手動または自動） → 各セグメントに Fit Line / Fit Arc → Join Curves
```

**方法2（曲率分析による自動分割、推奨）**:
```
点列 → Interpolate/Fit Curve → Curvature分析 → セグメント境界検出 → Split Curve → 各セグメントに Fit Line / Fit Arc → Join Curves
```

**Q: どのような場面で使用しますか？**

A: 以下の場面で使用します：
- **CAD/CAMでの加工**: 直線・円弧の組み合わせが加工しやすい
- **図面化**: 直線・円弧で表現できる形状を明確にしたい
- **データ量の削減**: NURBS曲線より単純な表現で済む場合がある

### DXF出力時の選択肢と推奨事項

**Q: 点列をDXFフォーマットでCADに読み込めるようにする方法は？**

A: 以下の2つのアプローチがあります。

**Q: アプローチ1（細かい直線セグメントで近似する）の方法は？**

A: 以下の方法です：
- 点列を`Polyline`で接続する、または`Interpolate`で作成した曲線を`Divide Curve`で細かく分割して直線セグメント化する
- 各セグメントをDXFの`LINE`エンティティとして出力する

**Q: アプローチ1のメリットは？**

A: 以下のメリットがあります：
- **実装が確実**: 点列をそのまま直線で結ぶだけなので、アルゴリズムが単純で失敗しにくい
- **形状の忠実性**: 点列の形状を完全に再現できる（点列の密度が十分なら）

**Q: アプローチ1のデメリットは？**

A: 以下のデメリットがあります：
- **CADでの扱いが重い**: セグメント数が多いと、CADソフトウェアでの編集・選択・表示が重くなる
- **ファイルサイズが大きい**: セグメント数に比例してDXFファイルのサイズが増える
- **CADでの編集が困難**: 曲線として認識されず、個別の直線セグメントとして扱われるため、フィレットやオフセットなどの操作が難しい
- **図面としての品質**: 細かい直線の集合は、図面上で「ギザギザ」に見える場合がある

**Q: アプローチ1が推奨される場面は？**

A: 以下の場面で推奨されます：
- 点列が非常に不規則で、直線・円弧で近似できない形状の場合
- 形状の忠実性が最優先で、CADでの編集は不要な場合
- プロトタイプ段階で、とりあえずDXF出力が必要な場合

**Q: アプローチ2（直線（LINE）と円弧（ARC）のセグメントで近似する）の方法は？（推奨）**

A: 以下の方法です：
- 点列からNURBS曲線を作成し、曲率分析でセグメント境界を検出
- 各セグメントに対して`Fit Line`または`Fit Arc`を適用
- フィットした直線・円弧をDXFの`LINE`/`ARC`エンティティとして出力

**Q: アプローチ2のメリットは？**

A: 以下のメリットがあります：
- **CADでの扱いが軽い**: セグメント数が少なく、CADソフトウェアでの操作が快適
- **ファイルサイズが小さい**: 直線・円弧は開始点・終了点・半径などのパラメータで表現されるため、データ量が少ない
- **CADでの編集が容易**: 直線・円弧として認識されるため、フィレット、オフセット、寸法記入などの操作が可能
- **図面としての品質**: 滑らかな曲線として表示され、図面として見栄えが良い
- **CAMとの相性**: 多くのCAMソフトウェアが直線・円弧を標準として扱うため、加工データへの変換が容易

**Q: アプローチ2のデメリットは？**

A: 以下のデメリットがあります：
- **実装が複雑**: 曲率分析、セグメント分割、フィット処理など、複数のステップが必要
- **近似誤差が発生**: 元の点列を完全に通過しない場合がある（許容誤差内での近似）

**Q: アプローチ2が推奨される場面は？**

A: 以下の場面で推奨されます：
- CADでの編集・加工を想定している場合
- ファイルサイズを小さくしたい場合
- 図面としての品質を重視する場合
- **ほとんどの実務ケースで推奨**

**Q: DXF出力時の実装上の注意点は？**

A: 以下の点に注意します：

**許容誤差の設定**:
- **直線フィット**: `Fit Line`の許容誤差は、点列のノイズレベルと形状の複雑さを考慮して設定
  - 一般的な目安: 点列の平均間隔の10〜50%程度
  - ノイズが大きい場合: 許容誤差を大きくして、滑らかな直線を優先
- **円弧フィット**: `Fit Arc`の許容誤差は、直線フィットより少し大きめに設定することが多い
  - 理由: 円弧は直線より表現力が高いため、少し大きめの誤差でも形状を再現できる
  - 一般的な目安: 点列の平均間隔の20〜100%程度

**セグメント境界の検出**:
- **曲率閾値**: 曲率がほぼ0（例: 曲率半径 > 1000 × 点列の平均間隔）の領域を直線候補とする
- **曲率変化率**: 隣接点間の曲率の差分が大きい箇所（例: 曲率の変化率 > 閾値）をセグメント境界とする
- **最小セグメント長**: 極端に短いセグメントは避ける（例: 点列の平均間隔の2倍未満のセグメントは統合）

**連続性の確保**:
- **位置連続（G⁰）**: セグメント間の接続点で位置が一致することを確認（許容誤差: DXFの単位系に依存、通常は0.001〜0.01程度）
- **接線連続（G¹）**: 可能であれば、接続点での接線方向を一致させる（`Blend Curve`や`Fillet`を使用）
  - DXFでは接線連続は必須ではないが、図面品質を向上させる
- **接続点の重複**: DXF出力時に、接続点が重複しないように注意（同一座標の点が複数あると、CADで問題になる場合がある）

**Q: PythonでのDXF出力時の実装ヒントは？**

A: 以下の点に注意します：
- RhinoCommonの`Line`と`Arc`オブジェクトを、DXFの`LINE`/`ARC`エンティティに直接マッピングできる
- `Arc`の開始角度・終了角度を正しく計算する（DXFでは反時計回りが標準）
- 閉じた曲線の場合、最後のセグメントと最初のセグメントの接続を確認
- DXFの単位系（`$INSUNITS`）を設定して、CADでのスケールが正しく表示されるようにする

**Q: 実用的なワークフロー（DXF出力向け）は？**

A: 以下のワークフローがあります：

```
点列 → Interpolate/Fit Curve（滑らかな曲線化） → 
→ Divide Curve（細かく分割） → Curvature（曲率計算） → 
→ [曲率分析] セグメント境界検出 → Split Curve → 
→ [各セグメント] Fit Line / Fit Arc（許容誤差を設定） → 
→ Join Curves（接続確認） → Python（DXF出力）
```

### 注意点

**Q: 注意すべき点は？**

A: 以下に注意します：
- **セグメント分割の判断**: どこで直線と円弧を切り替えるかの判断が重要
- **許容誤差の設定**: 各セグメントのフィット誤差を許容範囲内に収める必要がある
- **連続性**: セグメント間の接続で、位置や接線の連続性を保つ必要がある場合がある
- **DXF出力時の単位系**: CADでのスケールが正しく表示されるように、DXFの単位系を設定する

