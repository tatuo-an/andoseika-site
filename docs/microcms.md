# MicroCMS 運用マニュアル

このプロジェクトでは、商品情報とお知らせの管理に [MicroCMS](https://microcms.io/) を使用しています。

## 管理画面
- URL: [https://microcms.io/dashboard](https://microcms.io/dashboard)
- サービスID: `giant-spirit` (または設定したID)

## コンテンツ構成

### 1. 商品 (products)
商品情報を管理するAPIです。

| フィールドID | 表示名 | 種類 | 必須 | 説明 |
| --- | --- | --- | --- | --- |
| `name` | 商品名 | テキストフィールド | 必須 | 商品の名前 |
| `price` | 価格 | 数値フィールド | 必須 | 税込み価格 |
| `description` | 商品説明 | テキストエリア | 必須 | 商品の詳細説明 |
| `images` | 商品画像 | 繰り返しフィールド | 任意 | 商品画像のリスト |
| `category` | カテゴリ | セレクトフィールド | 必須 | negi, nagaimo, satoimo, nashi, honey, rakkyo, other |
| `stock` | 在庫数 | 数値フィールド | 任意 | 在庫管理用（現在は表示のみ） |
| `order` | 表示順 | 数値フィールド | 任意 | 小さい数字ほど先に表示されます |

#### 画像について
- 推奨サイズ: 1200x800px (3:2) または 1000x1000px (1:1)
- 形式: JPG, PNG, WebP
- 容量: 1枚あたり500KB以下推奨

### 2. お知らせ (news)
ブログやニュースを管理するAPIです。

| フィールドID | 表示名 | 種類 | 必須 | 説明 |
| --- | --- | --- | --- | --- |
| `title` | タイトル | テキストフィールド | 必須 | 記事のタイトル |
| `content` | 本文 | リッチエディタ | 必須 | 記事の本文 |
| `publishedAt` | 公開日時 | 日時 | 自動 | 公開日 |
| `category` | カテゴリ | セレクトフィールド | 任意 | info, event, media, other |
| `thumbnail` | サムネイル | 画像 | 任意 | 一覧に表示される画像 |

## 新しい商品・ニュースの追加手順

1. MicroCMSの管理画面にログインします。
2. 左メニューから「商品」または「お知らせ」を選択します。
3. 右上の「追加」ボタンをクリックします。
4. 各フィールドに必要な情報を入力します。
5. 右上の「公開」ボタンをクリックすると、即座にサイトに反映されます。

## 開発者向け情報

### 環境変数
`.env.local` に以下の設定が必要です。

```bash
MICROCMS_SERVICE_DOMAIN=your-service-domain
MICROCMS_API_KEY=your-api-key
```

### データ取得ロジック
- **商品詳細ページ**: MicroCMSからデータを取得し、存在しない場合はローカルの `src/data/products.json` をフォールバックとして使用します。
- **商品一覧ページ**: MicroCMSのデータを優先して表示します。

### 画像の優先順位
1. MicroCMSに画像が登録されている場合 → その画像を使用
2. MicroCMSに画像がない場合 → ローカルの `public/images/products/` 内の画像（IDに基づくファイル名）を使用
