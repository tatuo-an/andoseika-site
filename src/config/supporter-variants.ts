export type SupporterFirstViewVariantId = "1" | "2" | "3";

export type SupporterFirstViewVariant = {
    id: SupporterFirstViewVariantId;
    image: string;
    alt: string;
    eyebrow: string;
    titleLines: string[];
    descriptionLines: string[];
    ctaLabel: string;
};

export const supporterFirstViewVariants: Record<
    SupporterFirstViewVariantId,
    SupporterFirstViewVariant
> = {
    "1": {
        id: "1",
        image: "/supporter/hero/hero-v1.jpg",
        alt: "安藤青果の農家サポーター制度のファーストビュー案1",
        eyebrow: "Farmer Supporter Program",
        titleLines: [
            "ただ野菜を買うだけの",
            "生活から農家とつながる",
            "やさしい暮らしへ。",
        ],
        descriptionLines: [
            "年会費3,000円〜で「親戚の農家」ができる。",
            "安藤青果の農家サポーター制度「住民票」",
        ],
        ctaLabel: "プランを見る",
    },
    "2": {
        id: "2",
        image: "/supporter/hero/hero-v2.jpg",
        alt: "安藤青果の農家サポーター制度のファーストビュー案2",
        eyebrow: "Seasonal Gift from Tottori",
        titleLines: [
            "年に2回、鳥取の畑から",
            "旬のおいしい仕送りが",
            "あなたの食卓へ届きます。",
        ],
        descriptionLines: [
            "春と秋の届け物に、いつものお買い物割引も。",
            "たっちゃんが選ぶ旬を楽しむサポーター制度です。",
        ],
        ctaLabel: "届け物を見る",
    },
    "3": {
        id: "3",
        image: "/supporter/hero/hero-v3.jpg",
        alt: "安藤青果の農家サポーター制度のファーストビュー案3",
        eyebrow: "Join Ando Seika",
        titleLines: [
            "鳥取の畑に、",
            "あなたのもうひとつの実家を",
            "つくりませんか。",
        ],
        descriptionLines: [
            "顔が見える農家を応援しながら、旬の味覚を受け取る。",
            "安藤青果の「住民」になるための年会費プランです。",
        ],
        ctaLabel: "住民票プランを見る",
    },
};

export function getSupporterFirstViewVariant(
    fv: string | string[] | undefined,
): SupporterFirstViewVariant {
    const variantId = Array.isArray(fv) ? fv[0] : fv;

    if (variantId === "2" || variantId === "3") {
        return supporterFirstViewVariants[variantId];
    }

    return supporterFirstViewVariants["1"];
}
