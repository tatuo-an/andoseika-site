import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;
const SHEET_NAME = "商品在庫";
// 列: A=商品ID, B=商品名, C=在庫数

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

// 全商品の在庫取得（公開用・認証不要）
export async function GET() {
    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:C`,
        });
        const rows = res.data.values ?? [];
        // ヘッダー行をスキップ
        const data = rows.slice(1).map((r) => ({
            id: r[0] ?? "",
            name: r[1] ?? "",
            stock: parseInt(r[2] ?? "0", 10),
        }));
        return NextResponse.json({ inventory: data });
    } catch (err) {
        console.error("[inventory GET]", err);
        return NextResponse.json({ inventory: [] });
    }
}

// 在庫数更新（管理者のみ）
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id, name, stock } = await req.json();

    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:A`,
        });
        const rows = res.data.values ?? [];
        // ヘッダー行を含むのでindex+1がシート行番号
        const rowIndex = rows.findIndex((r, i) => i > 0 && r[0] === id);

        if (rowIndex === -1) {
            // 新規追加
            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: `${SHEET_NAME}!A:C`,
                valueInputOption: "RAW",
                requestBody: { values: [[id, name, stock]] },
            });
        } else {
            // 既存行を更新
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `${SHEET_NAME}!A${rowIndex + 1}:C${rowIndex + 1}`,
                valueInputOption: "RAW",
                requestBody: { values: [[id, name, stock]] },
            });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[inventory POST]", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
