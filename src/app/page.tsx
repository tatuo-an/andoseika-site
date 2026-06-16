import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight, ShoppingBasket, Leaf, Heart, Building2 } from "lucide-react";
import { client } from "@/lib/microcms";
import { Product } from "@/types/microcms";
import { google } from "googleapis";
import { isSaleActive, calcSalePrice } from "@/lib/sale";
import localProducts from "@/data/products.json";

export const revalidate = 60;

type InventoryData = {
  stock: number; variantName: string; hidden: boolean;
  price: number | null; imageUrl: string; cost: number | null;
  family: string; salePercent: number; saleStart: string; saleEnd: string;
};

function toTaxIncluded(price: number, cost: number | null): number {
  if (cost === null || cost <= 0) return Math.round(price * 1.08);
  const others = Math.max(0, price - cost);
  return Math.round(cost * 1.08 + others * 1.10);
}

async function getTopProducts(): Promise<{ id: string; name: string; image: string; price: number; onSale: boolean }[]> {
  try {
    let products: Product[] = [];
    try {
      const data = await client.getList<Product>({ endpoint: "products", queries: { orders: "order", limit: 100 } });
      products = data.contents.length > 0 ? data.contents : (localProducts as Product[]);
    } catch {
      products = localProducts as Product[];
    }

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
      range: "商品在庫!A:Y",
    });
    const rows = res.data.values ?? [];
    const invMap: Record<string, InventoryData> = {};
    const order: string[] = [];
    rows.slice(1).forEach((r) => {
      if (r[0]) {
        order.push(r[0]);
        invMap[r[0]] = {
          stock: r[2] !== undefined && r[2] !== "" ? parseInt(r[2], 10) : -1,
          variantName: r[1] ?? "",
          hidden: r[5] === "1",
          price: r[3] !== undefined && r[3] !== "" ? parseInt(r[3], 10) : null,
          imageUrl: r[10]?.trim() ?? "",
          cost: r[12] !== undefined && r[12] !== "" ? parseInt(r[12], 10) : null,
          family: r[9]?.trim() ?? "",
          salePercent: r[18] !== undefined && r[18] !== "" ? parseInt(r[18], 10) : 0,
          saleStart: r[19] ?? "",
          saleEnd: r[20] ?? "",
        };
      }
    });

    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
    const seenFamilies = new Set<string>();
    const result: { id: string; name: string; image: string; price: number; onSale: boolean }[] = [];

    for (const id of order) {
      if (result.length >= 8) break;
      const inv = invMap[id];
      if (!inv || inv.hidden) continue;
      if (inv.stock !== -1 && inv.stock === 0) continue;
      if (inv.family) {
        if (seenFamilies.has(inv.family)) continue;
        seenFamilies.add(inv.family);
      }
      const product = productMap[id];
      const rawPrice = inv.price ?? product?.price;
      if (!rawPrice) continue;
      const taxed = toTaxIncluded(rawPrice, inv.cost);
      const onSale = isSaleActive(inv.salePercent, inv.saleStart, inv.saleEnd);
      const finalPrice = onSale ? calcSalePrice(taxed, inv.salePercent) : taxed;
      const image = inv.imageUrl || product?.image?.url || "";
      const name = inv.family || inv.variantName || product?.name || "";
      result.push({ id, name, image, price: finalPrice, onSale });
    }
    return result;
  } catch {
    return [];
  }
}

const CATEGORIES = [
  { href: "/products", label: "商品一覧", icon: ShoppingBasket },
  { href: "/experience", label: "体験・予約", icon: Leaf },
  { href: "/supporter", label: "サポーター", icon: Heart },
  { href: "/business", label: "業務用・卸", icon: Building2 },
];

