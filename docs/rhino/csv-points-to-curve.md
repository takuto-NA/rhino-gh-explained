---
order: 45
---

# CSVで点データを読み込み、Curve/地形/場に使う（Rhino運用ノウハウ）

Q: このページは何を解決しますか？

A: CSVの点データをRhinoに取り込み、目的（Curve/地形（サーフェス・メッシュ）/ポテンシャル場的な可視化）に応じて破綻なく扱うために、**失敗しやすい罠（区切り文字/小数点/順序/単位/点群化）**と判断軸をまとめます。

## まず決める：点データは「点列」か「点群」か

Q: 何がそんなに重要？

A: CSVの点は、大きく2種類に分かれます。ここを間違えると、以降の手法選定がズレます。

- **点列（ordered points）**: 点に「順番」がある（軌跡、輪郭、断面、1本のパスなど）
  - 典型ゴール: **Curve / Polyline**
- **点群（unordered samples）**: 点に「順番」がない（スキャン、標高サンプル、分布サンプルなど）
  - 典型ゴール: **Surface / Mesh / 等高線 / ヒートマップ**

> “点群”として扱うかは、Rhinoの `PointCloud`（点群オブジェクト）にするかどうか（インポート時のオプション）とも関係します。  
> 参考: [Rhino Help: PointCloud](https://docs.mcneel.com/rhino/9/help/en-us/commands/pointcloud.htm)

## 最短の結論（まず迷わないための選択）

Q: CSV点列をCurveにする“最短ルート”は？

A: まずは以下で決め打ちすると事故が減ります。

- **Rhinoで点オブジェクトとして入っている** → `CurveThroughPt`（点を通る曲線）
- **点をクリックしながら作る** → `InterpCrv`（補間曲線）
- **ノイズがあり、全点を通すと波打つ** → 一度Curve化してから `FitCrv` / `Rebuild` を検討（誤差許容で整える）
- **角を残したい** → `Polyline`（折れ線）を第一候補にする

> 参考（公式）: 点ファイル（.asc/.csv/.txt/.xyz など）のインポート仕様は、Rhinoヘルプの「Points File（点ファイル）」を参照してください。  
> - [Rhino Help: Points File（点ファイルのインポート）](https://docs.mcneel.com/rhino/8/help/en-us/fileio/points_file_asc_csv_txt_xyz_cgo_import.htm)
> - [Rhino Help: CurveThroughPt](https://docs.mcneel.com/rhino/8mac/help/en-us/commands/curvethroughpt.htm)

## 目的別：何を作りたいか（Curve/地形/場）

| 作りたいもの | 入力の前提 | Rhino単体でまずやること | 補足 |
| --- | --- | --- | --- |
| **Curve（滑らかな1本）** | 点列（順序あり） | 点→`CurveThroughPt` / `InterpCrv` | 点順がすべて |
| **Polyline（折れ線）** | 点列（順序あり） | 点→`Polyline` | 角を保持したいなら最初からこれ |
| **地形っぽい“山”** | 点群（順序なし）＋Z（標高）がある | まず点の分布・スケールを検査 → メッシュ/サーフェス化を検討 | データが格子か不規則かで手法が変わる |
| **ポテンシャル場（スカラー場）** | 点＋値（value列）がある | Rhino単体だと“場の補間”がボトルネックになりやすいので、まずはGH/スクリプト前提で設計 | 「値→高さ」「値→色」「等値線」などが典型 |

## 事前準備（CSV側でやるべき最低限）

Q: CSVはどんな形にしておくべき？

A: Rhinoの取り込みで事故りにくい「最低限の形」はこれです。

- **1行=1点**
- **列は座標のみ（基本はX,Y,Z / 2DならX,YでもOK）**
- **ヘッダー行/コメント行は入れない**のが安全（入れるなら読み込み前に削除、またはスクリプトでスキップする）
- **小数点は `.`（ピリオド）に統一**（`,` を小数点にすると区切りと衝突しやすい）
- **空欄を作らない**（2DでZが無いなら、後工程で `z=0` として扱う）

例（推奨: ヘッダー無し）:

```csv
0.0,0.0,0.0
10.0,0.0,0.0
10.0,5.0,0.0
```

例（よくある: ヘッダーあり＋2D）:

```csv
x,y
76.3943978071436,10.40683560508785
85.22251989933172,12.128431710139445
87.59631988706084,20.779897837217153
```

この形式は **ヘッダー（`x,y`）を消す**のが最も確実です（または後述のPythonで自動スキップします）。

## Rhinoでの基本フロー（Import → 点 → Curve）

Q: Rhinoだけでやる標準手順は？

A: 次の順で行うと、原因切り分けがしやすいです。

1. **ドキュメント単位を確認**: `Units`（CSVがmmなのかmなのかを先に確定）
2. **点ファイルとして取り込み**: `File > Import` からCSV（点ファイル）を読み込み  
   - 区切り文字（カンマ/タブ/セミコロン等）が合っているかを必ず確認
   - 可能なら「点（Point）」として取り込む（点群(PointCloud)化すると後工程が面倒になりやすい）
3. **ざっと異常検知**: `BoundingBox` や `Distance` でスケールと位置が妥当か確認
4. **Curve化**: 点を順番に選んで `CurveThroughPt`

## よくある事例（どう作るのが実務的か）

### 事例1: 測定点列（ノイズあり）を“それっぽい曲線”にしたい

- **症状**: 全点通過（補間）だと細かく波打つ
- **対策**:
  - まず `CurveThroughPt` / `InterpCrv` でCurve化して形状を確認
  - その後 `FitCrv` で許容誤差を与えて滑らかにする、または `Rebuild` で制御点数を減らす

### 事例2: 加工/交換のために“折れ線”として保持したい

- **対策**: `Polyline` を第一候補にする（後工程で角が必要なケースは、最初から曲線にしない）

### 事例3: CSVに複数の線が混ざっている（ID列で分かれている等）

- **対策**: Rhino単体の取り込みだけで完結させようとせず、**Grasshopperかスクリプトで「グループ→各グループをCurve化」**に寄せる（順序・分岐の管理が必要になるため）

### 事例4: “山”や地形を作りたい（点群→面）

- **前提確認**:
  - CSVが **x,y,z** を持っているか（zが無いと「山」にはならない）
  - 点が **格子状（グリッド）**なのか、**不規則サンプル**なのか
- **考え方**:
  - 格子なら「グリッド→面」へ落としやすい
  - 不規則なら「点群→近似面（メッシュ/サーフェス）」になり、ノイズ除去・間引き・外れ値除去が重要
- **よくある落とし穴**:
  - 点が巨大座標（例：測地系/ローカル原点から遠い）だと、精度問題や表示問題が出やすい → まずは原点近くへ移して検証

### 事例5: ポテンシャル場みたいなものを作りたい（点＋値→可視化）

- **データ設計**: 点（x,y[,z]）に対して **value列（強度/温度/密度など）**があるかで難易度が変わります。
- **基本の作り方（考え方）**:
  - 何らかの補間（例：距離減衰の重ね合わせ）で、空間上の値 \(f(x,y)\) を作る
  - それを **(1) 高さ(Z)に変換して“山”にする**、または **(2) 色に変換して“ヒートマップ”にする**
  - さらに **(3) 等値線**（Contour的な線）として抽出する
- **実務的な推奨**: この手の「場の補間→可視化」は、Rhino単体より **Grasshopper（またはPython）** の方が再現性と拡張性が高いです。

## 失敗パターン集（原因 → 対策）

| 症状 | 典型原因 | 対策 |
| --- | --- | --- |
| **点が読めない/一部しか出ない** | ヘッダー/空行/列数不一致 | ヘッダー削除、空行除去、Z=0で列数統一 |
| **全部が同じ位置に固まる** | 区切り文字の誤認（タブなのにカンマ等） | Import時に区切り文字を明示、CSVをテキストで確認 |
| **スケールが1000倍/0.001倍** | CSVの単位とRhinoのドキュメント単位が不一致 | `Units`を合わせる、必要なら読み込み後に `Scale` |
| **Curveが変なところに飛ぶ/自己交差** | 点の順序が曲線順になっていない | CSVの行順を整える（ソート/並べ替え）、GHで順序制御 |
| **滑らかにしたら波打つ** | ノイズ点列を全点通過で補間した | `FitCrv`/`Rebuild`、点の間引き（サンプリング） |
| **動作が重い/固まる** | 点数が多すぎる（表示/曲線生成が過負荷） | まず点を間引く、必要部分だけを扱う、段階的に確認 |

## 自動化（Rhino Pythonで“読み込み→点→Curve”）

Q: CSVが毎回同じ形式で、作業を固定化したい。どうする？

A: RhinoのPythonで「ヘッダー無視」「区切り指定」「点作成」「Curve作成」まで自動化できます。

```python
import csv
import rhinoscriptsyntax as rs

# 設定
path = rs.OpenFileName("Select CSV (x,y[,z])", "CSV Files (*.csv)|*.csv||")
if not path:
    raise SystemExit

delimiter = ","  # "\t" などに変更
skip_header = True  # 先頭が x,y / X,Y,Z などのケースが多いなら True

pts = []
with open(path, newline="", encoding="utf-8-sig") as f:
    reader = csv.reader(f, delimiter=delimiter)
    for i, row in enumerate(reader):
        if i == 0 and skip_header:
            continue
        if not row or len(row) < 2:
            continue
        try:
            x = float(row[0])
            y = float(row[1])
        except Exception:
            # ヘッダー行/ゴミ行（x,y 等）を安全側でスキップ
            continue
        z = 0.0
        if len(row) >= 3 and row[2] != "":
            try:
                z = float(row[2])
            except Exception:
                z = 0.0
        pts.append((x, y, z))

if len(pts) < 2:
    raise ValueError("Not enough points")

# 点（任意: 画面に点を作らず曲線だけ作るなら、このループは省略可）
for p in pts:
    rs.AddPoint(p)

# 補間曲線（全点を通る）
rs.AddInterpCurve(pts, degree=3)
```

> 注: `delimiter`/`skip_header` はデータに合わせて調整してください（Excel由来はBOM付きUTF-8になることがあるため `utf-8-sig` を使っています）。

## 自動化（列名があるCSV向け：DictReaderで汎用化）

Q: ヘッダーあり・列順不定（x,y,z,value など）にも耐えたい。

A: `csv.DictReader` で **列名から取り出す**と、CSVの“揺れ”に強くなります（列順変更・余計な列の追加に耐える）。

```python
import csv
import rhinoscriptsyntax as rs

path = rs.OpenFileName("Select CSV with headers", "CSV Files (*.csv)|*.csv||")
if not path:
    raise SystemExit

field_x = "x"
field_y = "y"
field_z = "z"       # 無ければ0にする
field_value = "v"   # 例: value列があるなら使う（色/高さ等に展開）

pts = []
vals = []
with open(path, newline="", encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)
    for row in reader:
        if not row:
            continue
        try:
            x = float(row.get(field_x, ""))
            y = float(row.get(field_y, ""))
        except Exception:
            continue
        z = 0.0
        try:
            if row.get(field_z, "") != "":
                z = float(row[field_z])
        except Exception:
            z = 0.0
        pts.append((x, y, z))
        try:
            if row.get(field_value, "") != "":
                vals.append(float(row[field_value]))
        except Exception:
            pass

if len(pts) >= 2:
    rs.AddInterpCurve(pts, degree=3)
```

> 注: `field_x` 等はCSVの列名に合わせて変更してください（`X`,`Y`,`Z`,`value` など）。

