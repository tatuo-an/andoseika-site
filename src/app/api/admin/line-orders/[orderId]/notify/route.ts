import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";

const SPREADSHEET_ID = process.env.LINE_ORDER_SPREADSHEET_ID!;

function getSheets() {
    const authClient = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    return google.sheets({ version: "v4", auth: authClient });
}

async function pushLineMessage(lineId: string, text: string) {
    const token = process.env.LINE_ORDER_CHANNEL_ACCESS_TOKEN || process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!token) throw new Error("LINE_ORDER_CHANNEL_ACCESS_TOKEN (または LINE_CHANNEL_ACCESS_TOKEN) is not set");
    const res = await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ to: lineId, messages: [{ type: "text", text }] }),
    });
    if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`LINE push failed (${res.status}): ${errText}`);
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!SPREADSHEET_ID) {
        return NextResponse.json({ error: "LINE_ORDER_SPREADSHEET_ID is not configured" }, { status: 500 });
    }

    const { orderId } = await params;
    const { kind, message } = await req.json() as { kind: "single" | "bulk"; message: string };
    if (!kind || !message?.trim()) {
        return NextResponse.json({ error: "kind, message が必要です" }, { status: 400 });
    }

    const sheetName = kind === "single" ? "注文" : "大口注文";
    const lineIdColumnIndex = kind === "single" ? 1 : 2; // 注文=B列(LINE ID) / 大口注文=C列(LINE ID)

    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A:L`,
        });
        const rows = res.data.values ?? [];
        const row = rows.find((r) => r[0] === orderId);
        if (!row) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }
        const lineId = row[lineIdColumnIndex];
        if (!lineId) {
            return NextResponse.json({ error: "LINE IDが見つかりません" }, { status: 400 });
        }

        await pushLineMessage(lineId, message.trim());
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[line-orders notify]", err);
        const detail = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: "通知の送信に失敗しました", detail }, { status: 500 });
    }
}
