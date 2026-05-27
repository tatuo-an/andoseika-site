import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { client } from "@/lib/microcms";
import { Product } from "@/types/microcms";
import { Metadata } from "next";
import localProducts from "@/data/products.json";
import { QuickAddButton } from "@/components/products/QuickAddButton";
import { google } from "googleapis";
import { BADGE_COLORS, DEFAULT_BADGE_COLOR } from "@/lib/badges";

export const metadata: Metadata = {
  title: "商品一覧",
  description: "安藤青果の自慢の野菜と加工品。白ネギ、長芋、里芋、梨、蜂蜜、らっきょうなど、旬の味をお届けします。",
};

export const revalidate = 60;

type InventoryData = { stock: number; nameOverride: string; hidden: boolean; deleted: boolean; nextShipment: string; badges: string[] };
type InventoryResult = { map: Record<string, InventoryData>; order: string[]; deletedIds: Set<string> };

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
    const [dataRes, deletedRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
        range: "商品在庫!A:I",
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
        range: "商品在庫!K1",
      }),
    ]);
    const rows = dataRes.data.values ?? [];
    const map: Record<string, InventoryData> = {};
    const order: string[] = [];
    rows.slice(1).forEach((r) => {
      if (r[0]) {
        order.push(r[0]);
        map[r[0]] = {
          stock: r[2] !== undefined && r[2] !== "" ? parseInt(r[2], 10) : -1,
          nameOverride: r[1] ?? "",
          hidden: r[5] === "1",
          deleted: r[6] === "1",
          nextShipment: r[7] ?? "",
          badges: r[8] ? r[8].split(",").map((b: string) => b.trim()).filter(Boolean) : [],
        };
      }
    });
    const deletedIds = new Set<string>(
      deletedRes.data.values?.[0]?.[0]
        ? deletedRes.data.values[0][0].split(",").map((s: string) => s.trim()).filter(Boolean)
        : []
    );
    return { map, order, deletedIds };
  } catch {
    return { map: {}, order: [], deletedIds: new Set() };
  }
}

async function getProducts(): Promise<Product[]> {
  try {
    const data = await client.getList<Product>({
      endpoint: "products",
      queries: { orders: "order" },
    });

    if (data.contents.length > 0) {
      return data.contents;
    }
  } catch (error) {
    console.error("Failed to fetch products from MicroCMS:", error);
  }

  // Fallback to local data if MicroCMS fails or returns empty
  return localProducts as Product[];
}

export default async function ProductsPage() {
  const [products, { map: inventoryMap, order: inventoryOrder, deletedIds }] = await Promise.all([getProducts(), getInventoryMap()]);

  if (products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <p className="text-stone-500">商品が見つかりませんでした。</p>
      </div>
    );
  }

  // シートの順番で並べ替え、シートにない商品は末尾に追加。非表示・削除済みを除外
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
  const orderedIds = new Set(inventoryOrder);
  const sortedProducts = [
    ...inventoryOrder.map((id) => productMap[id]).filter(Boolean),
    ...products.filter((p) => !orderedIds.has(p.id)),
  ].filter((p) =>
    !inventoryMap[p.id]?.hidden &&
    !inventoryMap[p.id]?.deleted &&
    !deletedIds.has(p.id)
  ) as Product[];

  // Group products by category
  const rootProducts = sortedProducts.filter(p => p.category === "root");
  const leafProducts = sortedProducts.filter(p => p.category === "leaf");
  const honeyProducts = sortedProducts.filter(p => p.category === "honey");
  const otherProducts = sortedProducts.filter(p => !["root", "leaf", "honey"].includes(p.category));

  const ProductSection = ({ title, items }: { title: string, items: Product[] }) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-16 last:mb-0">
        <h2 className="text-2xl font-bold text-stone-900 mb-8 border-l-4 border-primary pl-4">
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((product) => {
            const inv = inventoryMap[product.id];
            const stock = inv?.stock ?? -1;
            const isSoldOut = stock !== -1 && stock === 0;
            const displayName = inv?.nameOverride || product.name;
            return (
            <Link href={`/products/${product.id}`} key={product.id} className={`group ${isSoldOut ? "pointer-events-none" : ""}`}>
              <div className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 ${isSoldOut ? "opacity-70" : ""}`}>
                <div className="relative aspect-[3/2] bg-stone-100 overflow-hidden">
                  {product.image ? (
                    <Image
                      src={product.image.url}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      No Image
                    </div>
                  )}
                  {isSoldOut && (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
                      <span className="bg-white text-stone-900 text-sm font-bold px-4 py-2 rounded-full">
                        売り切れ
                      </span>
                      {inv?.nextShipment && (
                        <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                          次回 {inv.nextShipment}入荷予定
                        </span>
                      )}
                    </div>
                  )}
                  {!isSoldOut && product.isRecommended && (
                    <span className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      おすすめ
                    </span>
                  )}
                </div>
                <div className="p-6 relative">
                  <div className="flex justify-end items-start mb-2">
                    <span className="font-bold text-lg text-stone-900">
                      ¥{product.price.toLocaleString()}
                    </span>
                  </div>
                  {inv?.badges && inv.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1">
                      {inv.badges.map((badge) => (
                        <span key={badge} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${BADGE_COLORS[badge] ?? DEFAULT_BADGE_COLOR}`}>
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                  <h2 className="font-bold text-stone-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {displayName}
                  </h2>
                  <p className="text-sm text-stone-500 line-clamp-2 pr-12">
                    {product.description}
                  </p>
                  {!isSoldOut && <QuickAddButton product={product} />}
                </div>
              </div>
            </Link>
            );
          })}
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
            <h1 className="text-3xl md:text-4xl font-bold text-stone-900 font-heading">
              商品一覧
            </h1>
            <p className="text-stone-600 max-w-2xl mx-auto">
              安藤青果と、ご近所の農家さんが丹精込めて育てた自慢の逸品たち。<br />
              旬の時期に一番おいしい状態でお届けします。
            </p>
          </div>

          <ProductSection title="根菜・芋類" items={rootProducts} />
          <ProductSection title="葉物野菜" items={leafProducts} />
          <ProductSection title="蜂蜜" items={honeyProducts} />
          <ProductSection title="加工品・その他" items={otherProducts} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
