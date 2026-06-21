import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;
const SHEET_NAME = "顧客マスタ";
// 列: A=メール, B=ラベル, C=名前, D=郵便番号, E=都道府県, F=市区町村, G=番地, H=建物名, I=電話番号, J=誕生日(MM/DD), K=続柄
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
    relation: string;
};

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
        relation: r[10] ?? "",
    };
}

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
        relation: "",
    };
}

function findRowIndex(rows: string[][], email: string, targetLabel: string): number {
    return rows.findIndex((r, i) => {
        if (i === 0 || r[0] !== email || r[1] === "__profile__") return false;
        const isLegacy = /^\d{3}-?\d{4}$/.test(r[2] ?? "");
        return (isLegacy ? "デフォルト" : (r[1] ?? "")) === targetLabel;
    });
}

// 住所一覧取得
export async function GET() {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const email = session.user.email;

    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${SHEET_NAME}!A:K` });
        const rows = res.data.values ?? [];
        const userRows = rows.slice(1).filter(r => r[0] === email && r[1] !== "__profile__");
        const addresses = userRows.map(r => {
            const isLegacy = /^\d{3}-?\d{4}$/.test(r[2] ?? "");
            return isLegacy ? legacyRowToAddress(r) : rowToAddress(r);
        });
        return NextResponse.json({ address: addresses[0] ?? null, addresses });
    } catch (err) {
        console.error("[address GET]", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}

// 住所保存（追加・更新）
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const email = session.user.email;
    const body = await req.json();
    const { originalLabel, label, name, postalCode, prefecture, city, street, building, phone, birthday, relation } = body as {
        originalLabel?: string;
        label: string; name: string; postalCode: string; prefecture: string;
        city: string; street: string; building: string; phone: string;
        birthday?: string; relation?: string;
    };

    if (!label?.trim()) return NextResponse.json({ error: "ラベルが必要です" }, { status: 400 });

    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${SHEET_NAME}!A:K` });
        const rows = res.data.values ?? [];
        const rowIndex = findRowIndex(rows, email, originalLabel ?? label);
        const values = [[email, label, name, postalCode, prefecture, city, street, building, phone, birthday ?? "", relation ?? ""]];

        if (rowIndex === -1) {
            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID, range: `${SHEET_NAME}!A:K`,
                valueInputOption: "RAW", requestBody: { values },
            });
        } else {
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID, range: `${SHEET_NAME}!A${rowIndex + 1}:K${rowIndex + 1}`,
                valueInputOption: "RAW", requestBody: { values },
            });
        }
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[address POST]", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}

// 続柄のみ更新
export async function PATCH(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const email = session.user.email;
    const { label, relation } = await req.json() as { label: string; relation: string };

    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${SHEET_NAME}!A:K` });
        const rows = res.data.values ?? [];
        const rowIndex = findRowIndex(rows, email, label);
        if (rowIndex === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID, range: `${SHEET_NAME}!K${rowIndex + 1}`,
            valueInputOption: "RAW", requestBody: { values: [[relation]] },
        });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[address PATCH]", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}

// 住所削除
export async function DELETE(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const email = session.user.email;
    const { label } = await req.json() as { label: string };

    try {
        const sheets = getSheets();
        const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
        const sheetId = meta.data.sheets?.find(s => s.properties?.title === SHEET_NAME)?.properties?.sheetId;
        if (sheetId === undefined) return NextResponse.json({ error: "Sheet not found" }, { status: 500 });

        const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${SHEET_NAME}!A:K` });
        const rows = res.data.values ?? [];
        const rowIndex = findRowIndex(rows, email, label);
        if (rowIndex === -1) return NextResponse.json({ success: true });

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: { requests: [{ deleteDimension: { range: { sheetId, dimension: "ROWS", startIndex: rowIndex, endIndex: rowIndex + 1 } } }] },
        });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[address DELETE]", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
