import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;
const SHEET_NAME = "商品在庫";
// 列: A=商品ID, B=商品名, C=在庫数, D=価格, E=配送区分(60/80/100/120/140/160/180/200/compact/clickpost)

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
            range: `${SHEET_NAME}!A:E`,
        });
        const rows = res.data.values ?? [];
        const data = rows.slice(1).map((r) => ({
            id: r[0] ?? "",
            name: r[1] ?? "",
            stock: r[2] !== undefined && r[2] !== "" ? parseInt(r[2], 10) : -1,
            price: r[3] !== undefined && r[3] !== "" ? parseInt(r[3], 10) : null,
            shipType: r[4] ?? "",
        }));
        return NextResponse.json({ inventory: data });
    } catch (err) {
        console.error("[inventory GET]", err);
        return NextResponse.json({ inventory: [] });
    }
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { items } = await req.json() as {
        items: { id: string; name: string; stock: number; price: number | null; shipType: string }[]
    };

    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:A`,
        });
        const existingRows = res.data.values ?? [];
        const idToRow: Record<string, number> = {};
        existingRows.forEach((r, i) => { if (i > 0 && r[0]) idToRow[r[0]] = i + 1; });

        for (const item of items) {
            const values = [[item.id, item.name, item.stock, item.price ?? "", item.shipType]];
            if (idToRow[item.id]) {
                const rowNum = idToRow[item.id];
                await sheets.spreadsheets.values.update({
                    spreadsheetId: SPREADSHEET_ID,
                    range: `${SHEET_NAME}!A${rowNum}:E${rowNum}`,
                    valueInputOption: "RAW",
                    requestBody: { values },
                });
            } else {
                await sheets.spreadsheets.values.append({
                    spreadsheetId: SPREADSHEET_ID,
                    range: `${SHEET_NAME}!A:E`,
                    valueInputOption: "RAW",
                    requestBody: { values },
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[inventory POST]", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
