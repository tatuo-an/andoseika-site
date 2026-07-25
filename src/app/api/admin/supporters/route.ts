import { NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { TIERS, getTier } from "@/lib/tiers";

export type SupporterPayment = {
    orderNumber: string;
    createdAt: string;
    productNames: string;
    amount: number;
    status: string;
};

export type Supporter = {
    email: string;
    displayName: string;
    tier: string; // TierKey
    tierName: string;
    tierExpiry: string;
    cancelRequestedAt: string;
    lineLinked: boolean;
    isActive: boolean;
    payments: SupporterPayment[];
};

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
    if (!isAdmin(session?.user?.email)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const sheets = getSheets();
        const lineOrderSpreadsheetId = process.env.LINE_ORDER_SPREADSHEET_ID;
        const [customersRes, ordersRes, lineUsersRes] = await Promise.all([
            sheets.spreadsheets.values.get({
                spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
                range: "顧客マスタ!A:I",
            }),
            sheets.spreadsheets.values.get({
                spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
                range: "注文管理!A:Q",
            }),
            lineOrderSpreadsheetId
                ? sheets.spreadsheets.values.get({ spreadsheetId: lineOrderSpreadsheetId, range: "ユーザー!A:F" }).catch(() => ({ data: { values: [] as string[][] } }))
                : Promise.resolve({ data: { values: [] as string[][] } }),
        ]);

        // LINE注文管理の「ユーザー」シート（A=LINE ID, B=氏名, C=住所, D=電話番号, E=メールアドレス）を
        // メールアドレスで引けるようにしておく。顧客マスタに表示名が無いサポーターの補完に使う。
        const nameByEmail = new Map<string, string>();
        for (const r of lineUsersRes.data.values ?? []) {
            const email = r[4] ?? "";
            const name = r[1] ?? "";
            if (email && name) nameByEmail.set(email, name);
        }

        const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });

        // 年会費（サポーター）注文のみメールアドレスごとに集約
        const paymentsByEmail = new Map<string, SupporterPayment[]>();
        for (const r of ordersRes.data.values ?? []) {
            const productNames = r[6] ?? "";
            if (!r[0] || r[0] === "注文番号" || !productNames.includes("年会費")) continue;
            const email = r[3] ?? "";
            if (!email) continue;
            const payment: SupporterPayment = {
                orderNumber: r[0] ?? "",
                createdAt: r[1] ?? "",
                productNames,
                amount: parseInt(r[7] ?? "0", 10) || 0,
                status: r[8] ?? "",
            };
            const arr = paymentsByEmail.get(email) ?? [];
            arr.push(payment);
            paymentsByEmail.set(email, arr);
        }

        // 顧客マスタのプロフィール行（tierが設定されている、または支払履歴がある人）
        const supporters: Supporter[] = [];
        const seenEmails = new Set<string>();
        for (const r of customersRes.data.values ?? []) {
            if (r[1] !== "__profile__") continue;
            const email = r[0] ?? "";
            if (!email) continue;
            const tierRaw = r[4] ?? "";
            const payments = paymentsByEmail.get(email) ?? [];
            if (!tierRaw && payments.length === 0) continue; // サポーター経験なしは除外

            const tierExpiry = r[5] ?? "";
            const tierKey = getTier(tierRaw);
            const isActive = tierKey !== "free" && !!tierExpiry && tierExpiry >= today;
            seenEmails.add(email);
            supporters.push({
                email,
                displayName: (r[2] ?? "") || nameByEmail.get(email) || "",
                tier: tierKey,
                tierName: TIERS[tierKey].name,
                tierExpiry,
                cancelRequestedAt: r[6] ?? "",
                lineLinked: !!r[7],
                isActive,
                payments: payments.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
            });
        }

        // 顧客マスタに profile 行が無い（退会済み等）が支払履歴だけ残っているケースも拾う
        for (const [email, payments] of paymentsByEmail) {
            if (seenEmails.has(email)) continue;
            supporters.push({
                email,
                displayName: nameByEmail.get(email) || "",
                tier: "free",
                tierName: "（退会済み等）",
                tierExpiry: "",
                cancelRequestedAt: "",
                lineLinked: false,
                isActive: false,
                payments: payments.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
            });
        }

        supporters.sort((a, b) => {
            if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
            return b.tierExpiry.localeCompare(a.tierExpiry);
        });

        return NextResponse.json({ supporters });
    } catch (err) {
        console.error("[admin/supporters GET]", err);
        return NextResponse.json({ error: "Failed to load supporters" }, { status: 500 });
    }
}
