
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Truck, CalendarCheck } from "lucide-react";
import { client } from "@/lib/microcms";
import { Product } from "@/types/microcms";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { ProductImageSlideshow } from "@/components/products/ProductImageSlideshow";
import { FavoriteButton } from "@/components/products/FavoriteButton";
import localProducts from "@/data/products.json";
import { Metadata } from "next";
import { google } from "googleapis";
import { BADGE_COLORS, DEFAULT_BADGE_COLOR } from "@/lib/badges";
import { isSaleActive, calcSalePrice } from "@/lib/sale";
import { computeShipSchedule } from "@/lib/shipSchedule";
import { EXTRA_FIELDS, parseExtra } from "@/lib/extraDescriptions";

export const revalidate = 60;

type SheetRow = { id: string; name: string; stock: number; price: number | null; shipType: string; hidden: boolean; deleted: boolean; nextShipment: string; badges: string[]; family: string; imageUrl: string; familyImages: string[]; cost: number | null; profitRate: number | null; coolAvailable: boolean; description: string; clickpostMax: number; options: string; salePercent: number; saleStart: string; saleEnd: string; shipMode: string; shipValue: string; extraDescriptions: string };
type VariationInfo = { id: string; label: string; price: number; priceTaxed: number; salePercent: number; saleStart: string; saleEnd: string; isSoldOut: boolean };

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
    stock: number; price: number | null; name: string; shipType: string; hidden: boolean; deleted: boolean; nextShipment: string; badges: string[]; family: string; imageUrl: string; familyImages: string[]; cost: number | null; profitRate: number | null; coolAvailable: boolean; description: string; clickpostMax: number; options: string; salePercent: number; saleStart: string; saleEnd: string; shipMode: string; shipValue: string; extraDescriptions: string;
    familyRows: SheetRow[];
}> {
    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
            range: "商品在庫!A:AA",
        });
        const rows = res.data.values ?? [];
        const allRows: SheetRow[] = rows.slice(1).filter(r => r[0]).map(r => ({
            id: r[0],
            name: r[1] ?? "",
            stock: r[2] !== undefined && r[2] !== "" ? parseInt(r[2], 10) : -1,
            price: r[3] !== undefined && r[3] !== "" ? parseInt(r[3], 10) : null,
            shipType: r[4] ?? "",
            hidden: r[5] === "1",
            deleted: false,
            nextShipment: r[7] ?? "",
            badges: r[8] ? r[8].split(",").map((b: string) => b.trim()).filter(Boolean) : [],
            family: r[9]?.trim() ?? "",
            imageUrl: r[10]?.trim() ?? "",
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
            extraDescriptions: r[26] ?? "",
        }));

        const row = allRows.find(r => r.id === id);
        if (!row) return { stock: -1, price: null, name: "", shipType: "", hidden: false, deleted: false, nextShipment: "", badges: [], family: "", imageUrl: "", familyImages: [], cost: null, profitRate: null, coolAvailable: false, description: "", clickpostMax: 0, options: "", salePercent: 0, saleStart: "", saleEnd: "", shipMode: "", shipValue: "", extraDescriptions: "", familyRows: [] };

        const familyRows = row.family
            ? allRows.filter(r => r.family === row.family && !r.hidden)
            : [];

        return {
            stock: row.stock,
            price: row.price,
            name: row.name,
            shipType: row.shipType,
            hidden: row.hidden,
            deleted: row.deleted,
            nextShipment: row.nextShipment,
            badges: row.badges,
            family: row.family,
            imageUrl: row.imageUrl,
            familyImages: row.familyImages,
            cost: row.cost,
            profitRate: row.profitRate,
            coolAvailable: row.coolAvailable,
            description: row.description,
            clickpostMax: row.clickpostMax,
            options: row.options,
            salePercent: row.salePercent,
            saleStart: row.saleStart,
            saleEnd: row.saleEnd,
            shipMode: row.shipMode,
            shipValue: row.shipValue,
            extraDescriptions: row.extraDescriptions,
            familyRows,
        };
    } catch {
        return { stock: -1, price: null, name: "", shipType: "", hidden: false, deleted: false, nextShipment: "", badges: [], family: "", imageUrl: "", familyImages: [], cost: null, profitRate: null, coolAvailable: false, description: "", clickpostMax: 0, options: "", salePercent: 0, saleStart: "", saleEnd: "", shipMode: "", shipValue: "", extraDescriptions: "", familyRows: [] };
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

/** 販売価格を税込みに変換: 本体(原価)8%, 送料+サービス料(残り)10% */
function toTaxIncluded(price: number, cost: number | null): number {
    if (cost === null || cost <= 0) return Math.round(price * 1.08);
    const others = Math.max(0, price - cost);
    return Math.round(cost * 1.08 + others * 1.10);
}

/** ラベルから「単量×本数」を読み取り、合計内容量の表示文字列を返す */
function totalContent(label: string): string | null {
    const m = label.match(/(\d+(?:\.\d+)?)\s*(kg|g)\s*[×x✕]\s*(\d+)\s*本/i);
    if (!m) return null;
    const unitValue = parseFloat(m[1]);
    const unit = m[2].toLowerCase();
    const count = parseInt(m[3], 10);
    if (!isFinite(unitValue) || !isFinite(count) || count <= 0) return null;
    const totalInGrams = (unit === "kg" ? unitValue * 1000 : unitValue) * count;
    const display = unit === "kg" && totalInGrams >= 1000
        ? `${(totalInGrams / 1000).toString()}kg`
        : `${totalInGrams}g`;
    return `合計${display}`;
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
    return familyRows.map(r => {
        const price = r.price ?? microPrices[r.id] ?? 0;
        return {
            id: r.id,
            label: extractLabel(allNames, r.name),
            price,
            priceTaxed: toTaxIncluded(price, r.cost),
            salePercent: r.salePercent,
            saleStart: r.saleStart,
            saleEnd: r.saleEnd,
            isSoldOut: r.stock !== -1 && r.stock === 0,
        };
    });
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

/** 本文と同じフォールバック順で商品を解決する（メタデータと表示の判定を一致させる） */
async function resolveProductForDisplay(id: string): Promise<{ product: Product | null; hidden: boolean; deleted: boolean }> {
    const [direct, inv] = await Promise.all([getProduct(id), getInventoryData(id)]);
    let product = direct;

    // ファミリーの兄弟商品から MicroCMS データを流用
    if (!product && inv.familyRows.length > 0) {
        for (const row of inv.familyRows) {
            if (row.id !== id) {
                const rep = await getProduct(row.id);
                if (rep) { product = rep; break; }
            }
        }
    }

    // ファミリー全員が MicroCMS 未登録 → 在庫シートから擬似 Product を構築
    if (!product && inv.family) {
        const now = new Date().toISOString();
        product = {
            id,
            name: inv.family,
            category: "processed",
            price: inv.price ?? 0,
            description: inv.description || "",
            image: { url: inv.imageUrl || inv.familyImages[0] || "", width: 800, height: 800 },
            createdAt: now,
            updatedAt: now,
            publishedAt: now,
            revisedAt: now,
        } as Product;
    }

    return { product, hidden: inv.hidden, deleted: inv.deleted };
}

const FALLBACK_DESCRIPTION = "鳥取県の安藤青果がお届けする商品です。商品の内容や発送情報をご確認いただけます。";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const { product, hidden, deleted } = await resolveProductForDisplay(id);
    if (!product || hidden || deleted) return { title: "商品が見つかりません" };

    const description = (product.description ?? "").trim() || FALLBACK_DESCRIPTION;
    const imageUrl = product.image?.url || "";
    return {
        title: product.name,
        description,
        openGraph: {
            title: product.name,
            description,
            images: imageUrl ? [imageUrl] : undefined,
        },
        twitter: {
            card: "summary_large_image",
            title: product.name,
            description,
            images: imageUrl ? [imageUrl] : undefined,
        },
    };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [productDirect, invData] = await Promise.all([getProduct(id), getInventoryData(id)]);
    const { stock, price: invPrice, name: invName, shipType, hidden, deleted, nextShipment, badges, familyRows, imageUrl: invImageUrl, familyImages, cost: invCost, profitRate: invProfitRate, coolAvailable: invCoolAvailable } = invData;

    const isSoldOut = stock !== -1 && stock === 0;

    // custom-ID など MicroCMS にない場合、同じファミリーの代表商品データを流用
    let product = productDirect;
    if (!product && familyRows.length > 0) {
        for (const row of familyRows) {
            if (row.id !== id) {
                const rep = await getProduct(row.id);
                if (rep) { product = rep; break; }
            }
        }
    }

    // ファミリー全員がMicroCMS未登録 → シートデータだけで擬似Productを構築
    if (!product && invData.family) {
        const now = new Date().toISOString();
        product = {
            id,
            name: invData.family,
            category: "processed",
            price: invPrice ?? 0,
            description: invData.description || "",
            image: { url: invImageUrl || invData.familyImages[0] || "", width: 800, height: 800 },
            createdAt: now,
            updatedAt: now,
            publishedAt: now,
            revisedAt: now,
        } as Product;
    }

    if (!product || hidden || deleted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <p className="text-stone-500">商品が見つかりませんでした。</p>
            </div>
        );
    }

    const variations = await buildVariations(familyRows);
    const currentVariation = variations.find(v => v.id === id);

    // スライドショー用画像配列: バリエーション個別画像(先頭) + ファミリーギャラリー + MicroCMS画像(フォールバック)
    const slideImages = Array.from(new Set(
        [invImageUrl, ...familyImages].filter(Boolean)
    )) as string[];
    const displayImages = slideImages.length > 0 ? slideImages : (product.image?.url ? [product.image.url] : []);

    // カート表示名: ファミリー名 + バリエーションラベル（なければシート名）
    const cartName = invData.family
        ? `${invData.family}${currentVariation?.label ? ` ${currentVariation.label}` : ""}`
        : invName || product.name;

    return (
        <div className="min-h-screen flex flex-col bg-stone-50">
            <Header />
            <main className="flex-1 py-12">
            <div className="container mx-auto px-4 md:px-6">
                <Link href="/products" className="inline-flex items-center text-stone-500 hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    商品一覧に戻る
                </Link>

                <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
                    <div className="grid md:grid-cols-2 gap-0">
                        {/* Image slideshow */}
                        <div className="p-4 md:p-0 max-w-sm mx-auto md:max-w-none w-full relative">
                            {isSaleActive(invData.salePercent, invData.saleStart, invData.saleEnd) && (
                                <span className="absolute top-6 right-6 md:top-3 md:right-3 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg z-20">
                                    {invData.salePercent}% OFF
                                </span>
                            )}
                            <ProductImageSlideshow images={displayImages} alt={product.name} />
                        </div>

                        {/* Content */}
                        <div className="p-8 md:p-12 flex flex-col justify-center">
                            <div className="mb-6">
                                {badges.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {badges.map((badge) => (
                                            <span key={badge} className={`text-xs px-2.5 py-1 rounded-full border font-medium ${BADGE_COLORS[badge] ?? DEFAULT_BADGE_COLOR}`}>
                                                {badge}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <h1 className="text-3xl md:text-4xl font-bold text-stone-900 font-heading">
                                        {invData.family || product.name}
                                    </h1>
                                    <FavoriteButton
                                        productId={invData.family ? `family:${invData.family}` : product.id}
                                        size="lg"
                                        className="flex-shrink-0 mt-1"
                                    />
                                </div>
                                {(() => {
                                    const normalTaxed = currentVariation?.priceTaxed ?? toTaxIncluded(invPrice ?? product.price, invCost);
                                    const onSale = isSaleActive(invData.salePercent, invData.saleStart, invData.saleEnd);
                                    const displayTaxed = onSale ? calcSalePrice(normalTaxed, invData.salePercent) : normalTaxed;
                                    return (
                                        <p className="text-2xl font-bold text-primary flex items-baseline gap-3 flex-wrap">
                                            {onSale && (
                                                <>
                                                    <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">{invData.salePercent}% OFF</span>
                                                    <span className="text-base text-stone-400 line-through font-normal">¥{normalTaxed.toLocaleString()}</span>
                                                </>
                                            )}
                                            <span className={onSale ? "text-red-500" : ""}>¥{displayTaxed.toLocaleString()}</span>
                                            <span className="text-sm text-stone-500 font-normal">（税込）</span>
                                        </p>
                                    );
                                })()}
                                <div className="mt-3 bg-stone-50 border border-stone-100 rounded-lg p-3 text-xs text-stone-500 leading-relaxed space-y-2">
                                    <p>
                                        表示価格は、1点のみ購入した場合の<span className="font-medium text-stone-700">商品代・送料・サービス料を含む税込総額</span>です。
                                    </p>
                                    <p>
                                        複数商品を同梱する場合は、合計重量に応じて送料等を再計算し、カート内で<span className="font-medium text-emerald-600">同梱割引</span>を適用します。
                                    </p>
                                    <p className="text-stone-400">
                                        ※お届け地域により追加送料が発生する場合があります。最終金額はカートでご確認ください。
                                    </p>
                                </div>
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
                                            const vOnSale = isSaleActive(v.salePercent, v.saleStart, v.saleEnd);
                                            const vDisplayPrice = vOnSale ? calcSalePrice(v.priceTaxed, v.salePercent) : v.priceTaxed;
                                            const totalLabel = totalContent(v.label);
                                            return (
                                                <Link
                                                    key={v.id}
                                                    href={`/products/${v.id}`}
                                                    scroll={false}
                                                    className={`flex flex-col items-center px-3 py-2 rounded-xl border-2 text-sm min-w-[72px] transition-all
                                                        ${isSelected
                                                            ? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
                                                            : v.isSoldOut
                                                                ? "border-stone-200 text-stone-300 bg-stone-50 cursor-not-allowed pointer-events-none"
                                                                : "border-stone-200 text-stone-700 hover:border-primary/50 hover:bg-stone-50"
                                                        }`}
                                                >
                                                    <span className="font-bold">{v.label}</span>
                                                    <span className={`text-xs mt-0.5 ${vOnSale && !v.isSoldOut ? "text-red-500 font-bold" : ""}`}>{v.isSoldOut ? "売り切れ" : `¥${vDisplayPrice.toLocaleString()}`}</span>
                                                    {totalLabel && !v.isSoldOut && (
                                                        <span className="text-[10px] text-stone-400 mt-0.5">({totalLabel})</span>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="prose prose-stone mb-8">
                                <p className="text-stone-600 leading-relaxed whitespace-pre-wrap">{invData.description || product.description}</p>
                            </div>

                            {(() => {
                                const extra = parseExtra(invData.extraDescriptions);
                                const filled = EXTRA_FIELDS.filter((f) => (extra[f.key] ?? "").trim());
                                if (filled.length === 0) return null;
                                return (
                                    <div className="mb-8 space-y-4 border-t border-stone-100 pt-6">
                                        {filled.map(({ key, label }) => (
                                            <div key={key}>
                                                <h3 className="text-sm font-bold text-stone-900 mb-1.5">{label}</h3>
                                                <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">{extra[key]}</p>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}

                            <div className="space-y-6 border-t border-stone-100 pt-8">
                                {(() => {
                                    const sched = computeShipSchedule(invData.shipMode, invData.shipValue);
                                    if (!sched) return null;
                                    return (
                                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-stone-700">
                                                <Truck className="h-4 w-4 text-primary" />
                                                <span>{sched.shippingLabel}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm font-medium text-primary">
                                                <CalendarCheck className="h-4 w-4" />
                                                <span>{sched.deliveryLabel}</span>
                                            </div>
                                        </div>
                                    );
                                })()}
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
                                    (() => {
                                        const onSale = isSaleActive(invData.salePercent, invData.saleStart, invData.saleEnd);
                                        return (
                                            <AddToCartButton
                                                product={product}
                                                variantId={id}
                                                variantName={cartName}
                                                price={invPrice ?? undefined}
                                                shipType={shipType}
                                                imageUrl={invImageUrl || undefined}
                                                family={invData.family || undefined}
                                                cost={invCost}
                                                profitRate={invProfitRate}
                                                coolAvailable={invCoolAvailable}
                                                clickpostMax={invData.clickpostMax}
                                                familyOptions={invData.options}
                                                salePercent={onSale ? invData.salePercent : 0}
                                                shipMode={invData.shipMode}
                                                shipValue={invData.shipValue}
                                            />
                                        );
                                    })()
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </main>
            <Footer />
        </div>
    );
}
