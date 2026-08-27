import { NextRequest, NextResponse } from "next/server";
import { sheets as sheetsApi, auth as googleAuth } from "@googleapis/sheets";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { DEFAULT_SEASONAL_SALES, type SeasonalSale } from "@/lib/seasonalSales";

export const dynamic = "force-dynamic";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;
const SHEET_NAME = "季節セール";
// 列: A=セール名, B=開始日(MM-DD), C=終了日(MM-DD), D=割引率(%), E=有効(TRUE/FALSE)

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

function rowsToSales(rows: string[][]): SeasonalSale[] {
    return rows
        .filter((r) => r[0])
        .map((r) => ({
            name: r[0] ?? "",
            startDate: r[1] ?? "",
            endDate: r[2] ?? "",
            discountPercent: parseInt(r[3] ?? "0", 10) || 0,
            enabled: r[4] === "TRUE",
        }));
}

function salesToRows(sales: SeasonalSale[]): string[][] {
    return sales.map((s) => [s.name, s.startDate, s.endDate, String(s.discountPercent), s.enabled ? "TRUE" : "FALSE"]);
}

async function ensureSheet(sheets: ReturnType<typeof getSheets>): Promise<SeasonalSale[]> {
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const exists = meta.data.sheets?.some((s) => s.properties?.title === SHEET_NAME);
    if (!exists) {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: { requests: [{ addSheet: { properties: { title: SHEET_NAME } } }] },
        });
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A1:E1`,
            valueInputOption: "RAW",
            requestBody: { values: [["セール名", "開始日(MM-DD)", "終了日(MM-DD)", "割引率(%)", "有効"]] },
        });
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A2`,
            valueInputOption: "RAW",
            requestBody: { values: salesToRows(DEFAULT_SEASONAL_SALES) },
        });
        return DEFAULT_SEASONAL_SALES;
    }
    return [];
}

// 季節セール一覧取得（商品表示・決済価格の計算で使うため認証不要）
export async function GET() {
    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:E`,
        });
        const rows = res.data.values ?? [];
        if (rows.length <= 1) {
            const seeded = await ensureSheet(sheets);
            if (seeded.length > 0) return NextResponse.json({ sales: seeded });
        }
        const sales = rowsToSales(rows.slice(1));
        return NextResponse.json({ sales });
    } catch (err) {
        console.error("[seasonal-sales GET]", err);
        // シート未作成・読み取り失敗時はデフォルト値で動作を継続する
        return NextResponse.json({ sales: DEFAULT_SEASONAL_SALES });
    }
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { sales } = await req.json() as { sales: SeasonalSale[] };
    if (!Array.isArray(sales)) {
        return NextResponse.json({ error: "sales が必要です" }, { status: 400 });
    }

    try {
        const sheets = getSheets();
        await ensureSheet(sheets);
        await sheets.spreadsheets.values.clear({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A2:E200`,
        });
        if (sales.length > 0) {
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `${SHEET_NAME}!A2`,
                valueInputOption: "RAW",
                requestBody: { values: salesToRows(sales) },
            });
        }
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[seasonal-sales POST]", err);
        return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }
}
