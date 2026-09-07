/**
 * 全国の城 図鑑（/castles）用のデータ型。
 *
 * 掲載方針:
 *  - 天守（または天守代用の櫓）が現地に建っている城のみ。石垣・堀だけの城跡は対象外。
 *  - 分類は「天守の種別」（現存 → 木造復元 → 外観復元 → 復興 → 模擬）を最上位にし、
 *    その中を都道府県コード（北→南）順に並べる。
 */

/** 天守の種別（掲載順） */
export type CastleCategory =
  | "genzon" // 現存天守（江戸時代以前の建物がそのまま残る）
  | "fukugen-mokuzo" // 木造復元天守（史料に基づき木造で再建）
  | "fukugen-gaikan" // 外観復元天守（外観は史料どおり・内部はRC造など）
  | "fukko" // 復興天守（天守があった場所に、史料と異なる姿で再建）
  | "mogi"; // 模擬天守（天守が無かった／不明な場所に建てた観光用の天守）

export const CATEGORY_ORDER: CastleCategory[] = [
  "genzon",
  "fukugen-mokuzo",
  "fukugen-gaikan",
  "fukko",
  "mogi",
];

export const CATEGORY_LABEL: Record<CastleCategory, { name: string; sub: string; description: string }> = {
  genzon: {
    name: "現存12天守",
    sub: "Original Keeps",
    description:
      "江戸時代以前に建てられた天守が、解体されずに今も建っている12城。国宝5城（松本・犬山・彦根・姫路・松江）と重要文化財7城。",
  },
  "fukugen-mokuzo": {
    name: "木造復元天守",
    sub: "Wooden Reconstructions",
    description:
      "古写真・図面などの史料に基づき、当時の姿を木造で忠実に再建した天守・櫓。平成以降に建てられたものが多い。",
  },
  "fukugen-gaikan": {
    name: "外観復元天守",
    sub: "Exterior Reconstructions",
    description:
      "外観は史料どおりに再現しつつ、構造は鉄筋コンクリートなど現代工法で再建した天守。多くが戦災で焼失した天守を昭和30年代に再建したもの。",
  },
  fukko: {
    name: "復興天守",
    sub: "Rebuilt Keeps",
    description:
      "天守があった場所に再建されたが、史料不足などで規模・意匠が当時と異なる天守。歴史的な天守の「面影」を伝える存在。",
  },
  mogi: {
    name: "模擬天守",
    sub: "Simulated Keeps",
    description:
      "もともと天守が無かった、あるいは姿が不明な城に、観光・郷土博物館などの目的で建てられた天守。城の歴史そのものは本物で、資料館として使われている例が多い。",
  },
};

/** 写真1枚。src は Wikimedia Commons のファイル名 or /public 配下のパス */
export type CastleImage = {
  /**
   * Wikimedia Commons のファイル名（"File:" は付けない）。
   * 表示時に Special:FilePath 経由で配信 URL に変換する。
   */
  commons?: string;
  /** 手元の写真を使う場合の /public 配下パス（例: /images/castles/himeji/01.jpg）。commons より優先 */
  local?: string;
  /** キャプション（写っているもの） */
  caption: string;
  /** 撮影者・出典メモ（Commonsの場合は自動でリンクを付けるので空でも可） */
  credit?: string;
};

/** 城主の変遷 1行 */
export type LordEntry = {
  /** 期間（例: "1601–1609", "1609–1871"） */
  period: string;
  /** 城主・大名家（例: "池田輝政（池田家）"） */
  lord: string;
  /** 補足（例: "52万石", "姫路藩初代"） */
  note?: string;
};

/** 年表 1行 */
export type TimelineEntry = {
  /** 西暦（数値。表示は "1609年" のように） */
  year: number;
  /** 和暦などの補足（例: "慶長14年"） */
  era?: string;
  /** 出来事 */
  event: string;
};

export type Castle = {
  /** URL 用スラッグ（英小文字・ハイフン） */
  slug: string;
  /** 城名 */
  name: string;
  /** 読み */
  reading: string;
  /** 別名（複数可） */
  aliases?: string[];
  category: CastleCategory;
  /** 都道府県コード（JIS X 0401, 1=北海道 … 47=沖縄）。並び順に使う */
  prefCode: number;
  /** 都道府県名 */
  prefecture: string;
  /** 所在市町村 */
  city: string;
  /** 天守の一言データ（例: "五重六階・地下一階、国宝"） */
  keepSpec: string;
  /** 現在の天守が建った（完成した）年。現存天守は建築年 */
  keepBuiltYear: number;
  /** 文化財指定・世界遺産など */
  designation?: string;
  /** 現在の用途（資料館・博物館・公園など） */
  currentUse: string;
  /** 冒頭の要約 2–3文 */
  summary: string;
  /** 歴代城主の変遷（初代 → 最終） */
  lords: LordEntry[];
  /** 年表 */
  timeline: TimelineEntry[];
  /** 歴史・経緯（焼失・倒壊・復元の経緯を含む）段落配列 */
  history: string[];
  /** 写真 */
  images: CastleImage[];
  /** 参考リンク（公式サイト・Wikipedia など） */
  references?: { label: string; url: string }[];
};
