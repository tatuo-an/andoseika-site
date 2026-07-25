import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";

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

// 顧客マスタの表示名（C列）を管理画面から編集する
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ email: string }> }
) {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { email: encodedEmail } = await params;
    const email = decodeURIComponent(encodedEmail);
    const { displayName } = await req.json() as { displayName?: string };
    if (displayName === undefined) {
        return NextResponse.json({ error: "displayName が必要です" }, { status: 400 });
    }

    try {
        const sheets = getSheets();
        const id = process.env.GOOGLE_SPREADSHEET_ID!;
        const res = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: "顧客マスタ!A:B" });
        const rows = res.data.values ?? [];
        const rowIndex = rows.findIndex((r) => r[0] === email && r[1] === "__profile__");
        if (rowIndex === -1) {
            return NextResponse.json({ error: "対象のプロフィールが見つかりません" }, { status: 404 });
        }

        await sheets.spreadsheets.values.update({
            spreadsheetId: id,
            range: `顧客マスタ!C${rowIndex + 1}`,
            valueInputOption: "RAW",
            requestBody: { values: [[displayName.trim().slice(0, 50)]] },
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[admin/supporters PATCH]", err);
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}
