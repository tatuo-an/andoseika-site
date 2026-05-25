import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;
const SHEET_NAME = "顧客マスタ";
// 列: A=メール, B=名前, C=郵便番号, D=都道府県, E=市区町村, F=番地, G=建物名, H=電話番号

function getSheets() {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    return google.sheets({ version: "v4", auth });
}

// 住所取得
export async function GET() {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = session.user.email;

    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:H`,
        });
        const rows = res.data.values ?? [];
        const row = rows.find((r) => r[0] === email);
        if (!row) return NextResponse.json({ address: null });

        return NextResponse.json({
            address: {
                name: row[1] ?? "",
                postalCode: row[2] ?? "",
                prefecture: row[3] ?? "",
                city: row[4] ?? "",
                street: row[5] ?? "",
                building: row[6] ?? "",
                phone: row[7] ?? "",
            },
        });
    } catch (err) {
        console.error("[address GET]", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}

// 住所保存
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = session.user.email;
    const body = await req.json();
    const { name, postalCode, prefecture, city, street, building, phone } = body;

    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:A`,
        });
        const rows = res.data.values ?? [];
        const rowIndex = rows.findIndex((r) => r[0] === email);
        const values = [[email, name, postalCode, prefecture, city, street, building, phone]];

        if (rowIndex === -1) {
            // 新規追加
            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: `${SHEET_NAME}!A:H`,
                valueInputOption: "USER_ENTERED",
                requestBody: { values },
            });
        } else {
            // 既存行を上書き
            const sheetRow = rowIndex + 1;
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `${SHEET_NAME}!A${sheetRow}:H${sheetRow}`,
                valueInputOption: "USER_ENTERED",
                requestBody: { values },
            });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[address POST]", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
