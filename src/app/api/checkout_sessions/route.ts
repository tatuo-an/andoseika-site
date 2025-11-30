import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        // apiVersion: "2024-11-20.acacia", // Let library use default
    })
    : null;

export async function POST(req: NextRequest) {
    try {
        if (!stripe) {
            throw new Error("Stripe is not configured");
        }

        const body = await req.json();
        const { cartDetails } = body;

        if (!cartDetails) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        const line_items = Object.values(cartDetails).map((item: any) => {
            return {
                price_data: {
                    currency: "jpy",
                    product_data: {
                        name: item.name,
                        images: [item.image.startsWith("http") ? item.image : `${process.env.NEXT_PUBLIC_URL}${item.image}`],
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
            success_url: `${req.headers.get("origin")}/success`,
            cancel_url: `${req.headers.get("origin")}/cancel`,
            shipping_address_collection: {
                allowed_countries: ["JP"],
            },
        });

        return NextResponse.json({ sessionId: session.id });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
