import { NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;
const SHEET_NAME = "商品在庫";

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

// 公開用: 原価・利益率を含まない、ファミリーマッチ判定に必要な情報のみ返す
export async function GET() {
    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:Q`,
        });
        const rows = res.data.values ?? [];
        const data = rows.slice(1)
            .filter(r => r[0])
            .map((r) => ({
                id: r[0] ?? "",
                name: r[1] ?? "",
                price: r[3] !== undefined && r[3] !== "" ? parseInt(r[3], 10) : null,
                shipType: r[4] ?? "",
                family: r[9] ?? "",
                hidden: r[5] === "1",
                coolAvailable: r[14] === "1",
                clickpostMax: r[16] !== undefined && r[16] !== "" ? parseInt(r[16], 10) : 0,
            }))
            .filter(r => !r.hidden);
        return NextResponse.json({ inventory: data });
    } catch (err) {
        console.error("[inventory-public GET]", err);
        return NextResponse.json({ inventory: [] });
    }
}
