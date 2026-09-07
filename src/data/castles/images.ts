import type { CastleImage } from "./types";
import commons from "./commons-images.json";

/**
 * Wikimedia Commons の写真リスト（src/data/castles/commons-images.json）。
 *
 * - キー: 城のスラッグ
 * - file: Commons のファイル名（"File:" なし、スペースはスペースのまま）
 * - role: exterior（天守外観）/ detail（石垣・門・内部）/ alt（別アングル）
 * - note: 検索時に確認できた説明（英語のメモ。表示には使わない）
 *
 * 写真を差し替えたい場合は JSON の file を書き換えるか、
 * 手元の写真を public/images/castles/<slug>/ に置いて LOCAL_OVERRIDES に登録する。
 */
type CommonsEntry = { role: "exterior" | "detail" | "alt"; file: string; note?: string };
const COMMONS = commons as Record<string, CommonsEntry[]>;

const ROLE_CAPTION: Record<CommonsEntry["role"], string> = {
  exterior: "天守（外観）",
  detail: "石垣・門・城内のようす",
  alt: "天守（別アングル）",
};

/**
 * 手元の写真で置き換える場合はここに追加する（commons より優先して先頭に表示）。
 * 例: himeji: [{ local: "/images/castles/himeji/01.jpg", caption: "大天守を三の丸から", credit: "撮影: 安藤" }]
 */
export const LOCAL_OVERRIDES: Record<string, CastleImage[]> = {};

/** Commons のファイル名 → 配信 URL（Special:FilePath はファイル本体へリダイレクトする） */
export function commonsFileUrl(file: string, width = 1280): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file.replace(/ /g, "_"))}?width=${width}`;
}

/** Commons のファイル名 → ファイル説明ページ URL（ライセンス・撮影者の確認用） */
export function commonsPageUrl(file: string): string {
  return `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, "_"))}`;
}

/** 城ごとの写真配列を返す（ローカル写真 → Commons の順） */
export function commonsImages(slug: string): CastleImage[] {
  const local = LOCAL_OVERRIDES[slug] ?? [];
  const remote = (COMMONS[slug] ?? []).map<CastleImage>((e) => ({
    commons: e.file,
    caption: ROLE_CAPTION[e.role],
    credit: "Wikimedia Commons",
  }));
  return [...local, ...remote];
}

/** 表示用 URL を解決する */
export function imageSrc(img: CastleImage, width = 1280): string | null {
  if (img.local) return img.local;
  if (img.commons) return commonsFileUrl(img.commons, width);
  return null;
}
