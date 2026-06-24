// 商品の追加説明フィールド（商品在庫!AA 列に JSON 文字列として保存）

export const EXTRA_FIELDS = [
  { key: "feature",     label: "特徴" },
  { key: "sizeNote",    label: "個数・本数・サイズの補足" },
  { key: "storage",     label: "保存方法" },
  { key: "recommended", label: "おすすめの食べ方" },
  { key: "notes",       label: "注意事項" },
  { key: "handling",    label: "到着後の取り扱い" },
  { key: "imperfect",   label: "訳あり商品の説明" },
] as const;

export type ExtraFieldKey = typeof EXTRA_FIELDS[number]["key"];

export type ExtraDescriptions = Partial<Record<ExtraFieldKey, string>>;

export function parseExtra(raw: string | undefined | null): ExtraDescriptions {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      const out: ExtraDescriptions = {};
      for (const { key } of EXTRA_FIELDS) {
        const v = parsed[key];
        if (typeof v === "string" && v.trim()) out[key] = v;
      }
      return out;
    }
  } catch { /* invalid JSON, treat as empty */ }
  return {};
}

export function serializeExtra(extra: ExtraDescriptions): string {
  const filtered: ExtraDescriptions = {};
  for (const { key } of EXTRA_FIELDS) {
    const v = extra[key];
    if (typeof v === "string" && v.trim()) filtered[key] = v.trim();
  }
  if (Object.keys(filtered).length === 0) return "";
  return JSON.stringify(filtered);
}

export function labelFor(key: ExtraFieldKey): string {
  return EXTRA_FIELDS.find((f) => f.key === key)?.label ?? key;
}
