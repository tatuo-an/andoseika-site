export const BASIC_MEDIA = ["Facebook", "Instagram", "Threads"] as const;
export const EXTRA_MEDIA = "X・Threads・Instagram・TikTok・YouTube・Facebook・ブログ・LINE配信";
export const SNS_PLANS = [
  { key: "light", name: "ライト", price: "3万円", total: 3, additional: 0, frequency: "1日1投稿", media: "基本3媒体" },
  { key: "standard", name: "スタンダード", price: "5万円", total: 2, additional: 0, frequency: "1日1投稿", media: "好きな媒体を2つ" },
  { key: "full", name: "おまかせフル", price: "10万円", total: 4, additional: 0, frequency: "1日2投稿", media: "好きな媒体を4つ" },
] as const;
