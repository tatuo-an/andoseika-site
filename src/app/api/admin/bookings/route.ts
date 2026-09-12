import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;
const SHEET_NAME = "体験予約";
// 列: A=予約ID, B=メール, C=名前, D=電話番号, E=体験名, F=日付, G=開始時刻, H=所要分, I=人数, J=ステータス, K=作成日時, L=料金

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

export type AdminBooking = {
    id: string;
    email: string;
    name: string;
    phone: string;
    experienceName: string;
    date: string;
    startTime: string;
    durationMin: number;
    headcount: number;
    status: string;
    createdAt: string;
    price: number;
};

export async function GET() {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:L`,
        });
        const rows = res.data.values ?? [];
        const bookings: AdminBooking[] = rows.slice(1)
            .filter((r) => r[0])
            .map((r) => ({
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
                price: parseInt(r[11] ?? "0", 10) || 0,
            }))
            .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));

        return NextResponse.json({ bookings });
    } catch (err) {
        console.error("[admin/bookings GET]", err);
        return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
    }
}

// ステータス変更（管理者は本人以外の予約も操作できる）
export async function PATCH(req: NextRequest) {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, status } = await req.json() as { id: string; status: string };
    if (!id || !status) {
        return NextResponse.json({ error: "id, status が必要です" }, { status: 400 });
    }

    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:A`,
        });
        const rows = res.data.values ?? [];
        const rowIndex = rows.findIndex((r) => r[0] === id);
        if (rowIndex === -1) {
            return NextResponse.json({ error: "予約が見つかりません" }, { status: 404 });
        }

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!J${rowIndex + 1}`,
            valueInputOption: "RAW",
            requestBody: { values: [[status]] },
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[admin/bookings PATCH]", err);
        return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
    }
}
