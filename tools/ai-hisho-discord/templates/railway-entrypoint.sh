#!/bin/sh
# Railwayコンテナの起動スクリプト。
# 環境変数（Railwayの管理画面で設定する）から config.json とトークンファイルを組み立ててから
# ブリッジ本体（bridge.mjs）を起動する。
#
# 必要な環境変数:
#   DISCORD_BOT_TOKEN   ... Botのトークン
#   AI_HISHO_GUILD_ID   ... サーバーID
#   AI_HISHO_CHANNEL_IDS... チャンネルID（カンマ区切り。複数可）
#   AI_HISHO_USER_ID    ... 許可するユーザーのDiscordユーザーID
#   AI_HISHO_USER_NAME  ... そのユーザーの呼び名（任意）
#   AI_HISHO_SECRETARY_NAME ... 秘書の名前（任意・既定「AI秘書」）
#   ANTHROPIC_API_KEY   ... claude CLIが読む（claude CLI自身が自動で見る）

set -e

mkdir -p /root/.config/ai-hisho
echo -n "$DISCORD_BOT_TOKEN" > /root/.config/ai-hisho/bot-token
chmod 600 /root/.config/ai-hisho/bot-token

# channelIdsをJSON配列文字列へ変換（カンマ区切り → ["a","b"]）
CHANNEL_IDS_JSON=$(echo "$AI_HISHO_CHANNEL_IDS" | awk -F',' '{
  printf "["
  for (i=1;i<=NF;i++){ printf "\"%s\"", $i; if(i<NF) printf "," }
  printf "]"
}')

cat > /root/.config/ai-hisho/config.json <<EOF
{
  "guildId": "${AI_HISHO_GUILD_ID}",
  "channelIds": ${CHANNEL_IDS_JSON},
  "allowedUsers": [{ "id": "${AI_HISHO_USER_ID}", "name": "${AI_HISHO_USER_NAME:-}" }],
  "secretaryName": "${AI_HISHO_SECRETARY_NAME:-AI秘書}",
  "workdir": "/app",
  "timeoutMs": 300000,
  "sessionId": "$(node -e 'console.log(crypto.randomUUID())')"
}
EOF
chmod 600 /root/.config/ai-hisho/config.json

exec node bridge.mjs
