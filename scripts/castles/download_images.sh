#!/usr/bin/env bash
# 全国の城 図鑑（/castles）の写真を Wikimedia Commons から手元に一括ダウンロードする。
#
# 使い方（ネットに出られる手元のPCで実行）:
#   bash scripts/castles/download_images.sh            # 幅1600pxで public/images/castles/<slug>/ に保存
#   WIDTH=2400 bash scripts/castles/download_images.sh # 幅を変える
#
# 保存先: public/images/castles/<slug>/<連番>-<role>.jpg
# あわせて public/images/castles/<slug>/CREDITS.txt に出典ページURLを書き出す。
# ダウンロード後、src/data/castles/images.ts の LOCAL_OVERRIDES にパスを登録すると
# Commons ではなくローカル写真が優先表示される（サイトを外部配信に依存させたくない場合）。
set -euo pipefail
cd "$(dirname "$0")/../.."

WIDTH="${WIDTH:-1600}"
JSON="src/data/castles/commons-images.json"
OUT="public/images/castles"

command -v node >/dev/null || { echo "node が必要です"; exit 1; }
command -v curl >/dev/null || { echo "curl が必要です"; exit 1; }

node -e '
const j = require(process.argv[1]);
for (const [slug, imgs] of Object.entries(j)) {
  imgs.forEach((im, i) => console.log([slug, i + 1, im.role, im.file].join("\t")));
}' "$JSON" | while IFS=$'\t' read -r slug idx role file; do
  dir="$OUT/$slug"
  mkdir -p "$dir"
  enc="$(node -e 'console.log(encodeURIComponent(process.argv[1].replace(/ /g, "_")))' "$file")"
  url="https://commons.wikimedia.org/wiki/Special:FilePath/${enc}?width=${WIDTH}"
  dest="$dir/$(printf '%02d' "$idx")-${role}.jpg"
  if [ -s "$dest" ]; then
    echo "skip  $dest"
  else
    echo "get   $slug / $file"
    if ! curl -fsSL -A "andoseika-castles-guide/1.0 (contact: site owner)" -o "$dest" "$url"; then
      echo "  !! 取得失敗: $file" >&2
      rm -f "$dest"
    fi
  fi
  echo "${idx}-${role}: https://commons.wikimedia.org/wiki/File:${enc}" >> "$dir/CREDITS.txt.tmp"
done

# CREDITS.txt を重複なしで確定
for d in "$OUT"/*/; do
  [ -f "$d/CREDITS.txt.tmp" ] || continue
  sort -u "$d/CREDITS.txt.tmp" > "$d/CREDITS.txt"
  rm -f "$d/CREDITS.txt.tmp"
done
echo "done -> $OUT"
