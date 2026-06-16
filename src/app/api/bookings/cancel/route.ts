import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;
const SHEET_NAME = "体験予約";

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

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
    }

    const { id } = await req.json() as { id: string };
    if (!id) return NextResponse.json({ error: "IDが必要です" }, { status: 400 });

    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:L`,
        });
        const rows = res.data.values ?? [];
        const rowIndex = rows.findIndex(r => r[0] === id && r[1] === session.user!.email);

        if (rowIndex === -1) {
            return NextResponse.json({ error: "予約が見つかりません" }, { status: 404 });
        }

        // ステータスをcancelledに更新（行番号はスプレッドシート上で1始まり）
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!J${rowIndex + 1}`,
            valueInputOption: "RAW",
            requestBody: { values: [["cancelled"]] },
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[bookings/cancel POST]", err);
        return NextResponse.json({ error: "キャンセルに失敗しました" }, { status: 500 });
    }
}
