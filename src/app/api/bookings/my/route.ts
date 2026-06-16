import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;
const SHEET_NAME = "体験予約";

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
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
    }

    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:L`,
        });
        const rows = res.data.values ?? [];
        const bookings = rows.slice(1)
            .filter(r => r[0] && r[1] === session.user!.email && r[9] === "confirmed")
            .map(r => ({
                id: r[0] as string,
                experienceName: r[4] ?? "",
                date: r[5] ?? "",
                startTime: r[6] ?? "",
                durationMin: parseInt(r[7] ?? "0", 10) || 0,
                headcount: parseInt(r[8] ?? "0", 10) || 0,
                price: parseInt(r[11] ?? "0", 10) || 0,
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return NextResponse.json({ bookings });
    } catch (err) {
        console.error("[bookings/my GET]", err);
        return NextResponse.json({ bookings: [] });
    }
}
