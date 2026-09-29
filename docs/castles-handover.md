# 引き継ぎ書：全国の城 図鑑（/castles）

作成日: 2026-09-29
ブランチ: `claude/japan-castles-guide-bncfky`（push済み・未マージ）
コミット: `524f56e 全国の城 図鑑(/castles)を追加`

---

## 1. 結論（現状）

| 項目 | 状態 |
| :-- | :-- |
| ページ・本文・データ（66城） | **完了** |
| ビルド（`next build`） | **成功**（66城分の静的ページ生成を確認） |
| 写真の実物確認 | **未完了**（作業環境から Wikimedia Commons に接続できず） |
| 本文の校正（年号・人名） | **未完了** |
| main へのマージ・公開 | **未実施**（`noindex` 設定のまま） |

---

## 2. できたもの

### URL

| URL | 内容 |
| :-- | :-- |
| `/castles` | 表紙・はじめに・凡例・目次（章 → 都道府県 → 城、通しページ番号） |
| `/castles/<slug>` | 1城1ページ。写真3枚・天守データ・歴代城主の変遷・西暦年表・歴史と経緯（焼失と復元）・参考リンク・前後ページ送り |
| `/castles/book` | 全城を章立てで連続表示。ブラウザの印刷 → PDF でA4の本（章扉つき・1城1ページ） |

### 掲載構成（依頼どおり）

1. 現存12天守（12）
2. 木造復元天守（5）：白石・白河小峰・新発田・掛川・大洲
3. 外観復元天守（9）：松前・会津若松・大垣・名古屋・和歌山・岡山・広島・福山・熊本
4. 復興天守（12）：小田原・高田・越前大野・高島・岐阜・岡崎・福知山・大阪・岸和田・岩国・小倉・島原
5. 模擬天守（28）：横手・上山・忍・関宿・千葉・館山・大多喜・久留里・富山・郡上八幡・墨俣・小牧山・清洲・岩崎・浜松・伊賀上野・長浜・伏見桃山・尼崎・洲本・今治・川之江・中村・唐津・平戸・中津・杵築・綾

章内は都道府県コード順（北 → 南）。石垣のみの城跡は掲載していない。

### 共通部品への変更

- `/castles` 配下では、サイト共通のチャット吹き出し・会員登録帯・LINE帯を非表示（`/stamp`・`/ai` と同じ扱い）。
- `sitemap.ts` に `/castles`・`/castles/book` を追加。ただし `layout.tsx` で `noindex` なので検索エンジンには載らない。

---

## 3. ファイルの場所

```
src/app/castles/
  layout.tsx          図鑑用ナビ・明朝フォント・noindex 設定
  castles.css         紙面デザイン・印刷用スタイル（@media print）
  page.tsx            表紙・凡例・目次
  [slug]/page.tsx     1城ページ（generateStaticParams で66ページを静的生成）
  book/page.tsx       通読（本）

src/components/castles/
  CastleImage.tsx     写真1枚（読み込み失敗時は「写真を準備中」枠に切替）
  CastlePage.tsx      1城のレイアウト（詳細ページと本で共用）

src/data/castles/
  types.ts            型・種別ラベル・章の説明文
  genzon.ts           現存12天守
  fukugen-mokuzo.ts   木造復元
  fukugen-gaikan.ts   外観復元
  fukko.ts            復興
  mogi-east.ts        模擬（東日本）
  mogi-west.ts        模擬（西日本）
  commons-images.json 城ごとの Wikimedia Commons 写真ファイル名（role: exterior / detail / alt）
  images.ts           写真URLの解決・LOCAL_OVERRIDES（手元写真の差し替え口）
  index.ts            並び替え・章立て・前後ページ・ページ番号

scripts/castles/download_images.sh   Commons 写真の一括ダウンロード
docs/castles.md                      制作メモ（掲載基準・写真の扱い・校正ポイント）
docs/castles-handover.md             本書
```

---

## 4. 未完了・要確認事項（優先順）

### 4-1. 写真の実物確認【最優先・NG状態】

