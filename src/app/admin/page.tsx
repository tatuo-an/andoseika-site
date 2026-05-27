import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { client } from "@/lib/microcms";
import { Product } from "@/types/microcms";
import localProducts from "@/data/products.json";
import { AdminPanel } from "@/components/admin/AdminPanel";
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

async function getInventory() {
    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
            range: "商品在庫!A:I",
        });
        const rows = res.data.values ?? [];
        return rows.slice(1).map((r) => ({
            id: r[0] ?? "",
            name: r[1] ?? "",
            stock: r[2] !== undefined && r[2] !== "" ? parseInt(r[2], 10) : -1,
            price: r[3] !== undefined && r[3] !== "" ? parseInt(r[3], 10) : null,
            shipType: r[4] ?? "",
            hidden: r[5] === "1",
            deleted: r[6] === "1",
            nextShipment: r[7] ?? "",
            badges: r[8] ? r[8].split(",").map((b: string) => b.trim()).filter(Boolean) : [],
        }));
    } catch { return []; }
}

function toInt(v: string | undefined) {
    if (v === undefined || v === "") return 0;
    return parseInt(v, 10) || 0;
}

async function getShipping() {
    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
            range: "送料マスタ!A:L",
        });
        const rows = res.data.values ?? [];
        return rows.slice(1).map((r) => ({
            region: r[0] ?? "",
            prefectures: r[1] ?? "",
            s60: toInt(r[2]), s80: toInt(r[3]), s100: toInt(r[4]),
            s120: toInt(r[5]), s140: toInt(r[6]), s160: toInt(r[7]),
            s180: toInt(r[8]), s200: toInt(r[9]),
            compact: toInt(r[10]),
            clickpost: toInt(r[11]),
        }));
    } catch { return []; }
}

async function getProducts(): Promise<Product[]> {
    try {
        const data = await client.getList<Product>({
            endpoint: "products",
            queries: { orders: "order", limit: 100 },
        });
        if (data.contents.length > 0) return data.contents;
    } catch { /* fallback */ }
    return localProducts as Product[];
}

export default async function AdminPage() {
    const session = await auth();
    if (!session?.user || !isAdmin(session.user.email)) redirect("/");

    const [products, inventory, shipping] = await Promise.all([
        getProducts(), getInventory(), getShipping()
    ]);

    return (
        <div className="min-h-screen flex flex-col bg-stone-50">
            <Header />
            <main className="flex-1 py-16">
                <div className="container mx-auto px-4 md:px-6 max-w-5xl">
                    <h1 className="text-3xl font-bold text-stone-900 mb-2">管理画面</h1>
                    <p className="text-stone-500 text-sm mb-8">在庫・価格・送料を管理できます</p>
                    <AdminPanel
                        products={products}
                        initialInventory={inventory}
                        initialShipping={shipping}
                    />
                </div>
            </main>
            <Footer />
        </div>
    );
}
