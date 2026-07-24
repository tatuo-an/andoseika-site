import { NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const SPREADSHEET_ID = process.env.LINE_ORDER_SPREADSHEET_ID!;

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

export type LineUserInfo = { name: string; address: string; phone: string; email: string };

export type SingleLineOrder = {
    kind: "single";
    orderId: string;
    lineId: string;
    name: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    status: string;
    orderedAt: string;
    desiredDate: string;
    desiredTime: string;
    phone: string;
    address: string;
    email: string;
};

export type BulkOrderItem = {
    date: string;
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    taxRate: number;
    category: string;
};

export type BulkLineOrder = {
    kind: "bulk";
    orderId: string;
    createdAt: string;
    lineId: string;
    clientName: string;
    honorific: string;
    subject: string;
    billingDate: string;
    dueDate: string;
    note: string;
    status: string;
    freeeInvoiceNumber: string;
    freeeInvoiceId: string;
    phone: string;
    address: string;
    email: string;
    items: BulkOrderItem[];
    total: number;
};

export type LineOrderEntry = SingleLineOrder | BulkLineOrder;

export async function GET() {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!SPREADSHEET_ID) {
        return NextResponse.json({ error: "LINE_ORDER_SPREADSHEET_ID is not configured" }, { status: 500 });
    }

    try {
        const sheets = getSheets();
        const [singleRes, bulkRes, detailRes, userRes] = await Promise.all([
            sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "注文!A:K" }),
            sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "大口注文!A:L" }),
            sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "大口注文明細!A:H" }),
            sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "ユーザー!A:F" }),
        ]);

        const userRows = (userRes.data.values ?? []).slice(1);
        const userMap = new Map<string, LineUserInfo>();
        for (const r of userRows) {
            if (!r[0]) continue;
            userMap.set(r[0], { name: r[1] ?? "", address: r[2] ?? "", phone: r[3] ?? "", email: r[4] ?? "" });
        }

        const singleRows = (singleRes.data.values ?? []).slice(1).filter((r) => r[0]);
        const singleOrders: SingleLineOrder[] = singleRows.map((r) => {
            const user = userMap.get(r[1] ?? "");
            return {
                kind: "single",
                orderId: r[0] ?? "",
                lineId: r[1] ?? "",
                name: r[2] ?? "",
                productName: r[3] ?? "",
                quantity: parseInt(r[4] ?? "0", 10) || 0,
                unitPrice: parseInt(r[5] ?? "0", 10) || 0,
                subtotal: parseInt(r[6] ?? "0", 10) || 0,
                status: r[7] ?? "",
                orderedAt: r[8] ?? "",
                desiredDate: r[9] ?? "",
                desiredTime: r[10] ?? "",
                phone: user?.phone ?? "",
                address: user?.address ?? "",
                email: user?.email ?? "",
            };
        });

        const detailRows = (detailRes.data.values ?? []).slice(1).filter((r) => r[0]);
        const detailsByOrderId = new Map<string, BulkOrderItem[]>();
        for (const r of detailRows) {
            const orderId = r[0];
            const item: BulkOrderItem = {
                date: r[1] ?? "",
                name: r[2] ?? "",
                quantity: parseFloat(r[3] ?? "0") || 0,
                unit: r[4] ?? "",
                unitPrice: parseInt(r[5] ?? "0", 10) || 0,
                taxRate: parseInt(r[6] ?? "0", 10) || 0,
                category: r[7] ?? "",
            };
            const arr = detailsByOrderId.get(orderId) ?? [];
            arr.push(item);
            detailsByOrderId.set(orderId, arr);
        }

        const bulkRows = (bulkRes.data.values ?? []).slice(1).filter((r) => r[0]);
        const bulkOrders: BulkLineOrder[] = bulkRows.map((r) => {
            const orderId = r[0] ?? "";
            const items = detailsByOrderId.get(orderId) ?? [];
            const total = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
            const user = userMap.get(r[2] ?? "");
            return {
                kind: "bulk",
                orderId,
                createdAt: r[1] ?? "",
                lineId: r[2] ?? "",
                clientName: r[3] ?? "",
                honorific: r[4] ?? "",
                subject: r[5] ?? "",
                billingDate: r[6] ?? "",
                dueDate: r[7] ?? "",
                note: r[8] ?? "",
                status: r[9] ?? "",
                freeeInvoiceNumber: r[10] ?? "",
                freeeInvoiceId: r[11] ?? "",
                phone: user?.phone ?? "",
                address: user?.address ?? "",
                email: user?.email ?? "",
                items,
                total,
            };
        });

        const orders: LineOrderEntry[] = [...singleOrders, ...bulkOrders].sort((a, b) => {
            const aDate = a.kind === "single" ? a.orderedAt : a.createdAt;
            const bDate = b.kind === "single" ? b.orderedAt : b.createdAt;
            return bDate.localeCompare(aDate);
        });

        return NextResponse.json({ orders });
    } catch (err) {
        console.error("[line-orders GET]", err);
        return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
    }
}
