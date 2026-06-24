export const TIERS = {
  free:     { name: "一般会員",         price: 0,     loginPt: 1, birthdayPt: 0,    discountRate: 0    },
  mebuking: { name: "芽吹きサポーター", price: 3000,  loginPt: 2, birthdayPt: 500,  discountRate: 0.03 },
  minori:   { name: "実りサポーター",   price: 5000,  loginPt: 3, birthdayPt: 1000, discountRate: 0.05 },
  partner:  { name: "農園パートナー",   price: 10000, loginPt: 5, birthdayPt: 2000, discountRate: 0.08 },
} as const;

export type TierKey = keyof typeof TIERS;

export function getTier(key: string | undefined | null): TierKey {
  if (key && key in TIERS) return key as TierKey;
  return "free";
}
