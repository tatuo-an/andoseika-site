# andoseika-site 引き継ぎドキュメント

安藤青果の産直通販サイト（本番: https://ando-seika.vercel.app 、独自ドメイン ando-seika.com）の仕組み・外部連携・運用方法をまとめたもの。

作成日: 2026-08-25

---

## 1. 概要（まず知っておくこと）

- サイトの中身は「商品在庫」「注文」「顧客情報」まで含めて、**すべてGoogleスプレッドシートで管理**している。専用の管理データベースは無い。
- 決済は**Stripe**（クレジットカード／一部銀行振込）。決済が完了すると自動で注文がスプレッドシートに記録され、お客様へLINEまたはメールで通知が飛ぶ。
- お客様との連絡は**LINE公式アカウント（@798zdpae、通称「あんどう🥭」）**が中心。LINEでログインしている人にはLINEで、そうでない人にはメールで通知する仕組み。
- 管理者（安藤達夫さん・今村さん）は `/admin` 以下の管理画面から、商品の追加・在庫編集・注文対応・季節セール設定などをすべてブラウザから行える。コードを触らなくても日常運用は完結する設計。
- **管理者アカウントは固定でメールアドレス指定**（`src/lib/admin.ts`）。現在は `tatuo.an@gmail.com` と `imamura0510@gmail.com` の2人のみ管理画面に入れる。増やす場合はこのファイルにメールアドレスを追加してデプロイする必要がある。

---

## 2. システム構成

```
お客様のブラウザ
      │
      ▼
Next.js アプリ（Vercel でホスティング）
  ├─ ページ描画・カート・決済フロー
  ├─ 管理画面 (/admin 以下)
  └─ APIルート（Webhook・cron・管理操作）
      │
      ├──▶ Google Sheets（3系統、下記参照）
      ├──▶ Stripe（決済）
      ├──▶ LINE Messaging API / LINE Login（通知・ログイン・自動応答）
      ├──▶ microCMS（商品説明・画像などのコンテンツ管理）
      ├──▶ Resend（メール送信）
      ├──▶ Anthropic API（LINE大口注文のAI自動応答）
      └──▶ Google OAuth（サイトへのログイン）
```

リポジトリ: `tatuo-an/andoseika-site`（GitHub） → Vercelが自動デプロイ（`main`ブランチにpushすると本番反映）。

### Google Sheetsの3系統（別々のスプレッドシート！）

サイトが読み書きするスプレッドシートは1つではなく**3つ**あり、混同しやすいので注意。

| 用途 | 環境変数 | 主なシート |
|---|---|---|
| メインDB（オンライン販売） | `GOOGLE_SPREADSHEET_ID` | 商品在庫／注文管理／顧客マスタ／季節セール／送料マスタ／ポイント履歴／注文メッセージ／オンライン 等 |
| LINE大口注文管理 | `LINE_ORDER_SPREADSHEET_ID` | 注文／大口注文／大口注文明細／ユーザー／既存取引先リスト／AIセッション |
| 売上・出荷管理 | `GOOGLE_SALES_SPREADSHEET_ID` | 売上データ／（予約）洗い／（予約）根付／（予約）メロン／（予約）梨／商品マスタ／販売先マスタ 等 |

いずれも同じサービスアカウント（`GOOGLE_DRIVE_CLIENT_EMAIL` / `GOOGLE_DRIVE_PRIVATE_KEY`）でアクセスしている。**新しいスプレッドシートを用意した場合は、必ずこのサービスアカウントを「編集者」として共有し直すこと**（過去に共有し忘れて丸ごと動かないことがあった）。

---

## 3. 主要な自動化フロー

### 通常注文（サイトでの購入）
1. お客様がカートで決済 → Stripe決済完了
2. Stripe Webhook（`src/app/api/webhook/route.ts`）が起動
3. 「注文管理」シートに1行追記
4. お客様のLINE userIdが分かればLINE通知、無ければメール通知（`src/lib/sendOrderLine.ts`）
5. 管理画面で「発送済みにする」→追跡番号を入力すると、同じ仕組みで発送通知が飛ぶ

### LINE大口注文（法人・取引先向け）
1. LINEグループ or 個人チャットでメッセージ送信
2. `src/app/api/line-order-webhook/route.ts` が受信
3. Claude（Anthropic API）が注文内容を解析し、品名・数量が読み取れたら確認メッセージを返信
4. お客様が確認OKと返信すると「大口注文」シートに登録され、安藤さん本人へLINE通知

