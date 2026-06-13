import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Heart } from "lucide-react";
import { google } from "googleapis";
import { client } from "@/lib/microcms";
import { Product } from "@/types/microcms";
import localProducts from "@/data/products.json";
import { BADGE_COLORS, DEFAULT_BADGE_COLOR } from "@/lib/badges";

export const dynamic = "force-dynamic";

type InventoryRow = {
    id: string; name: string; price: number | null; hidden: boolean;
    family: string; imageUrl: string; badges: string[]; stock: number; nextShipment: string; cost: number | null;
};

function toTaxIncluded(price: number, cost: number | null): number {
    if (cost === null || cost <= 0) return Math.round(price * 1.08);
    const others = Math.max(0, price - cost);
    return Math.round(cost * 1.08 + others * 1.10);
}

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

async function getFavorites(email: string): Promise<string[]> {
    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
            range: "お気に入り!A:B",
        });
        const rows = res.data.values ?? [];
        const row = rows.find(r => r[0] === email);
        if (!row?.[1]) return [];
        return row[1].split(",").map((s: string) => s.trim()).filter(Boolean);
    } catch { return []; }
}

async function getInventory(): Promise<InventoryRow[]> {
    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
            range: "商品在庫!A:N",
        });
        const rows = res.data.values ?? [];
        return rows.slice(1).filter(r => r[0]).map(r => ({
            id: r[0],
            name: r[1] ?? "",
            stock: r[2] !== undefined && r[2] !== "" ? parseInt(r[2], 10) : -1,
            price: r[3] !== undefined && r[3] !== "" ? parseInt(r[3], 10) : null,
            hidden: r[5] === "1",
            nextShipment: r[7] ?? "",
            badges: r[8] ? r[8].split(",").map((b: string) => b.trim()).filter(Boolean) : [],
            family: r[9]?.trim() ?? "",
            imageUrl: r[10]?.trim() ?? "",
            cost: r[12] !== undefined && r[12] !== "" ? parseInt(r[12], 10) : null,
        }));
    } catch { return []; }
}

async function getProducts(): Promise<Product[]> {
    try {
        const data = await client.getList<Product>({ endpoint: "products", queries: { limit: 100 } });
        if (data.contents.length > 0) return data.contents;
    } catch { /* fallback */ }
    return localProducts as Product[];
}

export default async function FavoritesPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");
    const email = session.user.email!;

    const [favorites, inventory, products] = await Promise.all([
        getFavorites(email), getInventory(), getProducts(),
    ]);

    const productMap = Object.fromEntries(products.map(p => [p.id, p]));

    // お気に入りごとに表示用カードを構築
    type Card = { key: string; href: string; image: string; name: string; price: string; badges: string[]; isSoldOut: boolean };
    const cards: Card[] = [];

    for (const fav of favorites) {
        if (fav.startsWith("family:")) {
            const familyName = fav.slice("family:".length);
            const familyRows = inventory.filter(r => r.family === familyName && !r.hidden);
            if (familyRows.length === 0) continue;
            const rep = familyRows.find(r => !(r.stock !== -1 && r.stock === 0)) ?? familyRows[0];
            const prices = familyRows.map(r => {
                const p = r.price ?? productMap[r.id]?.price;
                return p ? toTaxIncluded(p, r.cost) : 0;
            }).filter(Boolean);
            const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
            const allSoldOut = familyRows.every(r => r.stock !== -1 && r.stock === 0);
            const repProduct = productMap[rep.id];
            cards.push({
                key: fav,
                href: `/products/${rep.id}`,
                image: rep.imageUrl || repProduct?.image?.url || "",
                name: familyName,
                price: `¥${minPrice.toLocaleString()}〜`,
                badges: rep.badges,
                isSoldOut: allSoldOut,
            });
        } else {
            const inv = inventory.find(r => r.id === fav);
            const product = productMap[fav];
            if (!inv || inv.hidden) continue;
            const price = inv.price ?? product?.price ?? 0;
            const priceTaxed = toTaxIncluded(price, inv.cost);
            cards.push({
                key: fav,
                href: `/products/${fav}`,
                image: inv.imageUrl || product?.image?.url || "",
                name: inv.name || product?.name || fav,
                price: `¥${priceTaxed.toLocaleString()}`,
                badges: inv.badges,
                isSoldOut: inv.stock !== -1 && inv.stock === 0,
            });
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-stone-50">
            <Header />
            <main className="flex-1 py-16">
                <div className="container mx-auto px-4 md:px-6 max-w-5xl">
                    <Link href="/mypage" className="flex items-center gap-1 text-stone-500 hover:text-stone-700 text-sm mb-6">
                        <ChevronLeft className="w-4 h-4" />
                        マイページに戻る
                    </Link>
                    <h1 className="text-2xl font-bold text-stone-900 mb-8 flex items-center gap-2">
                        <Heart className="w-6 h-6 fill-red-500 text-red-500" />
                        お気に入り
                    </h1>

                    {cards.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                            <Heart className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                            <p className="text-stone-500 mb-4">お気に入りはまだありません</p>
                            <Link href="/products" className="inline-block bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-primary/90 transition-colors">
                                商品を探す
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cards.map(card => (
                                <Link href={card.href} key={card.key} className={`group ${card.isSoldOut ? "opacity-70" : ""}`}>
                                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                        <div className="relative aspect-square bg-stone-100">
                                            {card.image ? (
                                                <Image src={card.image} alt={card.name} fill className="object-contain group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-stone-400">No Image</div>
                                            )}
                                            {card.isSoldOut && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <span className="bg-white text-stone-900 text-sm font-bold px-4 py-2 rounded-full">売り切れ</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <div className="flex justify-end mb-2">
                                                <span className="font-bold text-lg text-stone-900">{card.price}</span>
                                            </div>
                                            {card.badges.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-1">
                                                    {card.badges.map(badge => (
                                                        <span key={badge} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${BADGE_COLORS[badge] ?? DEFAULT_BADGE_COLOR}`}>{badge}</span>
                                                    ))}
                                                </div>
                                            )}
                                            <h2 className="font-bold text-stone-900 line-clamp-2 group-hover:text-primary transition-colors">{card.name}</h2>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
