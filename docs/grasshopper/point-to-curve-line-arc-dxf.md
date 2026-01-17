---
order: 39
---

# 直線・円弧（LINE/ARC）で点列を再現する（セグメント化とDXF）

Q: このページの目的は何ですか？

A: 本ページは `point-to-curve.md` の詳細解説として、点列をCAD/CAMやDXFエクスポートで扱いやすい「直線（Line）」と「円弧（Arc）」の組み合わせに変換（セグメント化）する手法と、その際の判断基準について解説します。

## 直線・円弧セグメント化の基本アプローチ

Q: 点列を直線と円弧の組み合わせに変換するには、どのようなワークフローが推奨されますか？

A: 主に以下の2つのアプローチがあります。用途や精度要件に応じて使い分けます。

| アプローチ | 向いているケース | 強み | 弱み |
| --- | --- | --- | --- |
| **1：点列を直接セグメント分割してフィット** | 点列がすでに「区間ごとに性質が明確」（直線区間/円弧区間が分かる） | 意図した区間割りを反映しやすい | 区間分割（境界決め）が難しい／ノイズで不安定になりやすい |
| **2：NURBS曲線を経由して自動分割（推奨）** | 一般ケース（点列→加工向けデータに落としたい） | 曲率分析で境界推定でき、手作業を減らせる | NURBS化の品質（点順・ノイズ）に依存する |

**アプローチ1：点列を直接セグメント分割してフィットする**
1. **分割点の決定**: 曲率が急変する場所や方向が変わる場所で点列をグループ分けします。
2. **要素のフィット**: 直線に近い区間には `Fit Line`、円弧に近い区間には `Fit Arc` コンポーネントを使用し、最小二乗法で幾何要素を当てはめます。
3. **セグメントの結合**: 各要素を順番に接続して PolyCurve を作成します。

**アプローチ2：滑らかなNURBS曲線を経由して自動分割する（推奨）**
1. **NURBS化**: 点列から `Interpolate` 等で一度滑らかな曲線を作ります。
2. **曲率分析**: 曲線上の曲率を分析し、「曲率がほぼ0の区間（＝直線）」と「曲率が一定の区間（＝円弧）」を自動で検出します。
3. **分割と近似**: 検出した境界で曲線を分割し、各区間に `Fit Line` / `Fit Arc` を適用して再構成します。

## RhinoCommonによる最短の実装方法

Q: スクリプト（C#やPython）を使用して、より効率的に直線・円弧化する方法はありますか？

A: RhinoCommon APIの `Curve.ToArcsAndLines` メソッドを使用するのが最も確実で高速です。

- **機能**: 入力曲線を、指定した距離許容差（Tolerance）と角度許容差（Angle Tolerance）を満たすように、直線と円弧のセグメントからなる PolyCurve に自動分解します。
- **利点**: 自分で曲率分析や分割ロジックを書く必要がなく、DXF出力用のデータ作成においてはデファクトスタンダードな手法です。

| パラメータ | 意味 | 実務メモ |
| --- | --- | --- |
| `tolerance` | 位置誤差（線形）許容 | 小さすぎるとセグメントが増えて重くなる |
| `angleTolerance` | 角度許容（ラジアン） | 角度条件を厳しくすると分割が増えやすい |
| `minimumLength` | 最小セグメント長 | 極短要素の混入を抑える（加工機のガタつき対策） |
| `maximumLength` | 最大セグメント長 | 長すぎる要素を抑えたい場合に使う（用途次第） |

```csharp
// C#スクリプトでの実行例（要点）
PolyCurve result = inputCurve.ToArcsAndLines(
    tolerance: linearTol, 
    angleTolerance: angleTolRadians, 
    minimumLength: minLen, 
    maximumLength: maxLen
);
```

### Grasshopper「C# Script」コンポーネント（完成版）

Q: GrasshopperのC# Scriptに、そのまま貼り付けて動く形は？

A: 以下は **GHのC# Scriptコンポーネント**で動作する実装例です（入力が未指定の場合はRhinoドキュメントの公差をデフォルトにします）。