export default async function Home() {
  const products = await getTopProducts();

  return (
    <div className="min-h-screen flex flex-col font-sans bg-stone-50">
      <Header />

      <main className="flex-1">
        {/* ── Hero Banner ── */}
        <section className="relative h-[15vh] w-full overflow-hidden bg-stone-900">
          <Image
            src="/images/hero/hero_sand_dunes.jpg"
            alt="鳥取の砂丘長芋畑"
            fill
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative h-full container mx-auto px-4 md:px-6 flex items-center">
            <h1 className="text-xl md:text-4xl font-bold text-white leading-tight font-heading drop-shadow whitespace-nowrap">
              鳥取の畑から、まっすぐ届ける。
            </h1>
          </div>
        </section>

        {/* ── Category Shortcuts ── */}
        <section className="bg-white border-b border-stone-200">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-4 divide-x divide-stone-100">
              {CATEGORIES.map((cat) => (
                <Link key={cat.href} href={cat.href} className="flex flex-col items-center gap-2 py-4 px-2 hover:bg-stone-50 transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <cat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs font-bold text-stone-800 whitespace-nowrap">{cat.label}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Featured Products ── */}
        {products.length > 0 && (
          <section className="py-10 bg-white mt-3 shadow-sm">
            <div className="container mx-auto px-4 md:px-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-stone-900">おすすめ商品</h2>
                <Link href="/products" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                  すべて見る <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((p) => (
                  <Link key={p.id} href={`/products/${p.id}`} className="group bg-stone-50 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative aspect-square bg-white">
                      {p.image ? (
                        <Image src={p.image} alt={p.name} fill className="object-contain p-3 group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">No Image</div>
                      )}
                      {p.onSale && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">SALE</span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-stone-700 font-medium line-clamp-2 leading-snug">{p.name}</p>
                      <p className="text-sm font-bold text-stone-900 mt-1">¥{p.price.toLocaleString()}<span className="text-xs font-normal text-stone-500">（税込）</span></p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Promo Banners ── */}
        <section className="py-4 bg-stone-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-4">
              {/* サポーター */}
              <Link href="/supporter" className="group relative overflow-hidden rounded-2xl aspect-[16/7] bg-stone-800 block shadow hover:shadow-lg transition-shadow">
                <Image src="/supporter/hero/hero-v1.jpg" alt="サポーター" fill className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-center px-8">
                  <p className="text-white/70 text-xs font-bold tracking-widest uppercase mb-1">Supporter</p>
                  <p className="text-white text-xl md:text-2xl font-bold leading-snug drop-shadow">農家の「親戚」になりませんか</p>
                  <p className="text-white/80 text-sm mt-2">年会費3,000円〜。特産品のお届け＋農家体験つき</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-white text-sm font-bold">
                    詳しく見る <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>

              {/* 体験 */}
              <Link href="/experience" className="group relative overflow-hidden rounded-2xl aspect-[16/7] bg-amber-900 block shadow hover:shadow-lg transition-shadow">
                <Image src="/images/experience/experience_combined.png" alt="体験" fill className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-center px-8">
                  <p className="text-white/70 text-xs font-bold tracking-widest uppercase mb-1">Experience</p>
                  <p className="text-white text-xl md:text-2xl font-bold leading-snug drop-shadow">畑で、体を動かす日。</p>
                  <p className="text-white/80 text-sm mt-2">養蜂体験・芋掘り体験。予約受付中</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-white text-sm font-bold">
                    予約する <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* ── About Strip ── */}
        <section className="bg-white py-10 border-t border-stone-100">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-full md:w-64 aspect-video md:aspect-square rounded-2xl overflow-hidden flex-shrink-0">
                <Image src="/images/about/founders.jpg" alt="安藤青果" fill className="object-cover object-top" />
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-primary text-xs font-bold tracking-widest uppercase">About &YOU</p>
                <h2 className="text-2xl font-bold text-stone-900">安藤青果について</h2>
                <p className="text-stone-600 leading-relaxed text-sm">
                  鳥取県倉吉市・北栄町で白ネギや長芋、里芋、梨、蜂蜜などを育てている農家です。
                  「まじめにふざける」をモットーに、食べる人もつくる人も幸せになれる農業を目指しています。
                </p>
                <Link href="/about" className="inline-flex items-center gap-1 text-primary text-sm font-bold hover:underline">
                  もっと詳しく <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
