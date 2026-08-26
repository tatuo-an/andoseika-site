---
title: パソコンをつけっぱなしにしたくない人向け（Railway編）
date: 2026-08-24
purpose: PC非依存でAI秘書を常駐させたい読者向けの別ルート案内
---

# これは何のための章か

`SETUP_FOR_AI.md` の標準手順は、**あなたのパソコンの中で**AI秘書を動かします。
パソコンの電源を切ると、AI秘書も止まります。

この章は、パソコンの代わりに「Railway（レールウェイ）」という、ずっと起きている小さなサーバーを借りて、そこでAI秘書を動かす方法の案内です。

## Railwayとは

インターネット上に小さなコンピューターを借りられるサービスです。有料ですが、24時間365日、あなたのパソコンとは無関係に動き続けます。

## 料金の目安

2026年8月時点の調査では、いちばん安い「Hobbyプラン」が**月5ドル（約750円、レート次第）**です。この5ドルの中に、使った分のコンピューター代（月5ドル分まで）が含まれており、それを超えて使うと追加料金がかかります。個人が1つのBotを動かす程度の使い方であれば、多くの場合は月5ドルの範囲に収まると見込まれますが、断言はできません（実際に動かしてみないと分かりません）。

出典: [Railway Pricing & Plans (SaaSworthy)](https://www.saasworthy.com/product/railway-app/pricing)、[Railway Pricing Calculator](https://makerkit.dev/pricing-calculator/railway)

## 必ず知っておいてほしい注意点（3つ）

### ①手元のパソコンのファイルは読めません

Railway上で動くAI秘書は、**あなたのパソコンの中にあるファイル（Obsidianのメモ、デスクトップのファイル等）を直接読むことができません。** パソコンの中で完結する作業（ファイル整理・ローカルの資料参照など）をお願いしたい場合は、標準の「パソコンで常駐」を選んでください。Railway版は「外から調べ物を頼む・下書きを作ってもらう」といった、パソコンのファイルに依存しない用途に向いています。

### ②頭脳の呼び出し方が変わり、追加の料金がかかります

パソコンで動かす場合は、あなたが契約しているClaudeの定額プランのままAIを呼び出せます。
Railway上で動かす場合は、定額プランではなく「Anthropic APIキー」という、**使った分だけ払う従量課金**の仕組みに切り替わります。

目安として、ちょっとした調べ物・下書き作成のやり取りを1日に数回する程度であれば、月あたり数百円〜数千円程度に収まることが多いですが、やり取りの量や内容によって変わります。使いすぎを防ぐため、Anthropicのコンソール画面で利用上限額を設定しておくことを強くおすすめします。

### ③この章の手順は机上設計であり、実機での動作確認をしていません

`SETUP_FOR_AI.md`の手順は実際に動かして確認済みですが、この章（Railwayへのデプロイ）は、キット制作の時点ではまだ実際のRailway環境にデプロイして確認していません。**初めて試す際は、うまくいかない箇所が出てくる前提で、コミュニティ内で質問しながら進めることをおすすめします。**

---

## 手順の概要

### 人間（あなた）がやること

1. https://railway.com でアカウントを作成する
2. Hobbyプラン（月5ドル）の支払い方法（クレジットカード）を登録する
3. https://console.anthropic.com でAnthropic APIキーを発行する（Claudeにログインしているアカウントとは別に、支払い方法の登録が必要な場合があります）
4. 利用上限額（Usage limit）を設定する（安全のため）

### AI（このキットを読んでいるあなた）がやること

1. `templates/Dockerfile.railway.template` と `templates/railway-entrypoint.sh` を使い、Railway用のプロジェクトを組み立てる
2. Railway CLI（`railway` コマンド）をインストールし、`railway login` → `railway init` → `railway up` の流れでデプロイする
3. Railwayの管理画面（またはCLI）で、次の環境変数を設定する:
   - `DISCORD_BOT_TOKEN` … `SETUP_FOR_AI.md`手順2で取得したトークン
   - `ANTHROPIC_API_KEY` … 上記で発行したAPIキー
   - `AI_HISHO_GUILD_ID` / `AI_HISHO_CHANNEL_IDS` / `AI_HISHO_USER_ID` / `AI_HISHO_USER_NAME` / `AI_HISHO_SECRETARY_NAME` … `SETUP_FOR_AI.md`手順4・5と同じ値
4. デプロイ後、Discordの指定チャンネルに起動メッセージが届くか確認する
5. うまくいかない場合は、Railwayの管理画面の「Logs（ログ）」を確認し、エラー内容から原因を調べる

## 参考にした情報

- [Railway Pricing Plans (公式ドキュメント)](https://docs.railway.com/pricing/plans)
- [Claude Code Headless Mode: The Complete Self-Hosting Guide](https://amux.io/guides/claude-code-headless/)
