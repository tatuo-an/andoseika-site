import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;
const SHEET_NAME = "送料マスタ";
// 列: A=地域名, B=都道府県（カンマ区切り）, C=通常送料, D=クール便送料

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

export async function GET() {
    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:D`,
        });
        const rows = res.data.values ?? [];
        const data = rows.slice(1).map((r) => ({
            region: r[0] ?? "",
            prefectures: r[1] ?? "",
            normalFee: r[2] !== undefined && r[2] !== "" ? parseInt(r[2], 10) : 0,
            coolFee: r[3] !== undefined && r[3] !== "" ? parseInt(r[3], 10) : 0,
        }));
        return NextResponse.json({ shipping: data });
    } catch (err) {
        console.error("[shipping GET]", err);
        return NextResponse.json({ shipping: [] });
    }
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { items } = await req.json() as {
        items: { region: string; prefectures: string; normalFee: number; coolFee: number }[]
    };

    try {
        const sheets = getSheets();
        // 全行を一括上書き（ヘッダー行は保持）
        const values = items.map((item) => [
            item.region, item.prefectures, item.normalFee, item.coolFee
        ]);
        // 既存データをクリアしてから書き直し
        await sheets.spreadsheets.values.clear({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A2:D100`,
        });
        if (values.length > 0) {
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `${SHEET_NAME}!A2`,
                valueInputOption: "RAW",
                requestBody: { values },
            });
        }
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[shipping POST]", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