- **入力（例）**:
  - `inputCurveObject`（Curve）: 変換対象の曲線
  - `linearToleranceObject`（Number, optional）: 線形公差（未指定なら `ModelAbsoluteTolerance`）
  - `angleToleranceDegreesObject`（Number, optional）: 角度公差（度）。内部でラジアン変換（未指定なら `ModelAngleToleranceRadians`）
  - `minimumSegmentLengthObject`（Number, optional）: 最小セグメント長
  - `maximumSegmentLengthObject`（Number, optional）: 最大セグメント長
- **出力**:
  - `outputPolyCurve`（PolyCurve）: 直線/円弧に分解されたPolyCurve

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

        if (angleToleranceDegreesObject != null &&
            GH_Convert.ToDouble(angleToleranceDegreesObject, out angleToleranceDegrees, GH_Conversion.Both))
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

Q: じゃあ `SimplifyCrv`（Rhinoコマンド）で解決なのでは？

A: **ケースによります。結論として、ここでやりたい「線/円弧への近似分解」の主役は `ToArcsAndLines` で、`SimplifyCrv` は“仕上げ”寄り**です。

- **`SimplifyCrv` が得意**:
  - すでに曲線が「線分・円弧セグメントの集合（PolyCurve等）」になっていて、そこに **不要な細分化（同一直線が分割されている／同一円弧が分割されている）**がある場合の整理。
  - 直線/円弧として扱える区間を **真のLine/Arcに置き換え**、連続する同一直線/同一円弧を結合する（詳細はRhinoヘルプ参照: [SimplifyCrv (Rhino 7)](https://docs.mcneel.com/rhino/7/help/en-us/commands/simplifycrv.htm)）。
- **`SimplifyCrv` だけでは足りないことが多い**:
  - 点列→`Interpolate`/`Fit Curve`で作った **一般のNURBS曲線を、指定公差で線/円弧に“近似分解”したい**場合。ここは `Curve.ToArcsAndLines`（またはFit Line/Arc手順）が担当領域です。

実務的には、`ToArcsAndLines` で「公差内で線/円弧化」→必要なら `SimplifyCrv` で「同一直線/同一円弧の結合・正規化」の順に考えると分かりやすいです。

## 曲率分析によるセグメント境界の特定

Q: 曲線が「どこで直線から円弧に切り替わるか」を判断するための可視化や分析手法は？

A: Grasshopperの分析コンポーネントを組み合わせて、セグメントの切り替わり（境界）を特定します。

| 手段 | コンポーネント例 | 何を見るか |
| --- | --- | --- |
| **曲率の可視化** | `Curvature Graph` | 曲率半径の変化を目視で把握する |
| **数値的な判定** | `Curvature` | 曲率（\(1/R\)）の差分・変化率が急増する箇所＝境界候補 |
| **グラフ化** | `Graph Mapper` | 曲率がプラトー（一定）の区間＝円弧候補として抽出する |

## DXF出力における形式の選択（Polyline vs Line/Arc）

Q: DXFエクスポートの際、細かい直線（Polyline）で出すのと、幾何要素（Line/Arc）で出すのはどちらが良いですか？

A: 基本的には **直線（Line）と円弧（Arc）の組み合わせ（アプローチ2）** を推奨します。

| 項目 | 細かい直線の集合（Polyline） | 直線と円弧の組み合わせ（推奨） |
| :--- | :--- | :--- |
| **CADでの操作** | 重い（セグメント数が多いため） | 軽い（要素数が最小限） |
| **編集性** | 困難（単なる点列の繋がり） | 容易（オフセットやフィレットが可能） |
| **ファイルサイズ** | 大きい | 非常に小さい |
| **加工精度** | 点密度に依存 | 滑らか（CAM側で円弧補間が効く） |

**例外的にPolylineが適すケース**:
- 形状が極めて不規則で、円弧近似が現実的でない場合。
- CAD上での編集を一切行わず、形状の忠実な再現のみが求められるプロトタイプ段階。

## 受け取り側ソフト別：DXFのSPLINE（NURBS）取り扱いの違い

Q: DXFの `SPLINE`（NURBS相当）って、受け取りCAD/CAMではどう扱われますか？

A: **“DXFとしては書ける”が、“受け取り側が素直に扱える”とは限りません**。受け取り側の実装や用途（設計CAD / CAM / ビューア）次第で、以下のように挙動が分かれます。

### まず押さえる前提（最重要）

- **DXFの曲線エンティティ**:
  - **NURBS相当**: `SPLINE`
  - **円弧/直線**: `ARC` / `LINE`
  - **円弧を含む2Dポリライン**: `LWPOLYLINE`（bulge）など（ソフトによってはこれを好む）
- **互換性の基本戦略**:
  - **相手がCAM/加工系・簡易ソフト**なら、`SPLINE`は避けて **`LINE/ARC`（または円弧付きPolyline）**に寄せるのが安全。
  - **相手がDWG/DXFネイティブCAD**なら、`SPLINE`も扱えることが多い（ただし運用ルール次第）。

### “公式に確認できる”例（確度高め）

| ソフト/カテゴリ | `SPLINE`の扱い（概要） | こちらの推奨 |
| --- | --- | --- |
| **AutoCAD系（DXFネイティブ）** | 開発元であり `SPLINE` を扱える前提になりやすい | `SPLINE`運用でも成立しやすいが、相手の運用（CAM連携等）に合わせる |
| **SOLIDWORKS（3D CAD）** | DXF/DWGインポート時に、スプライン等で警告・エラーが出るケースがある（座標が有効範囲を超える等） | まずは **原点付近・適正スケール**に整えてから出す。加工用途なら `LINE/ARC` 化も検討（参考: [SOLIDWORKS DXF/DWG Import Errors and Warnings](https://help.solidworks.com/2025/japanese/SWConnected/slddxf/c_DXF_DWG_File_Import_Errors_and_Warnings.htm)） |
| **Archicad（BIM）** | インポート時に **スプライン→ポリライン変換**オプションがある | 変換される前提で、必要なら出力側で公差管理してPolyline/Arcに寄せる（参考: [Graphisoft: DXF/DWGインポート変換設定](https://community.graphisoft.com/t5/OPEN-BIM/DXF-DWG%E3%82%A4%E3%83%B3%E3%83%9D%E3%83%BC%E3%83%88%E5%A4%89%E6%8F%9B%E8%A8%AD%E5%AE%9A/ta-p/651805)） |
| **PTC系（変換設定が強い系）** | 変換は設定ファイル等で挙動を制御する前提がある（例: 楕円→Bスプライン/弧の切替など） | 相手がPTC系なら **変換設定の有無**を先に確認（参考: [PTC Creo Elements/Direct DXF](https://support.ptc.com/help/creo/ced_drafting/r20.7.0.0/ja/ced_drafting/baggage/dxf.pdf)） |
| **Corel系（グラフィック寄り）** | 複雑なDXFのインポートで問題が出るケースがある | 受け渡し用途なら **要素を単純化**（Line/Arc/適正Polyline）しておく（参考: [CorelDRAW: AutoCAD DXF/DWG](https://product.corel.com/help/CorelDRAW/540223850/Main/JP/Documentation/CorelDRAW-AutoCAD-Drawing-Database-DWG-and-AutoCAD-Drawing-Interchange-Format.html)） |

### “現場で起きがち”な傾向（要検証・相手依存）

> ここはソフトのバージョン/設定で変わるため、**最終的には相手環境でのテストが確実**です。

- **無料2D CAD / 簡易ビューア**:
  - `SPLINE`を **表示はできるが編集が弱い**、または **読み込み時にPolyline化**されることがある
- **レーザー/CAM/加工機付属ソフト**:
  - `SPLINE`を嫌って **直線だらけに分割**（重い/荒い）になりやすい
  - 円弧として認識されず **G2/G3が効かない**（結果がギザギザに見える/加工時間増）

### 受け取り側差分を最短で潰す「テスト用DXF」手順

1. **同一図面に** `LINE` / `ARC` / `SPLINE`（NURBS）を1本ずつ置く（原点付近・mm単位など明示）
2. **DXFバージョンを変えて**2〜3種類を書き出す（例: R12 / 2000 / 2010）
3. 受け取り側で開いて、以下を確認:
   - 曲線が **`SPLINE`のまま**か、**Polyline化**されたか、**Arc/Line化**されたか
   - 要素数（セグメント数）が異常に増えていないか
   - オフセット/フィレット/加工設定で破綻しないか

## 「相手→こちら→相手」の往復DXFで起きがちな落とし穴（超重要）

Q: 例えばSolidWorks等からDXFを受け取り、こちらで整形してDXFで返し、相手がまた活用する…みたいな運用で注意点は？

A: **最大の落とし穴は、往復で“近似（分割）が二重に掛かる”こと**です。  
一度Spline/曲線をPolyline化（または細かい分割）したものを、さらに別ソフトで再近似すると、**要素数が増える・円弧が消える・寸法/公差がズレる**などが起きやすくなります。

### 最低限のルール（これだけで事故が減る）

- **近似は「片側だけ」が原則**:
  - どちらか一方でだけ `SPLINE`→`LINE/ARC`（またはPolyline）を行い、もう片側では“再近似しない”運用にする。
- **やり取りの“基準形”を決める**:
  - **加工/NCが目的**なら、基準形は **`LINE/ARC`（または円弧付きPolyline）**。
  - **設計編集が目的**なら、基準形は **`SPLINE`（または相手のネイティブ形式）**。DXFに拘らず、可能ならDWG/ネイティブも併送する。
- **原点・単位・スケールは固定**:
  - 取り込み/書き出しのたびに単位が変わると、他の不具合に見えて原因究明が難しくなる（“いつも原点付近・mm”等をチーム内ルール化）。

### こちら（Rhino/Grasshopper）側での「整形」テンプレ

- **Splineを残す場合**:
  - 形状は保持しやすいが、相手の環境によっては結局Polyline化される（=相手側で近似が走る）ので、**相手の用途（CAMか設計か）を先に確認**する。
- **加工互換を優先する場合（推奨）**:
  - `Curve.ToArcsAndLines` で **公差内の `LINE/ARC`** に落とす
  - 必要なら `SimplifyCrv` で **同一直線/同一円弧の結合（正規化）**
  - “戻し”は、相手に **「このDXFは加工互換用（Splineなし）」**と明記して渡す

### 相手（例: SolidWorks等）に最初に確認する質問リスト

- **DXFバージョン指定**（例: R12 / 2000 / 2010 のどれが安全か）
- **`SPLINE`を許容するか**（許容しないなら、どの形が良いか: `ARC/LINE` or Polyline）
- **円弧は円弧として欲しいか**（Polylineより `ARC` を優先したいか）
- **許容誤差（公差）**（線形公差・角度公差の目安）

### 実務メモ：往復DXFで“信頼できる”考え方

- DXFは「図面交換」には強いが、「設計の完全往復（ロスレス）」は苦手になりやすい。
- 可能なら **“基準のネイティブ”を別途保持**し、DXFは“受け渡し用”として割り切る（往復での劣化を防ぐ）。

## 実装時の注意点とチェックリスト

Q: セグメント化を実行する際に、最終的なデータの品質を保つために確認すべきことは？

A: 以下の項目を確認し、製造工程（CAM等）でのトラブルを未然に防ぎます。

| チェック | なぜ必要か | 目安/注意 |
| --- | --- | --- |
| **位置連続性（G0）** | 接続点の隙間はCAMで欠損や停止の原因になる | DXF単位系で 0.001〜0.01 程度の精度が必要になることが多い |
| **最小セグメント長** | 極短要素は加工機のガタつき・過密指令の原因になる | 0.1mm以下などが混入していないか |
| **円弧の向き** | DXFの円弧定義と角度系の不一致で向きが逆転し得る | DXFでは反時計回りが標準。スクリプト側の角度定義に注意 |
| **許容誤差のバランス** | 公差を詰めすぎると要素数が増えて重くなる／緩すぎると形状が崩れる | “要素数”と“逸脱量”の両方を見て調整する |
