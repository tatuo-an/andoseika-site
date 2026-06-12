import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;
const SHEET_NAME = "お気に入り";
// 列: A=メール, B=商品IDのカンマ区切り

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

async function ensureSheet(sheets: ReturnType<typeof getSheets>) {
    try {
        const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
        const exists = meta.data.sheets?.some(s => s.properties?.title === SHEET_NAME);
        if (!exists) {
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId: SPREADSHEET_ID,
                requestBody: { requests: [{ addSheet: { properties: { title: SHEET_NAME } } }] },
            });
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `${SHEET_NAME}!A1:B1`,
                valueInputOption: "RAW",
                requestBody: { values: [["メール", "商品ID"]] },
            });
        }
    } catch (e) {
        console.error("[favorites ensureSheet]", e);
    }
}

export async function GET() {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ favorites: [] });
    const email = session.user.email;

    try {
        const sheets = getSheets();
        await ensureSheet(sheets);
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:B`,
        });
        const rows = res.data.values ?? [];
        const row = rows.find(r => r[0] === email);
        const favorites = row?.[1]
            ? row[1].split(",").map((s: string) => s.trim()).filter(Boolean)
            : [];
        return NextResponse.json({ favorites });
    } catch (err) {
        console.error("[favorites GET]", err);
        return NextResponse.json({ favorites: [] });
    }
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const email = session.user.email;

    const { productId, action } = await req.json() as { productId: string; action: "add" | "remove" };
    if (!productId || !["add", "remove"].includes(action)) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    try {
        const sheets = getSheets();
        await ensureSheet(sheets);
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:B`,
        });
        const rows = res.data.values ?? [];
        const rowIndex = rows.findIndex(r => r[0] === email);
        const current = rowIndex >= 0 && rows[rowIndex][1]
            ? rows[rowIndex][1].split(",").map((s: string) => s.trim()).filter(Boolean)
            : [];

        let next: string[];
        if (action === "add") {
            next = current.includes(productId) ? current : [...current, productId];
        } else {
            next = current.filter((id: string) => id !== productId);
        }

        const values = [[email, next.join(",")]];
        if (rowIndex === -1) {
            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: `${SHEET_NAME}!A:B`,
                valueInputOption: "RAW",
                requestBody: { values },
            });
        } else {
            const sheetRow = rowIndex + 1;
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `${SHEET_NAME}!A${sheetRow}:B${sheetRow}`,
                valueInputOption: "RAW",
                requestBody: { values },
            });
        }

        return NextResponse.json({ favorites: next });
    } catch (err) {
        console.error("[favorites POST]", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
