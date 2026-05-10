import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const PLANS = {
    light: {
        name: "農家サポーター【ライト】（梅） 年会費",
        description: "通常購入5%OFF ／ 年2回の届け物（春：干し芋+はちみつ、秋：甘酢らっきょう）",
        price: 3000,
    },
    standard: {
        name: "農家サポーター【スタンダード】（竹） 年会費",
        description: "通常購入10%OFF ／ 年2回の届け物（春：干し芋+はちみつ、秋：甘酢らっきょう+訳あり梨2個）",
        price: 5000,
    },
    premium: {
        name: "農家サポーター【プレミアム】（松） 年会費",
        description: "通常購入15%OFF・優先予約権 ／ 年2回の届け物（春：干し芋+はちみつ、秋：甘酢らっきょう+梨3kg箱）",
        price: 10000,
    },
} as const;

type PlanKey = keyof typeof PLANS;

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;

function getBaseUrl(req: NextRequest) {
    return (
        req.headers.get("origin") ||
        process.env.NEXT_PUBLIC_URL ||
        new URL(req.url).origin
    );
}

export async function POST(req: NextRequest) {
    try {
        if (!stripe) {
            throw new Error("Stripe is not configured");
        }

        const body = await req.json();
        const { plan } = body as { plan: PlanKey };

        if (!plan || !PLANS[plan]) {
            return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
        }

        const selectedPlan = PLANS[plan];
        const baseUrl = getBaseUrl(req);
        const legalDisclosureUrl = new URL("/tokusho", baseUrl).toString();

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "jpy",
                        product_data: {
                            name: selectedPlan.name,
                            description: selectedPlan.description,
                        },
                        unit_amount: selectedPlan.price,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            // 住所・電話番号を収集（発送のため）
            shipping_address_collection: {
                allowed_countries: ["JP"],
            },
            phone_number_collection: { enabled: true },
            // 確認メールに表示するメモ
            custom_text: {
                submit: {
                    message:
                        "ご入会前に、特定商取引法に基づく表示・返金条件をご確認ください。登録完了メールをお送りします。",
                },
            },
            metadata: {
                plan,
                planName: selectedPlan.name,
                legalDisclosureUrl,
                source: "ando-seika-supporter",
            },
            payment_intent_data: {
                metadata: {
                    plan,
                    planName: selectedPlan.name,
                    legalDisclosureUrl,
                    source: "ando-seika-supporter",
                },
            },
            success_url: `${baseUrl}/supporter/success?plan=${plan}`,
            cancel_url: `${baseUrl}/supporter`,
        });

        return NextResponse.json({ url: session.url });
    } catch (err: unknown) {
        console.error("Supporter checkout error:", err);
        const message = err instanceof Error ? err.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
