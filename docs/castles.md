# 全国の城 図鑑（/castles）制作メモ

## ページ構成

| URL | 内容 |
| :-- | :-- |
| `/castles` | 表紙・はじめに・凡例・目次（章 → 都道府県 → 城） |
| `/castles/<slug>` | 1城1ページ（写真・天守データ・歴代城主・年表・歴史と経緯・参考） |
| `/castles/book` | 全城を章立てで連続表示。ブラウザの印刷 → PDF で A4 の本になる（章扉・1城1ページ） |

- 検索エンジンには載せない設定（`robots: noindex`）。公開する段階で `src/app/castles/layout.tsx` の `robots` を外す。
- サイト共通のチャット吹き出し・会員登録帯・LINE帯は `/castles` 配下では非表示。

## 掲載基準・並び順

- 天守（または天守代用の櫓）が現地に建っている城のみ。石垣・堀のみの城跡は対象外。
- 章の順: 現存12天守 → 木造復元 → 外観復元 → 復興 → 模擬。章内は都道府県コード（北 → 南）順。
- 分類は Wikipedia「天守」の分類および各市町村の公式表記を基準にした。境界的な城（大阪城・福知山城・小田原城など）は本文中で理由を記載している。

## データの場所

```
src/data/castles/
  types.ts            型・種別ラベル
  genzon.ts           現存12天守
  fukugen-mokuzo.ts   木造復元（5）
  fukugen-gaikan.ts   外観復元（9）
  fukko.ts            復興（12）
  mogi-east.ts        模擬・東日本（12）
  mogi-west.ts        模擬・西日本（16）
  commons-images.json 城ごとの Wikimedia Commons 写真ファイル名（role: exterior / detail / alt）
  images.ts           写真URLの解決、ローカル写真の差し替え（LOCAL_OVERRIDES）
  index.ts            並び替え・章立て・前後ページ
```

## 写真について

- AI生成画像は使わない。Wikimedia Commons の写真（CC ライセンス／パブリックドメイン）を `Special:FilePath` 経由で表示し、各写真の下に出典ページへのリンクを付けている。
- **要確認**: ファイル名はネット検索の結果から機械的に選んだため、公開前に以下を目で確認する。
  1. 実際に表示されるか（表示できない場合は「写真を準備中」の枠になる）
  2. 人物が写り込んでいないか
  3. ライセンス表記（CC BY / CC BY-SA は出典表示が必要。現状はリンクで対応）
- 写真の差し替え: `commons-images.json` の `file` を書き換える（Commons のファイル名。`File:` は不要）。
- 手元の写真を使う: `public/images/castles/<slug>/` に置き、`images.ts` の `LOCAL_OVERRIDES` に登録する。ローカル写真は Commons より先に表示される。
- 一括ダウンロード（ネットに出られるPCで）: `bash scripts/castles/download_images.sh`

## 校正のポイント

- 本文（城主の変遷・年代）は各城の公式サイト・Wikipedia を基に作成。公開前に各ページ末尾の「参考」リンクで年号・人名を照合する。
- 特に注意: 城主が頻繁に替わった城（掛川・浜松・関宿など）の途中の城主は要約している。
