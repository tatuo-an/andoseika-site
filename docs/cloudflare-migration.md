# Vercel → Cloudflare Workers 移行手順

対象: `andoseika-site`（ando-seika.com）
方式: OpenNext for Cloudflare（`sns-tool-cf` と同じ構成）
ブランチ: `cloudflare-migration`

---

## 0. 現在の状況（引き継ぎ用サマリー・2026-08-25時点）

**まだ本番切り替え（DNS切替）はしていない。** コード側の移行作業とリスク洗い出しが完了した段階。

### 完了したこと
- [x] コード移行（`googleapis`→`@googleapis/sheets`等、81ファイル）。型チェック通過済み
- [x] `wrangler.jsonc` / `custom-worker.ts` / `open-next.config.ts` 作成、cron 4本を移設
- [x] Windows実機で `cf:build` 成功、`wrangler dev --local` で疎通・cron動作を確認済み（2-3節参照）
- [x] Worker サイズの実測（gzip 3.03MiB → 有料プラン必須と判明、2-6節参照）
- [x] **GAS→サイトのLINE中継URL修正**（`ando-seika-gas`の`LINE通知.js`の`AI_ORDER_BOT_WEBHOOK_URL`を`ando-seika.vercel.app`→`ando-seika.com`に変更し、clasp push・deploy済み、稼働中）。これをやっていないとVercel Pause後にGAS経由のLINE注文botだけが気づかれずに止まっていた
- [x] 動作確認チェックリスト（3-4節）にGAS連携・LINE連携の項目を追加済み
- [x] **GitHub Actions のデプロイ workflow 作成**（`.github/workflows/deploy-cloudflare.yml`、2026-08-28）。`main` への push で自動デプロイ＝今までのVercelと同じ「pushだけ」運用に戻る。有効化には GitHub Secrets への登録が2つ必要（3-3節のCI項参照）
- [x] **LINE公式アカウントのリッチメニューURL変更**（`ando-seika.vercel.app`→`ando-seika.com`、2026-08-28完了）。変更先の主要ページ（`/`・`/products`・`/mypage`・`/experience`・`/supporter`・`/guide`・`/contact`・`/newsletter.html`）がすべて200を返すことを確認済み。GASの中継URLと同じく、直していないとVercel Pause後に**公式LINEで一番押される導線だけが黙って死ぬ**箇所だった

### まだのこと（DNS切替前に必要）
- [ ] Cloudflare有料プランへの加入（3MiB無料枠を超過するため）
- [ ] R2バケット2つの作成、シークレット33個の投入（3-2節）
- [ ] `NEXTAUTH_URL`を`https://ando-seika.com`に設定（**ここを間違えるとログインが壊れる**、Vercel側は`.vercel.app`のまま残っているので要注意）
- [ ] workers.dev上での動作確認チェックリスト全項目（3-4節）
- [ ] `rondo`（メール登録用の別Cloudflare Worker、`newsletter.html`から叩いている）がCORS/Refererでオリジンを制限していないか確認（未確認・優先度低め。ドメイン自体は変わらない予定なので影響は小さい見込み）
- [ ] DNS切替、外部サービス（Google/LINE/Stripeの各種URL）の向き先変更（3-6節）、Vercel cron停止

### 引き継ぐ人へ
このファイルの2節以降が実際の作業手順。3-6節「外部サービスの向き先変更」は**切替当日に忘れやすいので最優先で見ること**。GAS側の修正は上記の通り済んでいるので再対応不要。

---

## 1. 現状の整理

移行前の時点で、DNS と実配信は別々の場所にある。

| 項目 | 状態 |
|---|---|
| `ando-seika.com` のNS | Cloudflare（`kyrie` / `novalee.ns.cloudflare.com`）に委任済み |
| 実際のコンテンツ配信 | **Vercel**（Aレコード `216.198.79.1` / `64.29.17.1`） |
| `www.ando-seika.com` | apex へ 308 リダイレクト |
| `NEXT_PUBLIC_SITE_URL` | Vercel 上で `https://ando-seika.com` に設定済み |
| `NEXTAUTH_URL` | **`https://ando-seika.vercel.app` のまま**（要変更） |

---

## 2. コード側で完了した変更

