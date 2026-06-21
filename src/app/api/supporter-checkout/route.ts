import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";
import { TIERS, type TierKey } from "@/lib/tiers";

const PLANS: Record<Exclude<TierKey, "free">, { name: string; description: string }> = {
    mebuking: {
        name: "芽吹きサポーター 年会費",
        description: "通常商品3%OFF／ログインボーナス2pt／誕生日ボーナス500pt／限定商品アクセス",
    },
    minori: {
        name: "実りサポーター 年会費",
        description: "通常商品5%OFF／ログインボーナス3pt／誕生日ボーナス1,500pt／限定商品アクセス",
    },
    partner: {
        name: "農園パートナー 年会費",
        description: "通常商品8%OFF／ログインボーナス5pt／誕生日ボーナス3,000pt／限定商品アクセス",
    },
};

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

        const session = await auth();
        const userEmail = session?.user?.email ?? "";

        const body = await req.json();
        const { plan } = body as { plan: PlanKey };

        if (!plan || !PLANS[plan]) {
            return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
        }

        const selectedPlan = PLANS[plan];
        const price = TIERS[plan].price;
        const baseUrl = getBaseUrl(req);
        const legalDisclosureUrl = new URL("/tokusho", baseUrl).toString();

        const stripeSession = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "jpy",
                        product_data: {
                            name: selectedPlan.name,
                            description: selectedPlan.description,
                        },
                        unit_amount: price,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            shipping_address_collection: { allowed_countries: ["JP"] },
            phone_number_collection: { enabled: true },
            custom_text: {
                submit: {
                    message: "ご入会前に、特定商取引法に基づく表示・返金条件をご確認ください。",
                },
            },
            metadata: {
                plan,
                planName: selectedPlan.name,
                legalDisclosureUrl,
                source: "ando-seika-supporter",
                userEmail,
            },
            payment_intent_data: {
                metadata: {
                    plan,
                    planName: selectedPlan.name,
                    legalDisclosureUrl,
                    source: "ando-seika-supporter",
                    userEmail,
                },
            },
            success_url: `${baseUrl}/supporter/success?plan=${plan}`,
            cancel_url: `${baseUrl}/supporter`,
        });

        return NextResponse.json({ url: stripeSession.url });
    } catch (err: unknown) {
        console.error("Supporter checkout error:", err);
        const message = err instanceof Error ? err.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
