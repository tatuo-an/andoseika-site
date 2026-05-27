import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;
const SHEET_NAME = "送料マスタ";
// 列: A=地域名, B=都道府県, C=60, D=80, E=100, F=120, G=140, H=160, I=180, J=200, K=コンパクト, L=クリックポスト

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

function toInt(v: string | undefined) {
    if (v === undefined || v === "") return 0;
    return parseInt(v, 10) || 0;
}

export async function GET() {
    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:L`,
        });
        const rows = res.data.values ?? [];
        const data = rows.slice(1).map((r) => ({
            region: r[0] ?? "",
            prefectures: r[1] ?? "",
            s60: toInt(r[2]), s80: toInt(r[3]), s100: toInt(r[4]),
            s120: toInt(r[5]), s140: toInt(r[6]), s160: toInt(r[7]),
            s180: toInt(r[8]), s200: toInt(r[9]),
            compact: toInt(r[10]),
            clickpost: toInt(r[11]),
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

    const { items } = await req.json();

    try {
        const sheets = getSheets();
        const values = items.map((item: ReturnType<typeof Object.values>[0] & {
            region: string; prefectures: string;
            s60: number; s80: number; s100: number; s120: number;
            s140: number; s160: number; s180: number; s200: number;
            compact: number; clickpost: number;
        }) => [
            item.region, item.prefectures,
            item.s60, item.s80, item.s100, item.s120,
            item.s140, item.s160, item.s180, item.s200,
            item.compact, item.clickpost,
        ]);
        await sheets.spreadsheets.values.clear({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A2:L100`,
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