| 変更 | 理由 |
|---|---|
| `googleapis` → `@googleapis/sheets` + `@googleapis/drive`（81ファイル） | `googleapis` は展開後 212MB あり Worker のサイズ上限を超える。実際に使うのは Sheets と Drive のみ |
| `nodemailer` 削除 → Resend 一本化（`src/lib/mailer.ts`） | Workers は生の TCP を張れず SMTP が使えない |
| `@vercel/blob` → R2（`upload-image` / `cleanup-images`） | Vercel 固有ストレージのため |
| OpenAI クライアントを遅延生成（`api/chat`） | Workers はモジュール評価時に env が未注入 |
| `custom-worker.ts` 追加 | OpenNext の worker は fetch のみ公開。cron 用の `scheduled` を追加 |
| `wrangler.jsonc` / `open-next.config.ts` 追加 | Cloudflare 構成 |
| `cf:build` / `cf:deploy` / `cf:types` スクリプト追加 | 家訓（CLIからのみデプロイ）に合わせる |

### 引き継いだ cron（UTC基準・Vercelと同じ式）

| cron式 | 叩くルート | JST |
|---|---|---|
| `0 2 * * *` | `/api/cron/cleanup-images` | 11:00 |
| `0 3 * * *` | `/api/cron/auto-complete` | 12:00 |
| `0 0 * * *` | `/api/cron/renewal-notifications` | 09:00 |
| `0 0 * * 1` | `/api/cron/line-order-reminder` | 月曜 09:00 |

---

## 3. Cloudflare 側で必要な作業（本人操作）

### 3-1. R2 バケットを2つ作る

```
npx wrangler r2 bucket create andoseika-site-uploads
npx wrangler r2 bucket create andoseika-site-cache
```

`andoseika-site-uploads` は**パブリックアクセスを有効化**し、発行された
`https://pub-xxxxxxxx.r2.dev` を `R2_PUBLIC_URL_BASE` に設定する（末尾スラッシュ無し）。

### 3-2. シークレットを投入

`npx wrangler secret put <KEY>` で1つずつ入れる。値は Vercel の環境変数画面から移す。

**next-auth 用（最重要・ここを間違えるとログインが壊れる）**

- `NEXTAUTH_SECRET` … Vercel と同じ値をそのまま
- `NEXTAUTH_URL` … **`https://ando-seika.com`**（vercel.app のままにしない）

**その他（アプリが参照する33個）**

```
ANTHROPIC_API_KEY            LINE_ORDER_SPREADSHEET_ID    NEXT_PUBLIC_URL
COMPLAINT_READ_WRITE_TOKEN   MAIL_FROM                    OPENAI_API_KEY
CRON_SECRET                  MAIL_REPLY_TO                OWNER_LINE_USER_ID
GAS_SECRET                   MICROCMS_API_KEY             R2_PUBLIC_URL_BASE
GOOGLE_CLIENT_ID             MICROCMS_SERVICE_DOMAIN      RESEND_API_KEY
GOOGLE_CLIENT_SECRET         MICROCMS_WRITE_API_KEY       STRIPE_SECRET_KEY
GOOGLE_DRIVE_CLIENT_EMAIL    NEXT_PUBLIC_SITE_URL         STRIPE_WEBHOOK_SECRET
GOOGLE_DRIVE_PRIVATE_KEY     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
GOOGLE_SALES_SPREADSHEET_ID  NEXT_PUBLIC_SURVEY_FORM_URL  SURVEY_PASSWORD
GOOGLE_SPREADSHEET_ID        LINE_CHANNEL_ACCESS_TOKEN
LINE_CHANNEL_SECRET          LINE_CLIENT_ID
LINE_CLIENT_SECRET           LINE_ORDER_CHANNEL_ACCESS_TOKEN
```

- `NEXT_PUBLIC_` 系はビルド時に埋め込まれるため、**ビルド前に `.env.local` にも入れておく**（secret だけでは効かない）
- `MAIL_FROM` は Resend で `ando-seika.com` を検証したうえで `noreply@ando-seika.com` 等にする。
  未設定だと `onboarding@resend.dev`（Resendのテスト送信元）のままで、**自分宛以外に送れない**

### 3-3. ビルドとデプロイ

```
npm ci
npm run cf:build
npm run cf:deploy
```

#### Windows で実行する場合

