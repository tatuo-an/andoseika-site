import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";
import { TIERS, getTier } from "@/lib/tiers";
import { computeCartPricing, type InvItem, type ShippingRow } from "@/lib/pricing";
import { getActiveSeasonalSale } from "@/lib/seasonalSales";

export const dynamic = "force-dynamic";

// カート画面の内訳表示用プレビューAPI。
// 原価・利益率そのものは一切レスポンスに含めず、サーバー側で computeCartPricing により
// 算出した税込表示額のみを返す（inventory-public は認証なしで誰でも取得できるため、
// 原価構造が漏洩しないようこちらのAPIで代替する）。

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

async function fetchInventory(): Promise<InvItem[]> {
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
        range: "商品在庫!A:Z",
    });
    const rows = res.data.values ?? [];
    return rows.slice(1)
        .filter(r => r[0])
        .map((r) => ({
            id: r[0] ?? "",
            name: r[1] ?? "",
            price: r[3] !== undefined && r[3] !== "" ? parseInt(r[3], 10) : null,
            shipType: r[4] ?? "",
            family: r[9] ?? "",
            cost: r[12] !== undefined && r[12] !== "" ? parseInt(r[12], 10) : null,
            profitRate: r[13] !== undefined && r[13] !== "" ? parseFloat(r[13]) : null,
            coolAvailable: r[14] === "1",
            clickpostMax: r[16] !== undefined && r[16] !== "" ? parseInt(r[16], 10) : 0,
            options: r[17] ?? "",
            salePercent: r[18] !== undefined && r[18] !== "" ? parseInt(r[18], 10) : 0,
            saleStart: r[19] ?? "",
            saleEnd: r[20] ?? "",
            compactMax: r[23] !== undefined && r[23] !== "" ? parseInt(r[23], 10) : 0,
        }));
}

async function fetchSeasonalDiscountPercent(): Promise<number> {
    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
            range: "季節セール!A:E",
        });
        const rows = (res.data.values ?? []).slice(1).filter((r) => r[0]);
        const sales = rows.map((r) => ({
            name: r[0] ?? "",
            startDate: r[1] ?? "",
            endDate: r[2] ?? "",
            discountPercent: parseInt(r[3] ?? "0", 10) || 0,
            enabled: r[4] === "TRUE",
        }));
        return getActiveSeasonalSale(sales)?.discountPercent ?? 0;
    } catch {
        return 0;
    }
}

async function fetchShippingRows(): Promise<ShippingRow[]> {
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
        range: "送料マスタ!A:L",
    });
    const rows = res.data.values ?? [];
    const toInt = (v: string | undefined) => (v === undefined || v === "" ? 0 : parseInt(v, 10) || 0);
    return rows.slice(1).map((r) => ({
        region: r[0] ?? "", prefectures: r[1] ?? "",
        s60: toInt(r[2]), s80: toInt(r[3]), s100: toInt(r[4]), s120: toInt(r[5]),
        s140: toInt(r[6]), s160: toInt(r[7]), s180: toInt(r[8]), s200: toInt(r[9]),
        compact: toInt(r[10]), clickpost: toInt(r[11]),
    }));
}

async function fetchTierDiscountRate(email: string): Promise<number> {
    if (!email) return 0;
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
        range: "顧客マスタ!A:F",
    });
    const rows = res.data.values ?? [];
    const row = rows.find((r) => r[0] === email && r[1] === "__profile__");
    const tier = row?.[4] ?? "";
    const tierExpiry = row?.[5] ?? "";
    const now = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
    const activeTier = tier && tierExpiry && tierExpiry >= now ? getTier(tier) : "free";
    return TIERS[activeTier].discountRate;
}

async function fetchPointsBalance(email: string): Promise<number> {
    if (!email) return 0;
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
        range: "ポイント履歴!A:E",
    });
    const rows = (res.data.values ?? []).filter((r) => r[0] === email);
    return rows.reduce((sum, r) => sum + (parseInt(r[3] ?? "0", 10) || 0), 0);
}

type CartItem = { quantity: number };

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { cartDetails, prefecture, optionLabels, coolRequested, pointsToUse } = body as {
            cartDetails?: Record<string, CartItem>;
            prefecture?: string | null;
            optionLabels?: string[];
            coolRequested?: boolean;
            pointsToUse?: number;
        };

        if (!cartDetails || Object.keys(cartDetails).length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        const nextAuthSession = await auth();
        const userEmail = nextAuthSession?.user?.email ?? "";

        const [inventory, shippingRows, tierDiscountRate, pointsBalance, seasonalDiscountPercent] = await Promise.all([
            fetchInventory(),
            fetchShippingRows(),
            fetchTierDiscountRate(userEmail),
            fetchPointsBalance(userEmail),
            fetchSeasonalDiscountPercent(),
        ]);

        const cartLines = Object.entries(cartDetails).map(([id, item]) => ({
            id,
            quantity: Math.max(1, Math.floor(item.quantity)),
        }));

        const pricing = computeCartPricing({
            cartLines,
            inventory,
            shippingRows,
            prefecture: prefecture ?? null,
            selectedOptionKeys: new Set(optionLabels ?? []),
            coolRequested: !!coolRequested,
            tierDiscountRate,
            pointsBalance,
            pointsToUse: pointsToUse ?? 0,
            seasonalDiscountPercent,
        });

        return NextResponse.json({ pricing, pointsBalance });
    } catch (err) {
        console.error("[cart-preview POST]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
