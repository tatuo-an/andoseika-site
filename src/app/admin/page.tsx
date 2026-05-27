import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { client } from "@/lib/microcms";
import { Product } from "@/types/microcms";
import localProducts from "@/data/products.json";
import { InventoryEditor } from "@/components/admin/InventoryEditor";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

async function getInventoryMap(): Promise<Record<string, number>> {
    try {
        const authClient = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            },
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
        const sheets = google.sheets({ version: "v4", auth: authClient });
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
            range: "商品在庫!A:C",
        });
        const rows = res.data.values ?? [];
        const map: Record<string, number> = {};
        rows.slice(1).forEach((r) => {
            if (r[0]) map[r[0]] = parseInt(r[2] ?? "0", 10);
        });
        return map;
    } catch {
        return {};
    }
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
    if (!session?.user || !isAdmin(session.user.email)) {
        redirect("/");
    }

    const [products, inventoryMap] = await Promise.all([getProducts(), getInventoryMap()]);

    return (
        <div className="min-h-screen flex flex-col bg-stone-50">
            <Header />
            <main className="flex-1 py-16">
                <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                    <h1 className="text-3xl font-bold text-stone-900 mb-2">商品管理</h1>
                    <p className="text-stone-500 text-sm mb-8">在庫数を編集できます。0にすると「売り切れ」表示になります。</p>

                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-stone-100 text-stone-600 text-sm">
                                <tr>
                                    <th className="text-left px-6 py-3">商品名</th>
                                    <th className="text-center px-6 py-3 w-32">在庫数</th>
                                    <th className="text-center px-6 py-3 w-28">状態</th>
                                    <th className="text-center px-6 py-3 w-24">保存</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {products.map((product) => (
                                    <InventoryEditor
                                        key={product.id}
                                        product={product}
                                        initialStock={inventoryMap[product.id] ?? -1}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