OpenNext はビルド時に「Windows は公式サポート外」と警告を出すが、
**2026-08-27 に Windows 11 / Node 24.15.0 で実測したところ問題なく動作した**。

- `npm run cf:build` 成功（Next.js 16.3.3 / OpenNext 1.20.4）
- 生成物に Windows のパス区切り（\）の混入なし
- `npx wrangler dev --local` で workerd 上で実行し、`/`・`/terms`・`/login`・`/robots.txt` がすべて 200
- `curl "http://127.0.0.1:8788/cdn-cgi/local/scheduled?cron=0+2+*+*+*"` で cron ハンドラも正しくルーティングされることを確認

Windows で足りないのは**認証だけ**。

```
npx wrangler login
```

ブラウザが開いて Cloudflare の OAuth 承認画面が出る。承認後 `npx wrangler whoami` で
アカウント名が表示されれば準備完了。

ただし OpenNext 側の公式サポートは無いままなので、将来ビルドが不可解に壊れた場合は
まず OS を疑い、WSL か CI（下記）で再現確認すること。

#### WSL で実行する場合

OpenNext の公式推奨。ただし `wsl --install` には**管理者権限と再起動が必要**
（2026-08-27 時点でこの PC には WSL 未導入・非管理者で実行中）。
導入後はリポジトリを WSL 側のファイルシステム（`~/andoseika-site`）に置くこと。
`/mnt/c/...` 越しにビルドすると極端に遅くなる。

#### CI（GitHub Actions）で実行する場合 ★推奨・構築済み

`.github/workflows/deploy-cloudflare.yml` を作成済み（2026-08-28）。
ローカル OS に依存せず、PC の電源状態とも無関係にデプロイできる。

**発火条件**
- `main` への push（`.md` だけの変更は除外）→ 今までの「pushだけで本番反映」と同じ体験
- Actions タブからの手動実行（`workflow_dispatch`）

**事前登録（1回だけ・本人操作）**

1. Cloudflare ダッシュボード → My Profile → API Tokens → Create Token →
   テンプレート「Edit Cloudflare Workers」を選び、**Workers R2 Storage: Edit を追加**する
   （`cf:deploy` の populateCache が R2 に書き込むため。無いとデプロイが途中で失敗する）。
   スコープは自アカウントに限定。
2. GitHub リポジトリ → Settings → Secrets and variables → Actions → Secrets に登録:

| Secret名 | 値 | 必須 |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | 上で発行したトークン | 必須 |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe の公開可能キー（Vercelの環境変数からコピー） | 必須（無いと決済ボタンが静かに壊れるため、workflow冒頭でチェックして落とす） |
| `NEXT_PUBLIC_SURVEY_FORM_URL` | アンケートフォームURL | 任意 |

サイトURL系（`NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_URL`）は秘密ではないので
workflow 内に `https://ando-seika.com` を直書きしてある。

**CI にサーバー系シークレット（Stripe秘密鍵・Google鍵など）は不要**。
環境変数ゼロでの `cf:build` 成功を実測済み（2026-08-28）。それらは実行時に
Worker の secret（3-2節）から読まれる。

**タイミングの注意（重要）**: Vercel も `main` を監視しているため、
`cloudflare-migration` を `main` にマージすると**両方にデプロイされる**。
移行後のコードは Vercel 上では画像アップロードが壊れ（`getCloudflareContext` が例外）、
Cloudflare 側では cron が動き始める（二重実行）。つまり **`main` へのマージ＝切替当日の操作**。
それまでの workers.dev 検証デプロイは、ローカルで `wrangler login` 済みの端末から
`npm run cf:build && npm run cf:deploy` を叩く（R2作成・secret投入でどのみちローカル認証が必要）。
手動実行ボタン（workflow_dispatch）は workflow が `main` に入った後（＝マージ後）に表示される。

### 3-4. workers.dev で動作確認（DNSを切り替える前）

`https://andoseika-site.ando-seika.workers.dev` で以下を確認する。

