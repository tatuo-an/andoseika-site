import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        // apiVersion: "2024-11-20.acacia", // Let library use default
    })
    : null;

type CartItem = {
    name: string;
    image: string;
    price: number;
    quantity: number;
};

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
        const { cartDetails } = body as { cartDetails?: Record<string, CartItem> };

        if (!cartDetails) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        const baseUrl = getBaseUrl(req);
        const legalDisclosureUrl = new URL("/tokusho", baseUrl).toString();

        const line_items = Object.values(cartDetails).map((item) => {
            return {
                price_data: {
                    currency: "jpy",
                    product_data: {
                        name: item.name,
                        images: [
                            item.image.startsWith("http")
                                ? item.image
                                : new URL(item.image, baseUrl).toString(),
                        ],
                    },
                    unit_amount: item.price,
                },
                quantity: item.quantity,
            };
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items,
            mode: "payment",
            success_url: `${baseUrl}/success`,
            cancel_url: `${baseUrl}/cancel`,
            shipping_address_collection: {
                allowed_countries: ["JP"],
            },
            custom_text: {
                submit: {
                    message:
                        "ご注文前に、特定商取引法に基づく表示・返品交換条件をご確認ください。",
                },
            },
            metadata: {
                legalDisclosureUrl,
                source: "ando-seika-store",
            },
            payment_intent_data: {
                metadata: {
                    legalDisclosureUrl,
                    source: "ando-seika-store",
                },
            },
        });

        return NextResponse.json({ sessionId: session.id });
    } catch (err: unknown) {
        console.error(err);
        const message = err instanceof Error ? err.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
