import type { Castle, CastleCategory } from "./types";
import { CATEGORY_ORDER, CATEGORY_LABEL } from "./types";
import { GENZON } from "./genzon";
import { FUKUGEN_MOKUZO } from "./fukugen-mokuzo";
import { FUKUGEN_GAIKAN } from "./fukugen-gaikan";
import { FUKKO } from "./fukko";
import { MOGI_EAST } from "./mogi-east";
import { MOGI_WEST } from "./mogi-west";

export * from "./types";
export { commonsFileUrl, commonsPageUrl, imageSrc } from "./images";

/** 都道府県コード → 都道府県名（並び順の基準） */
const PREF_NAMES: Record<number, string> = {
  1: "北海道", 2: "青森県", 3: "岩手県", 4: "宮城県", 5: "秋田県", 6: "山形県", 7: "福島県",
  8: "茨城県", 9: "栃木県", 10: "群馬県", 11: "埼玉県", 12: "千葉県", 13: "東京都", 14: "神奈川県",
  15: "新潟県", 16: "富山県", 17: "石川県", 18: "福井県", 19: "山梨県", 20: "長野県", 21: "岐阜県",
  22: "静岡県", 23: "愛知県", 24: "三重県", 25: "滋賀県", 26: "京都府", 27: "大阪府", 28: "兵庫県",
  29: "奈良県", 30: "和歌山県", 31: "鳥取県", 32: "島根県", 33: "岡山県", 34: "広島県", 35: "山口県",
  36: "徳島県", 37: "香川県", 38: "愛媛県", 39: "高知県", 40: "福岡県", 41: "佐賀県", 42: "長崎県",
  43: "熊本県", 44: "大分県", 45: "宮崎県", 46: "鹿児島県", 47: "沖縄県",
};

/** 地方区分（目次の見出し用） */
export function regionOf(prefCode: number): string {
  if (prefCode === 1) return "北海道";
  if (prefCode <= 7) return "東北";
  if (prefCode <= 14) return "関東";
  if (prefCode <= 20 || prefCode === 21 || prefCode === 22 || prefCode === 23) return prefCode >= 21 ? "中部（東海）" : "中部（北陸・甲信越）";
  if (prefCode <= 30) return "近畿";
  if (prefCode <= 35) return "中国";
  if (prefCode <= 39) return "四国";
  return "九州";
}

function sortByPref(list: Castle[]): Castle[] {
  return [...list].sort((a, b) => a.prefCode - b.prefCode || a.name.localeCompare(b.name, "ja"));
}

/** 全城（掲載順: 種別 → 都道府県コード） */
export const ALL_CASTLES: Castle[] = [
  ...sortByPref(GENZON),
  ...sortByPref(FUKUGEN_MOKUZO),
  ...sortByPref(FUKUGEN_GAIKAN),
  ...sortByPref(FUKKO),
  ...sortByPref([...MOGI_EAST, ...MOGI_WEST]),
];

export function castlesByCategory(category: CastleCategory): Castle[] {
  return ALL_CASTLES.filter((c) => c.category === category);
}

/** 種別 → 都道府県 → 城 の階層構造（目次・本文の章立て） */
export type CategorySection = {
  category: CastleCategory;
  label: (typeof CATEGORY_LABEL)[CastleCategory];
  prefectures: { prefCode: number; prefecture: string; region: string; castles: Castle[] }[];
};

export function buildSections(): CategorySection[] {
  return CATEGORY_ORDER.map((category) => {
    const list = castlesByCategory(category);
    const map = new Map<number, Castle[]>();
    for (const c of list) {
      if (!map.has(c.prefCode)) map.set(c.prefCode, []);
      map.get(c.prefCode)!.push(c);
    }
    return {
      category,
      label: CATEGORY_LABEL[category],
      prefectures: [...map.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([prefCode, castles]) => ({
          prefCode,
          prefecture: PREF_NAMES[prefCode] ?? castles[0].prefecture,
          region: regionOf(prefCode),
          castles,
        })),
    };
  });
}

export function getCastle(slug: string): Castle | undefined {
  return ALL_CASTLES.find((c) => c.slug === slug);
}

/** 前後の城（本のページ送り用） */
export function neighbors(slug: string): { prev?: Castle; next?: Castle } {
  const i = ALL_CASTLES.findIndex((c) => c.slug === slug);
  return { prev: i > 0 ? ALL_CASTLES[i - 1] : undefined, next: i >= 0 && i < ALL_CASTLES.length - 1 ? ALL_CASTLES[i + 1] : undefined };
}

/** 通しページ番号（1始まり） */
export function pageNumber(slug: string): number {
  return ALL_CASTLES.findIndex((c) => c.slug === slug) + 1;
}
