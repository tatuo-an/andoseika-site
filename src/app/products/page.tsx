import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { client } from "@/lib/microcms";
import { Product } from "@/types/microcms";
import { Metadata } from "next";
import localProducts from "@/data/products.json";
import { google } from "googleapis";
import { BADGE_COLORS, DEFAULT_BADGE_COLOR } from "@/lib/badges";
import { FavoriteButton } from "@/components/products/FavoriteButton";

export const metadata: Metadata = {
  title: "商品一覧",
  description: "安藤青果の自慢の野菜と加工品。白ネギ、長芋、里芋、梨、蜂蜜、らっきょうなど、旬の味をお届けします。",
};

export const revalidate = 60;

type InventoryData = {
  stock: number; variantName: string; hidden: boolean;
  nextShipment: string; badges: string[]; family: string; price: number | null; imageUrl: string; cost: number | null; description: string; familyImages: string[];
};

/** 販売価格を税込みに変換: 本体(原価)8%, 送料+サービス料(残り)10% */
function toTaxIncluded(price: number, cost: number | null): number {
    if (cost === null || cost <= 0) return Math.round(price * 1.08);
    const others = Math.max(0, price - cost);
    return Math.round(cost * 1.08 + others * 1.10);
}
type InventoryResult = { map: Record<string, InventoryData>; order: string[] };

async function getInventoryMap(): Promise<InventoryResult> {
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
      range: "商品在庫!A:P",
    });
    const rows = res.data.values ?? [];
    const map: Record<string, InventoryData> = {};
    const order: string[] = [];
    rows.slice(1).forEach((r) => {
      if (r[0]) {
        order.push(r[0]);
        map[r[0]] = {
          stock: r[2] !== undefined && r[2] !== "" ? parseInt(r[2], 10) : -1,
          variantName: r[1] ?? "",   // B列 = バリエーション名
          hidden: r[5] === "1",
          nextShipment: r[7] ?? "",
          badges: r[8] ? r[8].split(",").map((b: string) => b.trim()).filter(Boolean) : [],
          family: r[9]?.trim() ?? "",
          price: r[3] !== undefined && r[3] !== "" ? parseInt(r[3], 10) : null,
          imageUrl: r[10]?.trim() ?? "",
          cost: r[12] !== undefined && r[12] !== "" ? parseInt(r[12], 10) : null,
          familyImages: r[11] ? r[11].split(",").map((s: string) => s.trim()).filter(Boolean) : [],
          description: r[15] ?? "",
        };
      }
    });
    return { map, order };
  } catch {
    return { map: {}, order: [] };
  }
}

async function getProducts(): Promise<Product[]> {
  try {
    const data = await client.getList<Product>({ endpoint: "products", queries: { orders: "order", limit: 100 } });
    if (data.contents.length > 0) return data.contents;
  } catch (error) {
    console.error("Failed to fetch products from MicroCMS:", error);
  }
  return localProducts as Product[];
}

// 表示用カード（単品 or ファミリー代表）
type CardItem =
  | { type: "single"; product: Product; inv: InventoryData }
  | { type: "family"; familyName: string; repProduct: Product | null; repInv: InventoryData; repId: string; minPrice: number; allSoldOut: boolean; category: string };

