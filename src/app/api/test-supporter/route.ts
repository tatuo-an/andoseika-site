import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { getTier, type TierKey } from "@/lib/tiers";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

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

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { plan } = await req.json() as { plan: string };
    const tierKey: TierKey = getTier(plan);
    if (tierKey === "free") {
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const userEmail = session!.user!.email!;

    try {
        const sheets = getSheets();
        const SHEET = "顧客マスタ";
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
            range: `${SHEET}!A:F`,
        });
        const rows = res.data.values ?? [];
        const rowIndex = rows.findIndex((r) => r[0] === userEmail && r[1] === "__profile__");

        const expDate = new Date();
        expDate.setFullYear(expDate.getFullYear() + 1);
        const tierExpiry = expDate.toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });

        if (rowIndex === -1) {
            await sheets.spreadsheets.values.append({
                spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
                range: `${SHEET}!A:F`,
                valueInputOption: "RAW",
                requestBody: { values: [[userEmail, "__profile__", "", "", tierKey, tierExpiry]] },
            });
        } else {
            const existing = rows[rowIndex];
            await sheets.spreadsheets.values.update({
                spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
                range: `${SHEET}!A${rowIndex + 1}:F${rowIndex + 1}`,
                valueInputOption: "RAW",
                requestBody: { values: [[userEmail, "__profile__", existing[2] ?? "", existing[3] ?? "", tierKey, tierExpiry]] },
            });
        }

        console.log("[test-supporter] tier updated:", userEmail, tierKey, tierExpiry);
        return NextResponse.json({ success: true, tier: tierKey, tierExpiry });
    } catch (err) {
        console.error("[test-supporter] error:", err);
        return NextResponse.json({ error: "Failed to update tier" }, { status: 500 });
    }
}
