
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Truck } from "lucide-react";
import { client } from "@/lib/microcms";
import { Product } from "@/types/microcms";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import localProducts from "@/data/products.json";
import { Metadata } from "next";
import { google } from "googleapis";
import { BADGE_COLORS, DEFAULT_BADGE_COLOR } from "@/lib/badges";

export const revalidate = 60;

type SheetRow = { id: string; name: string; stock: number; price: number | null; hidden: boolean; deleted: boolean; nextShipment: string; badges: string[]; family: string };
type VariationInfo = { id: string; label: string; price: number; isSoldOut: boolean };

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

async function getInventoryData(id: string): Promise<{
    stock: number; price: number | null; hidden: boolean; deleted: boolean; nextShipment: string; badges: string[]; family: string;
    familyRows: SheetRow[];
}> {
    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
            range: "商品在庫!A:J",
        });
        const rows = res.data.values ?? [];
        const allRows: SheetRow[] = rows.slice(1).filter(r => r[0]).map(r => ({
            id: r[0],
            name: r[1] ?? "",
            stock: r[2] !== undefined && r[2] !== "" ? parseInt(r[2], 10) : -1,
            price: r[3] !== undefined && r[3] !== "" ? parseInt(r[3], 10) : null,
            hidden: r[5] === "1",
            deleted: false,
            nextShipment: r[7] ?? "",
            badges: r[8] ? r[8].split(",").map((b: string) => b.trim()).filter(Boolean) : [],
            family: r[9]?.trim() ?? "",
        }));

        const row = allRows.find(r => r.id === id);
        if (!row) return { stock: -1, price: null, hidden: false, deleted: false, nextShipment: "", badges: [], family: "", familyRows: [] };

        const familyRows = row.family
            ? allRows.filter(r => r.family === row.family && !r.hidden)
            : [];

        return {
            stock: row.stock,
            price: row.price,
            hidden: row.hidden,
            deleted: row.deleted,
            nextShipment: row.nextShipment,
            badges: row.badges,
            family: row.family,
            familyRows,
        };
    } catch {
        return { stock: -1, price: null, hidden: false, deleted: false, nextShipment: "", badges: [], family: "", familyRows: [] };
    }
}

/** ラベル抽出: 全バリエーション名の共通プレフィックスを除いた部分 */
function extractLabel(allNames: string[], name: string): string {
    if (allNames.length <= 1) return name;
    let prefix = allNames[0];
    for (const n of allNames.slice(1)) {
        while (prefix && !n.startsWith(prefix)) prefix = prefix.slice(0, -1);
    }
    const label = name.slice(prefix.length).trim();
    return label || name;
}

/** kg/g 単位から100g単価を計算 */
function pricePerUnit(label: string, price: number): string | null {
    const kg = label.match(/(\d+(?:\.\d+)?)\s*kg/i);
    if (kg) {
        const g = parseFloat(kg[1]) * 1000;
        return `¥${Math.round(price / g)} / g`;
    }
    const g = label.match(/(\d+)\s*g/i);
    if (g) {
        const grams = parseInt(g[1]);
        return `¥${Math.round(price / grams)} / g`;
    }
    return null;
}

async function buildVariations(familyRows: SheetRow[]): Promise<VariationInfo[]> {
    if (familyRows.length <= 1) return [];

    // シートに価格がないものはMicroCMSから取得
    const needFetch = familyRows.filter(r => r.price === null);
    let microPrices: Record<string, number> = {};
    if (needFetch.length > 0) {
        try {
            const data = await client.getList<Product>({ endpoint: "products", queries: { limit: 100 } });
            microPrices = Object.fromEntries(data.contents.map(p => [p.id, p.price]));
        } catch { /* ignore */ }
    }

    const allNames = familyRows.map(r => r.name);
    return familyRows.map(r => ({
        id: r.id,
        label: extractLabel(allNames, r.name),
        price: r.price ?? microPrices[r.id] ?? 0,
        isSoldOut: r.stock !== -1 && r.stock === 0,
    }));
}

