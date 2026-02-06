---
order: 30
---

# 実例: メッシュ原型→編集可能な外装（最小GH構成）

ここでは「品質の低いメッシュを参照しながら、後から編集・修正できる外装」を構築するための **最小限のコンポーネント構成の考え方** を示します。コンポーネント名はGrasshopper標準を前提としています。

## 設計のゴール

Q: 既存のメッシュ（原型）を参照しながら、編集可能な外装を作成するワークフローにおける最終的なゴールは何ですか？

A: 単に形をトレースするだけでなく、以下の「変更に強い運用」を可能にすることを目指します。

- **即時更新**: ランドマーク点（目や鼻の位置）や、断面曲線を少し動かすだけで、外装全体の形状が自動的に更新される。
- **製造パラメータの調整**: スライサーでのテスト結果に合わせて、厚みやクリアランスの数値をスライダー一つで微調整できる。
- **詳細設計の独立**: 「分割位置の変更」や「目の穴のサイズ調整」が、本体の造形工程に悪影響を与えずに実行できる。

## 入力（Inputs）の整理

Q: パラメトリックな外装設計を支えるために、Grasshopperの定義の起点として用意すべき「最小限の入力要素」は何ですか？

A: 以下の4つのカテゴリーを入力（スライダーや参照コンポーネント）として定義の左端に集約します。

- **基準（Reference）**: 正中面（対称軸）、目の高さ面、奥行きを規定する前後基準面。
- **ランドマーク（Points）**: 鼻先、瞳中心、口角など、造形のキーとなる「点」。
- **断面曲線（Profiles）**: 横顔の正中プロファイル、および形状を定義する数本の横断面曲線。
- **数値（Parameters）**: `Thickness_mm`（シェルの肉厚）、`Clearance_mm`（機構との隙間）。

## 形状生成（Shape Construction）

Q: 参照メッシュからスムーズで編集しやすい外形サーフェスを生成するための、Grasshopper内での標準的な構成手順は？

A: メッシュを直接変換するのではなく、**「曲線から面を編み出す」** 構成をとります。

```mermaid
flowchart LR
  %% ===== References / Inputs =====
  subgraph group_Inputs["Inputs(LeftSide)"]
    subgraph comp_RefMesh["RefMesh(Locked)"]
      out_Mesh((Mesh))
    end
    subgraph comp_RefPlanes["Planes"]
      out_Pln((Pln))
    end
    subgraph comp_Params["Parameters"]
      out_Thickness((Thickness_mm))
      out_Clearance((Clearance_mm))
    end
  end

  %% ===== Section curves =====
  subgraph group_Sections["Sections(Curves)"]
    subgraph comp_Contour["Contour_or_MeshPlane"]
      in_MeshA([Mesh])
      in_PlnA([Pln])
      out_SecCrv((Crv[]))
    end
    subgraph comp_Rebuild["RebuildCurve"]
      in_CrvList([Crv[]])
      out_Rebuilt((Crv[]))
    end
  end

  %% ===== Surfaces -> Shell -> Brep =====
  subgraph group_Surfaces["Surfaces_to_Brep"]
    subgraph comp_Loft["Loft_or_NetworkSrf"]
      in_Loft([Crv[]])
      out_Srf((Srf/Brep))
    end
    subgraph comp_Offset["OffsetSurface"]
      in_Srf([Srf/Brep])
      in_T([Thickness_mm])
      out_Shell((Brep))
    end
  end

  %% ===== Wires =====
  out_Mesh --> in_MeshA
  out_Pln --> in_PlnA
  out_SecCrv --> in_CrvList
  out_Rebuilt --> in_Loft
  out_Srf --> in_Srf
  out_Thickness --> in_T
```

1. **断面の抽出・整理**: 参照メッシュから `Contour` や `Mesh × Plane` で断面を取り、`Rebuild Curve` で制御点を整えた「設計用断面曲線」を作成します。
2. **サーフェス生成**: 整えた曲線群を `Loft`（ロフト）や `Network Surface`（ネットワークサーフェス）に繋ぎ、滑らかな外観（A面）を生成します。

※メッシュ原型はあくまでガイド（参照）として使い、実際のサーフェスはGrasshopper上で定義された曲線から生成することで、データの軽量化と編集の柔軟性を確保します。

## 厚み付け（Shelling）

Q: 生成した外装に「厚み」を持たせる際、データの破綻を防ぐための安全なアプローチは何ですか？

A: **「まず均一な厚みの殻を作り、補強は後から足す」** という2段構えのアプローチを推奨します。

> 関連: `../rhino/variable-thickness-shell.md`（厚み付けの詳細）

Q: Grasshopperを使用して、曲線やサーフェスに対して「オフセット（厚み付け）」を行う際に使用する主要なコンポーネントと注意点は？

A: 対象物の種類に応じて、以下のコンポーネントを使い分けます。

- **曲線のオフセット**: `Offset Curve`（Curve > Util）
- **サーフェス/Brepのオフセット**: `Offset Surface`（Surface > Util）
  - ※内部的に `Brep.CreateOffsetBrep` などの高度な処理が必要な場合は、C#スクリプトを介することもあります。
- **メッシュのオフセット**: `Offset Mesh`（Mesh > Util）

Q: 実際に厚み付け（オフセット）処理を運用する際、形状が複雑な部位で発生しやすいトラブルとその対策はありますか？

A: 以下の2点に注意して定義を組みます。

- **自己交差の回避**: 曲率が急な箇所（耳の付け根など）ではオフセット面が突き抜けることがあります。厚みを増やす前に曲線を `Smooth` するか、厚み付けの後に自己交差部をトリムする処理を検討します。
- **方向の管理**: 「外観のシルエットを守るために内側に厚くする」のか、「内部空間を守るために外側に厚くする」のかを、スライダーの正負（プラスマイナス）で明確に管理します。

## 詳細設計（分割・穴・コネクタ）

Q: モデルの分割面や目の穴、コネクタ取り付け部など、詳細設計に関わる要素をGrasshopperでどのように管理すべきですか？

A: これらは「本体の形状が決まった後に適用されるフィルター」のように構成します。

- **分割（Split）**: 分割基準線を入力として持ち、`Brep Split` で前後を分けます。
- **開口（Openings）**: 基準点と穴径を指定し、投影した曲線で最後に切り抜きます。
- **コネクタ（Connectors）**: 平面パッドなどの「当たり面」を外装の内側に生成し、ブーリアン結合（`Boolean Union`）させます。外装に直接ボト付けせず、中間層を作るのがコツです。

> 関連: `../rhino/splitting-and-openings.md` / `../rhino/connectors-and-cad-integration.md`

## ワークフローの移行（ベイク）

Q: Grasshopperでの調整を終え、Rhino上での実作業（ベイク）に移行するタイミングや、その判断基準を教えてください。

A: **「パラメトリックな調整が必要な段階」** が終わった時がベイクのタイミングです。

- **GHで完結させるべき工程**: 全体のプロポーション調整、均一な厚み付け、主要な開口部の配置。
- **Rhino（手作業）に移行してもよい工程**: 非常に細かい角の面取り（Fillet）、現物合わせの局所的な削り込み、製造直前の最終チェック。

どこまでをGrasshopperで管理し、どこからをRhino上の確定データとして扱うかをあらかじめ決めておく（Bake地点を明確にする）ことで、作業の逆戻りを防げます。
