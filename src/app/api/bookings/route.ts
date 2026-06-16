import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;
const SHEET_NAME = "体験予約";
// 列: A=予約ID, B=メール, C=名前, D=電話, E=体験名, F=日付, G=開始時刻, H=所要分, I=人数, J=ステータス, K=作成日時

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
                range: `${SHEET_NAME}!A1:K1`,
                valueInputOption: "RAW",
                requestBody: { values: [["予約ID", "メール", "名前", "電話番号", "体験名", "日付", "開始時刻", "所要分", "人数", "ステータス", "作成日時"]] },
            });
        }
    } catch (e) {
        console.error("[bookings ensureSheet]", e);
    }
}

type Booking = {
    id: string; email: string; name: string; phone: string;
    experienceName: string; date: string; startTime: string;
    durationMin: number; headcount: number; status: string; createdAt: string;
};

// 予約一覧取得（フィルター可: experienceName, from, to）
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const experienceName = searchParams.get("experienceName") ?? "";
    const from = searchParams.get("from") ?? "";
    const to = searchParams.get("to") ?? "";

    try {
        const sheets = getSheets();
        await ensureSheet(sheets);
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:K`,
        });
        const rows = res.data.values ?? [];
        const all: Booking[] = rows.slice(1).filter(r => r[0]).map(r => ({
            id: r[0] ?? "",
            email: r[1] ?? "",
            name: r[2] ?? "",
            phone: r[3] ?? "",
            experienceName: r[4] ?? "",
            date: r[5] ?? "",
            startTime: r[6] ?? "",
            durationMin: parseInt(r[7] ?? "0", 10) || 0,
            headcount: parseInt(r[8] ?? "0", 10) || 0,
            status: r[9] ?? "",
            createdAt: r[10] ?? "",
        })).filter(b => b.status === "confirmed");

        const filtered = all.filter(b => {
            if (experienceName && b.experienceName !== experienceName) return false;
            if (from && b.date < from) return false;
            if (to && b.date > to) return false;
            return true;
        });

        // 公開情報のみ返す（個人情報は除外）
        return NextResponse.json({
            bookings: filtered.map(b => ({
                experienceName: b.experienceName,
                date: b.date,
                startTime: b.startTime,
                durationMin: b.durationMin,
            })),
        });
    } catch (err) {
        console.error("[bookings GET]", err);
        return NextResponse.json({ bookings: [] });
    }
}

// 新規予約作成（重複チェック付き）
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
    }
    const email = session.user.email;
    const userName = session.user.name ?? "";

    const body = await req.json();
    const { experienceName, date, startTime, durationMin, headcount, phone, name } = body as {
        experienceName: string; date: string; startTime: string;
        durationMin: number; headcount: number; phone?: string; name?: string;
    };

    if (!experienceName || !date || !startTime || !durationMin || !headcount) {
        return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
    }

    try {
        const sheets = getSheets();
        await ensureSheet(sheets);

        // 重複チェック: 同じ体験・同じ日付・同じ開始時刻でconfirmedな予約があれば拒否
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:K`,
        });
        const rows = res.data.values ?? [];
        const existing = rows.slice(1).find(r =>
            r[4] === experienceName && r[5] === date && r[6] === startTime && r[9] === "confirmed"
        );
        if (existing) {
            return NextResponse.json({ error: "この時間帯は既に予約されています" }, { status: 409 });
        }

        // 追加
        const id = `bk-${Date.now()}`;
        const createdAt = new Date().toISOString();
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:K`,
            valueInputOption: "RAW",
            requestBody: {
                values: [[id, email, name || userName, phone ?? "", experienceName, date, startTime, durationMin, headcount, "confirmed", createdAt]],
            },
        });

        return NextResponse.json({ success: true, id });
    } catch (err) {
        console.error("[bookings POST]", err);
        return NextResponse.json({ error: "予約に失敗しました" }, { status: 500 });
    }
}