- [ ] トップ・商品一覧・商品詳細が表示される
- [ ] Google / LINE ログイン（`NEXTAUTH_URL` が正しいか）
- [ ] `/admin` に管理者アカウントで入れる
- [ ] Stripe 決済（テストモードで1件通す）
- [ ] `/newsletter.html` のメール登録（Turnstile + rondo Worker）
- [ ] お問い合わせ画像アップロード（R2 に入るか、URLが開けるか）
- [ ] `npx wrangler tail` を見ながら cron を手動実行
- [ ] **GAS連携**: `ando-seika-gas`側から `GAS_SECRET` 付きで `/api/admin/init-sheets` を実際に叩き、200が返るか確認（`GAS_SECRET`のsecret投入漏れ・ヘッダー名`x-gas-secret`の一致を要確認）
- [ ] **LINE連携（DNS切替前の時点でも先に確認できるもの）**: `LINE_ORDER_SPREADSHEET_ID`・`LINE_CHANNEL_ACCESS_TOKEN`のsecretが正しく入っているか、workers.dev上で「ID」コマンドを送って自分のuserIdが返るか（Webhook URL自体はDNS切替後でないとLINE Developers側で切り替えられないため、切替直後に最優先で確認する）

### 3-5. DNS 切り替え

Cloudflare DNS で `ando-seika.com` の A レコード（Vercel の2つ）を削除し、
Worker のカスタムドメインとして `ando-seika.com` と `www.ando-seika.com` を追加する。

### 3-6. 外部サービスの向き先変更

DNS を切り替えても、以下は**手動で変えないと壊れる**。

- Google Cloud Console … OAuth リダイレクトURI
- LINE Developers … コールバックURL / Webhook URL
- Stripe … Webhook エンドポイント（`/api/webhook`）
- Vercel … **cron を停止する**（下記）
- ~~**LINE公式アカウント … リッチメニューのリンクURL**~~ → **2026-08-28 対応済み**。LINE Official Account Manager 上で `ando-seika.com` に変更済みのため、DNS切替時の作業は不要。ドメインは切替後も変わらないため再変更も不要
- **`ando-seika-gas`（別リポジトリ）… `LINE通知.js` の `AI_ORDER_BOT_WEBHOOK_URL`**（現在 `https://ando-seika.vercel.app/api/line-order-webhook` とハードコードされている）を **`https://ando-seika.com/api/line-order-webhook`** に書き換える。GASはLINEで届いたメッセージをこのURLへ署名付きで中継しており、直さないとVercel Pause後にGAS経由のLINE注文botだけが気づかれずに止まる。**Vercelを止める前に必ず変更・動作確認すること。**

---

## 4. 注意点

### cron の二重実行

Cloudflare にデプロイした時点で cron は動き始める。Vercel 側を止めていないと
**同じジョブが2回走る**。`renewal-notifications`（更新通知メール）や
`line-order-reminder`（LINE通知）は顧客に届くため、二重送信になる。

→ Cloudflare デプロイ直後に Vercel プロジェクトを Pause するか、`vercel.json` の
`crons` を空にしてデプロイし直す。

### アップロード画像の互換性

シートには旧 Vercel Blob の URL と新 R2 の URL が混在する。
`cleanup-images` は URL の形を見て振り分けるようにしてあるので、
`COMPLAINT_READ_WRITE_TOKEN` は**1ヶ月間は残しておく**（TTLが30日のため）。
1ヶ月経てば旧URLは消えるので、その後 `@vercel/blob` 依存ごと削除してよい。

### Google API が全部空で返るとき（gzip 問題）

**症状**: ページは 200 で返るのに、商品一覧・在庫などが常に 0 件。
`wrangler tail` のエラーが文字化けした意味不明な文字列になる。

**原因**: `googleapis-common` は「ブラウザでなければ」必ず `Accept-Encoding: gzip` を付ける
（`node_modules/googleapis-common/build/src/apirequest.js`）。
一方 Cloudflare Workers は**呼び出し側が Accept-Encoding を明示した場合、自動展開せずそのまま通す**。
結果、gzip のまま返ったバイト列をライブラリがテキストとして解釈して例外になる。
エラーメッセージの先頭が `1f 8b 08`（gzip のマジックナンバー）になっていれば確定。

**対処**: `src/lib/googleFetch.ts` の `googleFetch` を各クライアント生成時に
`fetchImplementation` として渡す（`Accept-Encoding` を落として Workers の自動展開に任せる）。

```ts
sheetsApi({ version: "v4", auth, fetchImplementation: googleFetch })
```

**やってはいけない対処**:

