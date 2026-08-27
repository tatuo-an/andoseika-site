import { NextRequest, NextResponse } from "next/server";
import { sheets as sheetsApi, auth as googleAuth } from "@googleapis/sheets";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";

const SPREADSHEET_ID = process.env.LINE_ORDER_SPREADSHEET_ID!;

function getSheets() {
    const authClient = new googleAuth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    return sheetsApi({ version: "v4", auth: authClient });
}

// 個人注文（注文シート）はH列、大口注文（大口注文シート）はJ列がステータス
export async function PATCH(
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
    const { kind, status } = await req.json() as { kind: "single" | "bulk"; status: string };
    if (!kind || status === undefined) {
        return NextResponse.json({ error: "kind, status が必要です" }, { status: 400 });
    }

    const sheetName = kind === "single" ? "注文" : "大口注文";
    const statusColumn = kind === "single" ? "H" : "J";

    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A:A`,
        });
        const rows = res.data.values ?? [];
        const rowIndex = rows.findIndex((r) => r[0] === orderId);
        if (rowIndex === -1) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!${statusColumn}${rowIndex + 1}`,
            valueInputOption: "RAW",
            requestBody: { values: [[status]] },
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[line-orders PATCH]", err);
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }
}