### 売上・発送の振り分け（一括転記）
- 管理画面「注文管理」の「売上シートへ一括転記」ボタンから、商品名のキーワードで自動振り分け
- 洗いらっきょう／根付きらっきょう／メロン／梨（新甘泉・二十世紀）は専用の「（予約）〇〇」シートへ、それ以外は「売上データ」へ

### 定期実行（cron、Vercelのcron設定が必要）
- サポーター更新案内：更新日の30日前・7日前に自動送信
- LINE大口注文の週次リマインド：毎週月曜、未注文グループへ送信

---

## 4. 管理画面（`/admin`）でできること

| メニュー | できること |
|---|---|
| 注文管理 | 通常注文の一覧・発送処理・追跡番号入力・お客様へのメッセージ送信・売上シート転記 |
| 顧客一覧 | 会員情報の確認 |
| 詰め合わせ発送 | サポーター向け定期便の発送管理 |
| LINE注文管理 | 大口注文・個人注文の確認・ステータス変更・LINE通知送信 |
| サポーター管理 | サポーター会員のプラン確認 |
| 季節セール管理 | 年賀・母の日・お中元など13種類の季節セールの期間・割引率を編集 |
| 商品・在庫 | 商品の追加・削除・在庫数・価格・画像・セール設定など全般 |
| 送料設定 | 地域別の配送料金表 |

「注文管理」「LINE注文管理」のボタンには、対応が必要な注文があると赤い件数バッジが出る（30秒ごとに自動更新）。

---

## 5. 環境変数一覧

Vercelプロジェクト「ando-seika」の Settings → Environment Variables に設定されている（ローカル開発時は `.env.local`）。

### Google
| 変数名 | 用途 |
|---|---|
| `GOOGLE_SPREADSHEET_ID` | メインスプレッドシート（オンライン販売）のID |
| `GOOGLE_SALES_SPREADSHEET_ID` | 売上・出荷管理スプレッドシートのID |
| `GOOGLE_DRIVE_CLIENT_EMAIL` | Sheets APIアクセス用サービスアカウントのメールアドレス |
| `GOOGLE_DRIVE_PRIVATE_KEY` | 同サービスアカウントの秘密鍵 |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | サイトへのGoogleログイン（OAuth）用 |

### LINE
| 変数名 | 用途 |
|---|---|
| `LINE_CHANNEL_ACCESS_TOKEN` | Messaging API送信用トークン（通知・自動応答すべて共通） |
| `LINE_CHANNEL_SECRET` | LINE Webhookの署名検証用 |
| `LINE_ORDER_CHANNEL_ACCESS_TOKEN` | （未設定時は`LINE_CHANNEL_ACCESS_TOKEN`にフォールバック）大口注文通知専用トークンを分けたい場合 |
| `LINE_CLIENT_ID` / `LINE_CLIENT_SECRET` | サイトへのLINEログイン（OAuth）用 |
| `LINE_ORDER_SPREADSHEET_ID` | LINE大口注文管理スプレッドシートのID |
| `OWNER_LINE_USER_ID` | 新規LINE注文発生時に安藤さん本人へ通知する送信先。**取得方法**: 大口注文用LINEアカウント（グループ含む）で「ID」とだけメッセージを送ると、Bot（`line-order-webhook`）が送信者本人のLINE userIdを返信してくれるので、それをこの環境変数に設定する |

### Stripe
| 変数名 | 用途 |
|---|---|
| `STRIPE_SECRET_KEY` | サーバー側の決済処理用シークレットキー |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | クライアント側の公開可能キー |
| `STRIPE_WEBHOOK_SECRET` | Webhook署名検証用 |

### microCMS
| 変数名 | 用途 |
|---|---|
| `MICROCMS_SERVICE_DOMAIN` | 商品説明・画像等のコンテンツ管理サービスのドメイン |
| `MICROCMS_API_KEY` | 読み取り用APIキー |
| `MICROCMS_WRITE_API_KEY` | 画像アップロード等の書き込み用APIキー |

### メール（Resend）
| 変数名 | 用途 |
|---|---|
| `RESEND_API_KEY` | メール送信API（LINE未連携時のフォールバック等） |
| `MAIL_FROM` | 送信元アドレス（未設定時は`onboarding@resend.dev`） |
| `MAIL_REPLY_TO` | 返信先アドレス |