- `globalThis.fetch` の差し替え … gaxios は Workers 上で `window` が無いと **node-fetch** を選ぶため効かない
  （`node_modules/gaxios/build/cjs/src/gaxios.js` の `#getFetch()`）
- `globalThis.window` を定義して「ブラウザ扱い」にする … `Accept-Encoding` は付かなくなるが、
  Next.js の SSR が「ブラウザで実行中」と誤認して広範囲に壊れる

**新しく Google API を呼ぶコードを足すときは、必ず `fetchImplementation: googleFetch` を付けること。**
付け忘れるとそのルートだけ静かに空を返す。

### スプレッドシートの対応（名前が直感と逆）

| 環境変数 | スプレッドシート名 | 中身 |
|---|---|---|
| `GOOGLE_SPREADSHEET_ID` | **安藤青果_注文台帳** | 商品在庫／注文管理／顧客マスタ／送料マスタ／ポイント履歴 ほか |
| `GOOGLE_SALES_SPREADSHEET_ID` | **オンライン販売** | 売上データ／（予約）洗い・根付・メロン・梨／商品マスタ／販売先マスタ |
| `LINE_ORDER_SPREADSHEET_ID` | LINE注文管理 | 大口注文／AIセッション／注文 ほか |

「オンライン販売」という名前だがサイトのメインDBではなく**売上・出荷管理**の方なので注意。
サイトのメインDBは「安藤青果_注文台帳」。

なお `安藤青果_統合DB` と `市場 R8年` はサービスアカウントに共有されておらず読めない（＝サイトは使っていない）。

**未作成のシート**: メインDBに「季節セール」シートが存在しない。
`fetchActiveSeasonalDiscountPercent()` は catch しているため実害は出ていないが、
季節セール機能を使う場合は作成が必要。

### ビルドが EPERM で失敗するとき（Windows）

`npm run cf:build` が次のエラーで落ちることがある。

```
Error: EPERM, Permission denied: \\?\C:\...\andoseika-site\.open-next
  at Module.initOutputDir
```

原因は **`wrangler dev` の子プロセスが生き残って `.open-next/assets` を掴んでいる**こと。
ターミナルで Ctrl+C しても、`node`（wrangler本体）と `workerd` が残ることがある。
OpenNext はビルド開始時に `.open-next` を丸ごと削除するため、掴まれていると必ず失敗する。

対処:

```powershell
Get-CimInstance Win32_Process -Filter "Name='node.exe' OR Name='workerd.exe'" |
  Select-Object ProcessId, CommandLine
# wrangler dev のものだけを Stop-Process -Id <PID> -Force
Remove-Item -Recurse -Force .open-next
```

`wrangler dev` を使った後は、次のビルド前に残プロセスを確認する習慣にしておくと安全。

### ISR

`revalidate` を使う4ルートは R2 インクリメンタルキャッシュのみ設定してある。
キュー（Durable Objects）とタグキャッシュ（D1）は未設定のため、
時間ベースの再検証はベストエフォート。残り60ルートは `force-dynamic` なので影響は小さい。
必要になったら `doQueue` + `d1NextTagCache` を追加する。

---

## 5. ロールバック

DNS を Vercel の A レコード（`216.198.79.1` / `64.29.17.1`）に戻すだけで復旧する。
Vercel プロジェクトは削除せず Pause に留めること。

---

## 6. 実測値（2026-08-27 時点）

`npx wrangler deploy --dry-run` の結果:

```
Total Upload: 16523.12 KiB / gzip: 3100.69 KiB
```

| 項目 | 値 |
|---|---|
| Worker スクリプト（gzip） | **3.03 MiB** |
| Cloudflare 無料プラン上限 | 3 MiB → **わずかに超過** |
| Cloudflare 有料プラン上限（$5/月） | 10 MiB → 余裕あり |
| 静的アセット | 617ファイル / 45MB（Assets バインディング経由・上限は別枠） |

**Workers 有料プランが必要。** 無料枠に収めたい場合は次の削減余地がある。

- `@googleapis/drive`（展開後2.5MB）は2ファイルでしか使っていない → REST 直叩きに置き換え
- `openai` と `@anthropic-ai/sdk` が両方バンドルされている → どちらかを REST 直叩きに置き換え

なお `googleapis`（展開後212MB）を `@googleapis/*` に置き換える前は、この上限を
大幅に超えていて移行自体が成立しなかった。