export default async function ProductsPage() {
  const [products, { map: inventoryMap, order: inventoryOrder }] = await Promise.all([getProducts(), getInventoryMap()]);

  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  // ファミリーごとにグループ化
  const seenFamilies = new Set<string>();
  const cards: CardItem[] = [];

  for (const id of inventoryOrder) {
    const inv = inventoryMap[id];
    if (!inv || inv.hidden) continue;
    const product = productMap[id]; // MicroCMS未登録ならundefined

    if (inv.family) {
      if (seenFamilies.has(inv.family)) continue;
      seenFamilies.add(inv.family);

      const familyIds = inventoryOrder.filter(fid => inventoryMap[fid]?.family === inv.family && !inventoryMap[fid]?.hidden);
      const familyInvs = familyIds.map(fid => ({ id: fid, inv: inventoryMap[fid], product: productMap[fid] as Product | undefined }));

      // 最安値（税込み）
      const prices = familyInvs.map(x => {
        const p = x.inv.price ?? x.product?.price;
        return p ? toTaxIncluded(p, x.inv.cost) : 0;
      }).filter(Boolean) as number[];
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

      const firstAvail = familyInvs.find(x => !(x.inv.stock !== -1 && x.inv.stock === 0));
      const rep = firstAvail ?? familyInvs[0];
      const allSoldOut = familyInvs.every(x => x.inv.stock !== -1 && x.inv.stock === 0);

      // 代表productを探す（先頭で持っているもの、いなければファミリー内で最初に見つかるもの）
      const repProduct: Product | null = rep?.product ?? familyInvs.find(x => x.product)?.product ?? null;

      cards.push({
        type: "family",
        familyName: inv.family,
        repProduct,
        repInv: rep.inv,
        repId: rep.id,
        minPrice,
        allSoldOut,
        category: repProduct?.category ?? "other",
      });
    } else {
      // 単品はMicroCMS必須（フォールバックなし）
      if (!product) continue;
      cards.push({ type: "single", product, inv });
    }
  }

  const getCategory = (c: CardItem) => c.type === "single" ? c.product.category : c.category;
  const rootCards = cards.filter(c => getCategory(c) === "root");
  const leafCards = cards.filter(c => getCategory(c) === "leaf");
  const honeyCards = cards.filter(c => getCategory(c) === "honey");
  const otherCards = cards.filter(c => !["root", "leaf", "honey"].includes(getCategory(c)));

  const renderCard = (card: CardItem) => {
    if (card.type === "single") {
      const { product, inv } = card;
      const isSoldOut = inv.stock !== -1 && inv.stock === 0;
      const displayName = inv.variantName || product.name;
      const imgSrc = inv.imageUrl || product.image?.url;
      return (
        <Link href={`/products/${product.id}`} key={product.id} className={`group ${isSoldOut ? "pointer-events-none" : ""}`}>
          <div className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 ${isSoldOut ? "opacity-70" : ""}`}>
            <div className="relative aspect-square bg-stone-100 overflow-hidden">
              {imgSrc ? (
                <Image src={imgSrc} alt={displayName} fill className="object-contain group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-400">No Image</div>
              )}
              {isSoldOut && (
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
                  <span className="bg-white text-stone-900 text-sm font-bold px-4 py-2 rounded-full">売り切れ</span>
                  {inv.nextShipment && (
                    <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full">次回 {inv.nextShipment}入荷予定</span>
                  )}
                </div>
              )}
              {!isSoldOut && product.isRecommended && (
                <span className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">おすすめ</span>
              )}
              <div className="absolute top-3 left-3">
                <FavoriteButton productId={product.id} size="sm" />
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-end mb-2">
                <span className="font-bold text-lg text-stone-900">¥{toTaxIncluded(inv.price ?? product.price, inv.cost).toLocaleString()}</span>
              </div>
              {inv.badges.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                  {inv.badges.map((badge) => (
                    <span key={badge} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${BADGE_COLORS[badge] ?? DEFAULT_BADGE_COLOR}`}>{badge}</span>
                  ))}
                </div>
              )}
              <h2 className="font-bold text-stone-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">{displayName}</h2>
              <p className="text-sm text-stone-500 line-clamp-2">{product.description}</p>
            </div>
          </div>
        </Link>
      );
    } else {
      const { familyName, repProduct, repInv, repId, minPrice, allSoldOut } = card;
      const familyImgSrc = repInv.imageUrl || repInv.familyImages[0] || repProduct?.image?.url;
      const familyDescription = repInv.description || repProduct?.description || "";
      return (
        <Link href={`/products/${repId}`} key={`family-${familyName}`} className={`group ${allSoldOut ? "pointer-events-none" : ""}`}>
          <div className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 ${allSoldOut ? "opacity-70" : ""}`}>
            <div className="relative aspect-square bg-stone-100 overflow-hidden">
              {familyImgSrc ? (
                <Image src={familyImgSrc} alt={familyName} fill className="object-contain group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-400">No Image</div>
              )}
              {allSoldOut && (
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
                  <span className="bg-white text-stone-900 text-sm font-bold px-4 py-2 rounded-full">売り切れ</span>
                  {repInv.nextShipment && (
                    <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full">次回 {repInv.nextShipment}入荷予定</span>
                  )}
                </div>
              )}
              {!allSoldOut && repProduct?.isRecommended && (
                <span className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">おすすめ</span>
              )}
              <div className="absolute top-3 left-3">
                <FavoriteButton productId={`family:${familyName}`} size="sm" />
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-end mb-2">
                <span className="font-bold text-lg text-stone-900">¥{minPrice.toLocaleString()}〜</span>
              </div>
              {repInv.badges.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                  {repInv.badges.map((badge) => (
                    <span key={badge} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${BADGE_COLORS[badge] ?? DEFAULT_BADGE_COLOR}`}>{badge}</span>
                  ))}
                </div>
              )}
              <h2 className="font-bold text-stone-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">{familyName}</h2>
              <p className="text-sm text-stone-500 line-clamp-2">{familyDescription}</p>
            </div>
          </div>
        </Link>
      );
    }
  };

  const ProductSection = ({ title, items }: { title: string; items: CardItem[] }) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-16 last:mb-0">
        <h2 className="text-2xl font-bold text-stone-900 mb-8 border-l-4 border-primary pl-4">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map(renderCard)}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-stone-50">
      <Header />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-stone-900 font-heading">商品一覧</h1>
            <p className="text-stone-600 max-w-2xl mx-auto">
              安藤青果と、ご近所の農家さんが丹精込めて育てた自慢の逸品たち。<br />
              旬の時期に一番おいしい状態でお届けします。
            </p>
          </div>
          <ProductSection title="根菜・芋類" items={rootCards} />
          <ProductSection title="葉物野菜" items={leafCards} />
          <ProductSection title="蜂蜜" items={honeyCards} />
          <ProductSection title="加工品・その他" items={otherCards} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
