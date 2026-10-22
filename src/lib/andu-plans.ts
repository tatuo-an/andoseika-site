export const BASIC_MEDIA = ["Facebook", "Instagram", "Threads"] as const;
export const EXTRA_MEDIA = "X・YouTube・ブログ・TikTok・LinkedIn・LINE配信など";
export const SNS_PLANS = [
  { key: "light", name: "ライト", price: "3万円", total: 3, additional: 0, frequency: "1日1投稿", media: "基本3媒体" },
  { key: "standard", name: "スタンダード", price: "5万円", total: 5, additional: 2, frequency: "1日1投稿", media: "ライトの3媒体＋希望2媒体" },
  { key: "full", name: "おまかせフル", price: "10万円", total: 10, additional: 7, frequency: "1日2投稿", media: "基本3媒体＋希望最大7媒体" },
] as const;
