# Vercel デプロイガイド

このプロジェクトを Vercel にデプロイするための推奨設定と、公開後のチェックリストです。

## 1. Vercel 推奨設定

GitHub リポジトリを Vercel にインポートする際、以下の設定を確認してください。
Next.js プロジェクトであれば、基本的に **Framework Preset: Next.js** を選択するだけで自動的に設定されます。

| 項目 | 設定値 | 備考 |
| --- | --- | --- |
| **Framework Preset** | `Next.js` | 自動検出されます |
| **Build Command** | `next build` | デフォルトのままでOK |
| **Output Directory** | `.next` | デフォルトのままでOK (上書き不要) |
| **Install Command** | `npm install` | デフォルトのままでOK |

### 環境変数の設定 (Environment Variables)
`.env.local` に設定した内容を、Vercel の **Settings > Environment Variables** にすべて追加してください。

- `MICROCMS_SERVICE_DOMAIN`
- `MICROCMS_API_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_URL` (本番URLが決まり次第、または `https://your-project.vercel.app` などを設定)

## 2. 本番公開後の動作チェックリスト

デプロイ完了後、本番URLにアクセスして以下の項目を確認してください。

### 基本表示・ナビゲーション
- [ ] **トップページ**: ヒーロー画像、Aboutセクションが表示されているか。
- [ ] **ヘッダー/フッター**: リンク（商品一覧、体験、業務用、お問い合わせなど）が正しく機能するか。
- [ ] **レスポンシブ**: スマートフォンで閲覧した際、レイアウトが崩れていないか。

### MicroCMS 連携
- [ ] **商品一覧 (`/products`)**: 商品データが表示されているか（MicroCMSのデータが反映されているか）。
- [ ] **商品詳細 (`/products/[id]`)**: 個別の商品ページが表示され、画像が表示されているか。
- [ ] **お知らせ (`/news`)**: 記事一覧が表示され、詳細ページに遷移できるか。

### フォーム機能
- [ ] **個人用お問い合わせ (`/contact/personal`)**: 必須項目を入力して送信し、完了メッセージが表示されるか。
- [ ] **法人用お問い合わせ (`/contact/business`)**: 必須項目を入力して送信し、完了メッセージが表示されるか。
  - *注意: 現在はダミー送信（成功メッセージのみ）の実装です。バックエンド連携時はメール受信も確認が必要です。*

### その他
- [ ] **404ページ**: 存在しないURL（例: `/hogehoge`）にアクセスした際、404ページが表示されるか。
- [ ] **OGP**: SNS（XやFacebookなど）でシェアした際、タイトル・説明文・画像（OGP）が正しく表示されるか。
  - [Vercel OGP Debugger](https://www.opengraph.xyz/) などで確認できます。
