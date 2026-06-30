import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;
const SHEET_NAME = "商品在庫";
// 列: A=商品ID, B=商品名, C=在庫数, D=販売価格, E=配送区分, F=非表示(1/""), G=未使用, H=次回出荷, I=バッジ(カンマ区切り), J=ファミリー, K=画像URL, L=ファミリーギャラリー画像(カンマ区切り), M=原価, N=利益率(%), O=クール便対応(1/""), P=商品説明, Q=クリックポスト最大同梱数(0=不可), R=オプション(ラベル:金額|...), S=セール割引率(%), T=セール開始日(YYYY-MM-DD), U=セール終了日(YYYY-MM-DD), V=発送モード(days/weekdays/""), W=発送値(daysなら "min-max"、weekdaysなら "月,木"), X=コンパクト最大同梱数(0=未設定/制限なし), Y=カテゴリ(root/leaf/honey/processed/other), Z=会員限定(1/""), AA=詳細情報JSON(特徴/保存方法/おすすめ/注意 等), AB=レスキュー便(1/""), AC=レスキュー期限(YYYY-MM-DD)

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
    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:AC`,
        });
        const rows = res.data.values ?? [];
        const data = rows.slice(1).map((r) => ({
            id: r[0] ?? "",
            name: r[1] ?? "",
            stock: r[2] !== undefined && r[2] !== "" ? parseInt(r[2], 10) : -1,
            price: r[3] !== undefined && r[3] !== "" ? parseInt(r[3], 10) : null,
            shipType: r[4] ?? "",
            hidden: r[5] === "1",
            deleted: false,
            nextShipment: r[7] ?? "",
            badges: r[8] ? r[8].split(",").map((b: string) => b.trim()).filter(Boolean) : [],
            family: r[9] ?? "",
            imageUrl: r[10] ?? "",
            familyImages: r[11] ? r[11].split(",").map((s: string) => s.trim()).filter(Boolean) : [],
            cost: r[12] !== undefined && r[12] !== "" ? parseInt(r[12], 10) : null,
            profitRate: r[13] !== undefined && r[13] !== "" ? parseFloat(r[13]) : null,
            coolAvailable: r[14] === "1",
            description: r[15] ?? "",
            clickpostMax: r[16] !== undefined && r[16] !== "" ? parseInt(r[16], 10) : 0,
            options: r[17] ?? "",
            salePercent: r[18] !== undefined && r[18] !== "" ? parseInt(r[18], 10) : 0,
            saleStart: r[19] ?? "",
            saleEnd: r[20] ?? "",
            shipMode: r[21] ?? "",
            shipValue: r[22] ?? "",
            compactMax: r[23] !== undefined && r[23] !== "" ? parseInt(r[23], 10) : 0,
            category: r[24] ?? "",
            limitedOnly: r[25] === "1",
            extraDescriptions: r[26] ?? "",
            rescue: r[27] === "1",
            rescueDeadline: r[28] ?? "",
        }));
        return NextResponse.json({ inventory: data });
    } catch (err) {
        console.error("[inventory GET]", err);
        return NextResponse.json({ inventory: [] });
    }
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { items } = await req.json() as {
        items: { id: string; name: string; stock: number; price: number | null; shipType: string; hidden: boolean; nextShipment: string; badges: string[]; family: string; imageUrl?: string; familyImages?: string[]; cost?: number | null; profitRate?: number | null; coolAvailable?: boolean; limitedOnly?: boolean; rescue?: boolean; rescueDeadline?: string; description?: string; clickpostMax?: number; options?: string; salePercent?: number; saleStart?: string; saleEnd?: string; shipMode?: string; shipValue?: string; compactMax?: number; category?: string; extraDescriptions?: string }[];
    };

    try {
        const sheets = getSheets();

        await sheets.spreadsheets.values.clear({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A2:AC1000`,
        });

        if (items.length > 0) {
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `${SHEET_NAME}!A2`,
                valueInputOption: "RAW",
                requestBody: {
                    values: items.map((item) => [
                        item.id,
                        item.name,
                        item.stock,
                        item.price ?? "",
                        item.shipType,
                        item.hidden ? "1" : "",
                        "",
                        item.nextShipment ?? "",
                        (item.badges ?? []).join(","),
                        item.family ?? "",
                        item.imageUrl ?? "",
                        (item.familyImages ?? []).join(","),
                        item.cost ?? "",
                        item.profitRate ?? "",
                        item.coolAvailable ? "1" : "",
                        item.description ?? "",
                        item.clickpostMax ?? 0,
                        item.options ?? "",
                        item.salePercent ?? 0,
                        item.saleStart ?? "",
                        item.saleEnd ?? "",
                        item.shipMode ?? "",
                        item.shipValue ?? "",
                        item.compactMax ?? 0,
                        item.category ?? "",
                        item.limitedOnly ? "1" : "",
                        item.extraDescriptions ?? "",
                        item.rescue ? "1" : "",
                        item.rescueDeadline ?? "",
                    ]),
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[inventory POST]", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