async function getProduct(id: string): Promise<Product | null> {
    let data: Product | null = null;
    try {
        data = await client.get<Product>({ endpoint: "products", contentId: id });
    } catch { /* ignore */ }

    if (data) {
        if (!data.image) {
            const localMatch = localProducts.find((p: any) => data!.name.includes(p.name) || p.name.includes(data!.name));
            if (localMatch) return { ...data, image: { url: localMatch.image.url, height: 800, width: 800 } };
        }
        return data;
    }

    const localMatch = localProducts.find((p: any) => p.id === id);
    if (localMatch) {
        return {
            ...localMatch,
            image: { url: localMatch.image.url, height: localMatch.image.height, width: localMatch.image.width },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString(),
            revisedAt: new Date().toISOString(),
        } as Product;
    }
    return null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const product = await getProduct(id);
    if (!product) return { title: "商品が見つかりません" };
    return {
        title: product.name,
        description: product.description,
        openGraph: { title: product.name, description: product.description, images: [product.image?.url || ""] },
    };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [product, invData] = await Promise.all([getProduct(id), getInventoryData(id)]);
    const { stock, price: invPrice, hidden, deleted, nextShipment, badges, familyRows } = invData;
    const isSoldOut = stock !== -1 && stock === 0;

    if (!product || hidden || deleted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <p className="text-stone-500">商品が見つかりませんでした。</p>
            </div>
        );
    }

    const variations = await buildVariations(familyRows);
    const currentVariation = variations.find(v => v.id === id);

    return (
        <div className="min-h-screen bg-stone-50 py-12">
            <div className="container mx-auto px-4 md:px-6">
                <Link href="/products" className="inline-flex items-center text-stone-500 hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    商品一覧に戻る
                </Link>

                <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
                    <div className="grid md:grid-cols-2 gap-0">
                        {/* Image */}
                        <div className="relative aspect-square md:aspect-auto md:h-full bg-stone-100">
                            {product.image ? (
                                <Image src={product.image.url} alt={product.name} fill className="object-cover" priority />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-400">No Image</div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-8 md:p-12 flex flex-col justify-center">
                            <div className="mb-6">
                                <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4">
                                    {product.category}
                                </span>
                                {badges.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {badges.map((badge) => (
                                            <span key={badge} className={`text-xs px-2.5 py-1 rounded-full border font-medium ${BADGE_COLORS[badge] ?? DEFAULT_BADGE_COLOR}`}>
                                                {badge}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4 font-heading">
                                    {invData.family || product.name}
                                </h1>
                                <p className="text-2xl font-bold text-primary">
                                    ¥{product.price.toLocaleString()}
                                    <span className="text-sm text-stone-500 font-normal ml-2">（税込）</span>
                                </p>
                            </div>

                            {/* バリエーション選択 */}
                            {variations.length > 1 && (
                                <div className="mb-6">
                                    <p className="text-sm font-bold text-stone-600 mb-2">
                                        サイズ：<span className="text-primary">{currentVariation?.label ?? ""}</span>
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {variations.map((v) => {
                                            const isSelected = v.id === id;
                                            const perUnit = pricePerUnit(v.label, v.price);
                                            return (
                                                <Link
                                                    key={v.id}
                                                    href={`/products/${v.id}`}
                                                    className={`flex flex-col items-center px-3 py-2 rounded-xl border-2 text-sm min-w-[72px] transition-all
                                                        ${isSelected
                                                            ? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
                                                            : v.isSoldOut
                                                                ? "border-stone-200 text-stone-300 bg-stone-50 cursor-not-allowed pointer-events-none"
                                                                : "border-stone-200 text-stone-700 hover:border-primary/50 hover:bg-stone-50"
                                                        }`}
                                                >
                                                    <span className="font-bold">{v.label}</span>
                                                    <span className="text-xs mt-0.5">{v.isSoldOut ? "売り切れ" : `¥${v.price.toLocaleString()}`}</span>
                                                    {perUnit && !v.isSoldOut && (
                                                        <span className="text-[10px] text-stone-400 mt-0.5">({perUnit})</span>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="prose prose-stone mb-8">
                                <p className="text-stone-600 leading-relaxed">{product.description}</p>
                            </div>

                            <div className="space-y-6 border-t border-stone-100 pt-8">
                                <div className="flex items-center gap-4 text-sm text-stone-600">
                                    <div className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" />
                                        <span>産地直送</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Truck className="h-4 w-4 text-primary" />
                                        <span>全国配送対応</span>
                                    </div>
                                </div>

                                {isSoldOut ? (
                                    <div>
                                        <div className="w-full md:w-auto px-12 py-4 rounded-full font-bold text-lg bg-stone-200 text-stone-400 text-center cursor-not-allowed">
                                            売り切れ
                                        </div>
                                        {nextShipment && (
                                            <p className="text-sm text-stone-500 mt-2 text-center">
                                                次回入荷予定: {nextShipment}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <AddToCartButton product={product} price={invPrice ?? undefined} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
