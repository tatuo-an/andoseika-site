import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { getTier, type TierKey } from "@/lib/tiers";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

const PLAN_LIMITS: Record<string, number> = { minori: 10, partner: 5 };

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

function todayJstDateString(): string {
    return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
}

function isIsoDateString(value: string | undefined): value is string {
    return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function addOneYear(dateStr: string): string {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCFullYear(date.getUTCFullYear() + 1);
    return date.toISOString().slice(0, 10);
}

function calcNextTierExpiry(existingTierExpiry: string | undefined): string {
    const today = todayJstDateString();
    const baseDate =
        isIsoDateString(existingTierExpiry) && existingTierExpiry >= today
            ? existingTierExpiry
            : today;
    return addOneYear(baseDate);
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

    // 人数制限チェック
    if (PLAN_LIMITS[tierKey] !== undefined) {
        const authClient2 = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            },
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
        const sheets2 = google.sheets({ version: "v4", auth: authClient2 });
        const countRes = await sheets2.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
            range: "顧客マスタ!A:F",
        });
        const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
        const count = (countRes.data.values ?? []).slice(1).filter(
            (r) => r[0] !== userEmail && r[1] === "__profile__" && r[4] === tierKey && (r[5] ?? "") >= today
        ).length;
        if (count >= PLAN_LIMITS[tierKey]) {
            return NextResponse.json({ error: "定員に達しています" }, { status: 409 });
        }
    }

    try {
        const sheets = getSheets();
        const SHEET = "顧客マスタ";
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
            range: `${SHEET}!A:I`,
        });
        const rows = res.data.values ?? [];
        const rowIndex = rows.findIndex((r) => r[0] === userEmail && r[1] === "__profile__");
        const existing = rowIndex === -1 ? undefined : rows[rowIndex];
        const tierExpiry = calcNextTierExpiry(existing?.[5]);

        if (rowIndex === -1) {
            await sheets.spreadsheets.values.append({
                spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
                range: `${SHEET}!A:I`,
                valueInputOption: "RAW",
                requestBody: { values: [[userEmail, "__profile__", "", "", tierKey, tierExpiry, "", "", ""]] },
            });
        } else {
            await sheets.spreadsheets.values.update({
                spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
                range: `${SHEET}!A${rowIndex + 1}:I${rowIndex + 1}`,
                valueInputOption: "RAW",
                requestBody: { values: [[userEmail, "__profile__", existing?.[2] ?? "", existing?.[3] ?? "", tierKey, tierExpiry, "", existing?.[7] ?? "", ""]] },
            });
        }

        console.log("[test-supporter] tier updated:", userEmail, tierKey, tierExpiry);
        return NextResponse.json({ success: true, tier: tierKey, tierExpiry });
    } catch (err) {
        console.error("[test-supporter] error:", err);
        return NextResponse.json({ error: "Failed to update tier" }, { status: 500 });
    }
}
