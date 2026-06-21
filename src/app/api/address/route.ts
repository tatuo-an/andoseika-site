import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;
const SHEET_NAME = "顧客マスタ";
// 列: A=メール, B=ラベル, C=名前, D=郵便番号, E=都道府県, F=市区町村, G=番地, H=建物名, I=電話番号, J=誕生日(MM/DD)
// 旧形式 (A=メール, B=名前, C=郵便番号...) のデータは読み取り時に自動判別

function getSheets() {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    return google.sheets({ version: "v4", auth });
}

type Address = {
    label: string;
    name: string;
    postalCode: string;
    prefecture: string;
    city: string;
    street: string;
    building: string;
    phone: string;
    birthday: string;
};

// 旧形式判定: B列が郵便番号らしい場合は旧形式
function isLegacyRow(r: string[]): boolean {
    const b = r[1] ?? "";
    // 郵便番号は数字とハイフンのみで構成される
    return /^\d{3}-?\d{4}$/.test(b);
}

function rowToAddress(r: string[]): Address {
    return {
        label: r[1] ?? "",
        name: r[2] ?? "",
        postalCode: r[3] ?? "",
        prefecture: r[4] ?? "",
        city: r[5] ?? "",
        street: r[6] ?? "",
        building: r[7] ?? "",
        phone: r[8] ?? "",
        birthday: r[9] ?? "",
    };
}

// 旧形式 (A=メール, B=名前, C=郵便番号, D=都道府県, E=市区町村, F=番地, G=建物名, H=電話番号) を新形式に変換
function legacyRowToAddress(r: string[]): Address {
    return {
        label: "デフォルト",
        name: r[1] ?? "",
        postalCode: r[2] ?? "",
        prefecture: r[3] ?? "",
        city: r[4] ?? "",
        street: r[5] ?? "",
        building: r[6] ?? "",
        phone: r[7] ?? "",
        birthday: "",
    };
}

// 住所一覧取得
export async function GET() {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = session.user.email;

    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:J`,
        });
        const rows = res.data.values ?? [];
        const userRows = rows.slice(1).filter(r => r[0] === email && r[1] !== "__profile__");

        const addresses = userRows.map(r => {
            // 旧形式: C列が郵便番号形式なら旧形式とみなす
            const c = r[2] ?? "";
            const isLegacy = /^\d{3}-?\d{4}$/.test(c);
            return isLegacy ? legacyRowToAddress(r) : rowToAddress(r);
        });

        return NextResponse.json({
            address: addresses[0] ?? null,
            addresses,
        });
    } catch (err) {
        console.error("[address GET]", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}

// 住所保存（追加・更新）
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = session.user.email;
    const body = await req.json();
    const { originalLabel, label, name, postalCode, prefecture, city, street, building, phone, birthday } = body as {
        originalLabel?: string;
        label: string;
        name: string; postalCode: string; prefecture: string;
        city: string; street: string; building: string; phone: string;
        birthday?: string;
    };

    if (!label?.trim()) {
        return NextResponse.json({ error: "ラベルが必要です" }, { status: 400 });
    }

    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:J`,
        });
        const rows = res.data.values ?? [];
        const targetLabel = originalLabel ?? label;

        // 既存行を探す: 同じメール + 同じラベル
        // 旧形式の行（ラベルなし）は「デフォルト」を編集する時に当たる
        const rowIndex = rows.findIndex((r, i) => {
            if (i === 0 || r[0] !== email || r[1] === "__profile__") return false;
            const c = r[2] ?? "";
            const isLegacy = /^\d{3}-?\d{4}$/.test(c);
            const rowLabel = isLegacy ? "デフォルト" : (r[1] ?? "");
            return rowLabel === targetLabel;
        });
        const values = [[email, label, name, postalCode, prefecture, city, street, building, phone, birthday ?? ""]];

        if (rowIndex === -1) {
            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: `${SHEET_NAME}!A:J`,
                valueInputOption: "RAW",
                requestBody: { values },
            });
        } else {
            const sheetRow = rowIndex + 1;
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `${SHEET_NAME}!A${sheetRow}:J${sheetRow}`,
                valueInputOption: "RAW",
                requestBody: { values },
            });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[address POST]", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}

// 住所削除
export async function DELETE(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = session.user.email;
    const { label } = await req.json() as { label: string };

    try {
        const sheets = getSheets();
        const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
        const sheetId = meta.data.sheets?.find(s => s.properties?.title === SHEET_NAME)?.properties?.sheetId;
        if (sheetId === undefined) return NextResponse.json({ error: "Sheet not found" }, { status: 500 });

        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:J`,
        });
        const rows = res.data.values ?? [];
        const rowIndex = rows.findIndex((r, i) => {
            if (i === 0 || r[0] !== email || r[1] === "__profile__") return false;
            const c = r[2] ?? "";
            const isLegacy = /^\d{3}-?\d{4}$/.test(c);
            const rowLabel = isLegacy ? "デフォルト" : (r[1] ?? "");
            return rowLabel === label;
        });
        if (rowIndex === -1) return NextResponse.json({ success: true });

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                requests: [{
                    deleteDimension: {
                        range: { sheetId, dimension: "ROWS", startIndex: rowIndex, endIndex: rowIndex + 1 },
                    },
                }],
            },
        });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[address DELETE]", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
