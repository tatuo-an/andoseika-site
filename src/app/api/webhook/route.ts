import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { google } from "googleapis";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function appendToSheet(values: string[][]) {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
        range: "Sheet1!A:F",
        valueInputOption: "USER_ENTERED",
        requestBody: { values },
    });
}

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error("[webhook] signature verification failed", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        const now = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
        const name = session.customer_details?.name ?? "";
        const email = session.customer_details?.email ?? "";
        const amount = session.amount_total?.toString() ?? "";
        const sessionId = session.id;

        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 10 });
        const productNames = lineItems.data.map((item) => item.description).join(", ");

        try {
            await appendToSheet([[now, name, email, productNames, amount, sessionId]]);
            console.log("[webhook] order recorded:", sessionId);
        } catch (err) {
            console.error("[webhook] failed to write to sheet", err);
        }
    }

    return NextResponse.json({ received: true });
}
