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
        const { cartDetails, quote } = body as {
            cartDetails?: Record<string, CartItem & { cost?: number | null }>;
            quote?: {
                matchedVariantId: string | null;
                matchedVariantName: string | null;
                itemsTotal: number;
                baseShipFee: number;
                profit: number;
                surcharge: number;
                surchargeLabel: string | null;
            };
        };

        if (!cartDetails) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        const baseUrl = getBaseUrl(req);
        const legalDisclosureUrl = new URL("/tokusho", baseUrl).toString();
        const cartArr = Object.values(cartDetails);
        const toAbsoluteUrl = (img: string) => img.startsWith("http") ? img : new URL(img, baseUrl).toString();

        type LI = { price_data: { currency: string; product_data: { name: string; images: string[] }; unit_amount: number }; quantity: number };
        const line_items: LI[] = [];

        if (quote) {
            if (quote.matchedVariantId) {
                const firstImg = cartArr[0]?.image;
                line_items.push({
                    price_data: {
                        currency: "jpy",
                        product_data: { name: quote.matchedVariantName ?? "商品", images: firstImg ? [toAbsoluteUrl(firstImg)] : [] },
                        unit_amount: quote.itemsTotal,
                    },
                    quantity: 1,
                });
            } else {
                for (const item of cartArr) {
                    const unitAmount = item.cost ?? item.price;
                    line_items.push({
                        price_data: {
                            currency: "jpy",
                            product_data: { name: item.name, images: [toAbsoluteUrl(item.image)] },
                            unit_amount: unitAmount,
                        },
                        quantity: item.quantity,
                    });
                }
                if (quote.baseShipFee > 0) {
                    line_items.push({ price_data: { currency: "jpy", product_data: { name: "送料", images: [] }, unit_amount: quote.baseShipFee }, quantity: 1 });
                }
                if (quote.profit > 0) {
                    line_items.push({ price_data: { currency: "jpy", product_data: { name: "サービス料", images: [] }, unit_amount: quote.profit }, quantity: 1 });
                }
            }
            if (quote.surcharge > 0) {
                line_items.push({
                    price_data: {
                        currency: "jpy",
                        product_data: { name: quote.surchargeLabel ?? "追加送料", images: [] },
                        unit_amount: quote.surcharge,
                    },
                    quantity: 1,
                });
            }
        } else {
            for (const item of cartArr) {
                line_items.push({
                    price_data: {
                        currency: "jpy",
                        product_data: { name: item.name, images: [toAbsoluteUrl(item.image)] },
                        unit_amount: item.price,
                    },
                    quantity: item.quantity,
                });
            }
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items,
            mode: "payment",
            success_url: `${baseUrl}/success`,
            cancel_url: `${baseUrl}/cancel`,
            shipping_address_collection: {
                allowed_countries: ["JP"],
            },
            phone_number_collection: {
                enabled: true,
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

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (err: unknown) {
        console.error(err);
        const message = err instanceof Error ? err.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
