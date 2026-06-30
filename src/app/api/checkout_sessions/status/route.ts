import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET(req: NextRequest) {
    const sessionId = req.nextUrl.searchParams.get("session_id");
    if (!sessionId) return NextResponse.json({ error: "Missing session_id" }, { status: 400 });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ["payment_intent"],
        });
        return NextResponse.json({
            paymentStatus: session.payment_status,
            paymentMethodType: (session.payment_intent as Stripe.PaymentIntent | null)
                ?.payment_method_types?.[0] ?? null,
        });
    } catch {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
}