- 写真はネット検索でファイル名だけ集めた状態。**1枚も実物を見ていない。**
- 表示されない写真は自動で「写真を準備中」の枠になる（レイアウトは壊れない）。
- 確認すること：
  1. 表示されるか
  2. 人物が写り込んでいないか（依頼条件：人が写っていない写真のみ）
  3. ライセンス（CC BY / CC BY-SA は出典表示が必要。現状は各写真下の「出典: Wikimedia Commons」リンクで対応）
- 写真が1枚しかない城（9城）：白石・高田・島原・館山・尼崎・洲本・中村・中津・綾
- 写真が2枚の城（3城）：高島・今治・平戸
- 検索メモで「内容未確認」とされた写真：岡崎（detail）・福知山（detail）・岸和田（detail）・岩国（detail）・富山（detail）

### 4-2. 本文の校正

- 城主の変遷・年代は各城の公式サイト・Wikipedia を基に作成。**公開前に各ページ末尾「参考」リンクで照合が必要。**
- 城主が頻繁に替わった城（掛川・浜松・関宿・高田・大垣）は途中の城主を要約している。
- 現在進行中の事柄（弘前城の曳屋・広島城天守の閉館時期・熊本城の復旧・名古屋城天守の木造復元・大多喜城分館の休館）は執筆時点の情報。最新状況は公式サイトで確認。

### 4-3. 分類の境界

以下は資料によって分類が揺れる城。本文中に分類理由を記載済みだが、別の分類にしたい場合はデータファイル間で移動する（`category` と配置ファイルを変えるだけ）。

- 大阪城：復興（模擬とする資料もある）
- 福知山城：復興（外観復元とする資料もある）
- 小田原城：復興（外観復元に近い）
- 洲本城・郡上八幡城・伊賀上野城：模擬（現存する古い模擬天守）

---

## 5. 次にやる操作

### A. 確認（14日朝の予定だった作業）

1. Vercel でブランチ `claude/japan-castles-guide-bncfky` のプレビューURLを開く。
2. `/castles` → 目次から数城開き、写真が出るか見る。
3. `/castles/book` を開き、ブラウザ印刷（PDF保存）で本の体裁を確認する。

### B. 写真を直す

- Commons の別写真にする：`src/data/castles/commons-images.json` の `file` をファイル名（`File:` なし）に書き換える。
- 手元の写真を使う：`public/images/castles/<slug>/` に置き、`src/data/castles/images.ts` の `LOCAL_OVERRIDES` に追加する。ローカル写真が Commons より先に表示される。

```ts
export const LOCAL_OVERRIDES: Record<string, CastleImage[]> = {
  himeji: [{ local: "/images/castles/himeji/01.jpg", caption: "大天守を三の丸から", credit: "撮影: 安藤" }],
};
```

- Commons 写真を手元に一括保存（ネットに出られるPCで）：

```bash
bash scripts/castles/download_images.sh
```

保存先 `public/images/castles/<slug>/` に写真と `CREDITS.txt`（出典URL）ができる。

### C. 本文を直す

- 該当する種別のデータファイル（`src/data/castles/*.ts`）を直接編集する。1城 = 1オブジェクト。
- 城を追加：同じ形式でオブジェクトを追加し、`commons-images.json` に同じ slug で写真を登録する。並び順は都道府県コードで自動。

### D. 公開する

1. `src/app/castles/layout.tsx` の `robots: { index: false, follow: false }` を削除する。
2. main にマージする（PR未作成）。

---

## 6. 作業環境の制約（今回できなかった理由）

- クラウド作業環境から `wikimedia.org`・`wikipedia.org`・城の公式サイトへの通信がすべて遮断されていた。
- そのため写真の実物・ライセンスの直接確認、公式サイトでの年号照合ができなかった。
- ウェブ検索（検索結果のスニペットのみ）で写真ファイル名を集めた。検索回数の上限に達したため、一部の城は写真が1〜2枚。
- `npm run lint` は29エラーが出るが、すべて既存ファイル由来。`castles` 配下は0件。

## 7. 検証済みの事項

- `npx tsc --noEmit`：エラーなし
- `npx eslint src/app/castles src/components/castles src/data/castles`：エラーなし
- `npm run build`：成功（ダミー環境変数で実行。`/castles/[slug]` 66ページを静的生成）
- `next start` で `/castles`・`/castles/book`・`/castles/himeji` が 200 を返すこと、PC幅・スマホ幅のレイアウト崩れがないことをスクリーンショットで確認