### AI・その他
| 変数名 | 用途 |
|---|---|
| `ANTHROPIC_API_KEY` | LINE大口注文のAI自動応答（Claude）、サイト内チャットウィジェット |
| `OPENAI_API_KEY` | サイト内チャットウィジェット（`/api/chat`）用。ローカル未設定だとビルド時に無害なエラーが出るが本番では設定済み |
| `CRON_SECRET` | cronエンドポイントの簡易認証（Vercel Cronからのリクエストのみ許可） |
| `GAS_SECRET` | GAS（ando-seika-gasプロジェクト）連携用の認証トークン |
| `COMPLAINT_READ_WRITE_TOKEN` | クレーム対応関連の読み書き認証（詳細はコード参照） |
| `R2_PUBLIC_URL_BASE` | Cloudflare R2（画像等の保管先）の公開URLベース |
| `SURVEY_PASSWORD` / `NEXT_PUBLIC_SURVEY_FORM_URL` | アンケート機能関連 |
| `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_URL` | サイトの本番URL（メール・LINE通知内のリンク生成等に使用） |

> **重要**: 現状の本番はVercelだが、**別タスクとしてCloudflareへの移行が進行中**。`src/lib/mailer.ts`のコメントにも「Vercel時代はGmail SMTP、Workersに移行するとResend一本化」という記述があり、`R2_PUBLIC_URL_BASE`（Cloudflare R2用）もその布石。移行が完了すると、上記の環境変数の設定場所（Vercel→Cloudflare側の設定画面）やデプロイの仕組み自体が変わる可能性が高いので、引き継ぎ時点でこの移行がどこまで進んでいるか必ず確認すること。

---

## 6. よくあるトラブルと切り分け方（実際にあった事例）

### LINE通知が届かない
原因になりうるものは主に3つ。上から順に確認するとよい。

1. **`LINE_CHANNEL_ACCESS_TOKEN`が失効している** — LINE Developersコンソール（https://developers.line.biz/console/channel/2009634009/messaging-api）の「チャネルアクセストークン（長期）」を再発行し、Vercelの環境変数に反映（**保存後は必ずRedeployする**。保存しただけでは既存のデプロイには反映されない）
2. **LINE公式アカウントの月間配信通数上限を超過している**（ライトプラン） — LINE Official Account Manager（https://manager.line.biz/account/@798zdpae）の「分析」ページで確認
3. **お客様が公式アカウントをブロック／友だち解除している**

いずれの場合も、コードは失敗を検知すると自動でメールにフォールバックし、管理画面には送信成功したように記録されるため、**見た目だけでは原因が判別できない**。実際のエラーはVercelのRuntime Logsに残る（`[message] LINE push failed`等で検索）。

### スプレッドシートが読み込めない・空表示になる
新しいスプレッドシートを用意した／既存シートをコピーした場合、サービスアカウント（`GOOGLE_DRIVE_CLIENT_EMAIL`の値）を編集者として共有し忘れていることが多い。共有設定を確認する。

### 商品一覧・管理画面が「一時的に」空になる
Google Sheets APIへの読み込みが連続すると稀に一時的な通信エラーが起きる。現在はリトライ処理と短時間キャッシュ（`src/lib/inventorySheet.ts`）で緩和済み。それでも起きる場合は原因を再調査する必要がある。

---

## 7. 関連プロジェクト（別リポジトリ）

- **ando-seika-gas**（`C:\Users\user\Desktop\ando-seika-gas`）: Google Apps Script側の自動化（CSV取込・売上振り分け・LINE送信ログ等）。andoseika-siteの「売上シートへ一括転記」機能は、このGASツールの振り分けロジックに合わせて実装している。
- **line-auto-reply**（`C:\Users\user\Desktop\line-auto-reply`）: LINE公式アカウントの自動応答・自動通知の仕様まとめ（`システム自動応答一覧.md`）と、はちみつラベル企画の手動返信テンプレート集（`CLAUDE.md`）。

両プロジェクトは同じLINEチャンネル（@798zdpae）・同じ`GOOGLE_DRIVE_CLIENT_EMAIL`サービスアカウントを共有している点に注意（片方だけ設定を直しても、もう片方が古いままのことがある）。
