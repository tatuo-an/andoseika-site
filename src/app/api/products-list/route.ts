import { NextResponse } from "next/server";
import { google } from "googleapis";
import { client } from "@/lib/microcms";
import { Product } from "@/types/microcms";
import localProducts from "@/data/products.json";
import { isSaleActive, calcSalePrice } from "@/lib/sale";

export const dynamic = "force-dynamic";

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

export async function GET() {
    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
            range: "商品在庫!A:Z",
        });
        const rows = res.data.values ?? [];
        const inventory = rows.slice(1).filter(r => r[0]).map(r => ({
            id: r[0] ?? "",
            name: r[1] ?? "",
            stock: r[2] !== undefined && r[2] !== "" ? parseInt(r[2], 10) : -1,
            price: r[3] !== undefined && r[3] !== "" ? parseInt(r[3], 10) : null,
            hidden: r[5] === "1",
            family: r[9]?.trim() ?? "",
            imageUrl: r[10]?.trim() ?? "",
            familyImages: r[11] ? r[11].split(",").map((s: string) => s.trim()).filter(Boolean) : [],
            cost: r[12] !== undefined && r[12] !== "" ? parseInt(r[12], 10) : null,
            salePercent: r[18] !== undefined && r[18] !== "" ? parseInt(r[18], 10) : 0,
            saleStart: r[19] ?? "",
            saleEnd: r[20] ?? "",
            limitedOnly: r[25] === "1",
        }));

        // MicroCMS取得
        let products: Product[] = [];
        try {
            const data = await client.getList<Product>({ endpoint: "products", queries: { orders: "order", limit: 100 } });
            products = data.contents.length > 0 ? data.contents : (localProducts as Product[]);
        } catch { products = localProducts as Product[]; }
        const productMap = Object.fromEntries(products.map(p => [p.id, p]));

        // ファミリーは代表のみ返す
        type Card = {
            id: string; href: string; name: string; image: string;
            displayPrice: number; salePercent: number; isSoldOut: boolean;
            family: string; limitedOnly: boolean;
        };
        const cards: Card[] = [];
        const seenFamilies = new Set<string>();
        for (const inv of inventory) {
            if (inv.hidden) continue;
            const product = productMap[inv.id];
            if (inv.family) {
                if (seenFamilies.has(inv.family)) continue;
                seenFamilies.add(inv.family);
                const familyInvs = inventory.filter(x => x.family === inv.family && !x.hidden);
                const prices = familyInvs.map(x => {
                    const p = x.price ?? productMap[x.id]?.price;
                    if (!p) return 0;
                    const taxed = toTaxIncluded(p, x.cost);
                    const active = isSaleActive(x.salePercent, x.saleStart, x.saleEnd);
                    return active ? calcSalePrice(taxed, x.salePercent) : taxed;
                }).filter(Boolean);
                const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                const rep = familyInvs.find(x => !(x.stock !== -1 && x.stock === 0)) ?? familyInvs[0];
                const allSoldOut = familyInvs.every(x => x.stock !== -1 && x.stock === 0);
                const repOnSale = isSaleActive(rep.salePercent, rep.saleStart, rep.saleEnd);
                const familyLimited = familyInvs.some(x => x.limitedOnly);
                cards.push({
                    id: `family:${inv.family}`,
                    href: `/products/${rep.id}`,
                    name: inv.family,
                    image: rep.familyImages[0] || rep.imageUrl || productMap[rep.id]?.image?.url || "",
                    displayPrice: minPrice,
                    salePercent: repOnSale ? rep.salePercent : 0,
                    isSoldOut: allSoldOut,
                    family: inv.family,
                    limitedOnly: familyLimited,
                });
            } else {
                if (!product) continue;
                const p = inv.price ?? product.price;
                const taxed = toTaxIncluded(p, inv.cost);
                const active = isSaleActive(inv.salePercent, inv.saleStart, inv.saleEnd);
                const displayPrice = active ? calcSalePrice(taxed, inv.salePercent) : taxed;
                cards.push({
                    id: inv.id,
                    href: `/products/${inv.id}`,
                    name: inv.name || product.name,
                    image: inv.imageUrl || product.image?.url || "",
                    displayPrice,
                    salePercent: active ? inv.salePercent : 0,
                    isSoldOut: inv.stock !== -1 && inv.stock === 0,
                    family: "",
                    limitedOnly: inv.limitedOnly,
                });
            }
        }

        return NextResponse.json({ products: cards });
    } catch (err) {
        console.error("[products-list GET]", err);
        return NextResponse.json({ products: [] });
    }
}
