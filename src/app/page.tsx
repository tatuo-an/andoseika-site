import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight, ShoppingBasket, Leaf, Heart, Building2, Package, Truck, ShieldCheck, AlertTriangle } from "lucide-react";
import { CommunityScroller } from "@/components/community/CommunityScroller";
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

async function getPreorderProducts(): Promise<{ id: string; name: string; image: string; price: number | null }[]> {
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
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
    const seenFamilies = new Set<string>();
    const result: { id: string; name: string; image: string; price: number | null }[] = [];
    rows.slice(1).forEach((r) => {
      if (!r[0]) return;
      const badges: string[] = r[8] ? r[8].split(",").map((b: string) => b.trim()) : [];
      if (!badges.includes("予約受付中")) return;
      if (r[5] === "1") return; // 非表示
      const family = (r[9] ?? "").trim();
      const key = family || r[0];
      if (seenFamilies.has(key)) return;
      seenFamilies.add(key);
      const product = productMap[r[0]];
      const rawPrice = r[3] !== undefined && r[3] !== "" ? parseInt(r[3], 10) : (product?.price ?? null);
      const cost = r[12] !== undefined && r[12] !== "" ? parseInt(r[12], 10) : null;
      const price = rawPrice ? toTaxIncluded(rawPrice, cost) : null;
      const image = (r[10]?.trim() || "") || product?.image?.url || "";
      const name = family || r[1] || product?.name || "";
      result.push({ id: r[0], name, image, price });
    });
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

type RescueItem = { id: string; title: string; description: string; stock: number | null; deadline: string; productId: string; rescueDeadline: string };

async function getRescueItems(): Promise<RescueItem[]> {
  try {
    const { google: googleapis } = await import("googleapis");
    const a = new googleapis.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = googleapis.sheets({ version: "v4", auth: a });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
      range: "商品在庫!A:AC",
    });
    const rows = (res.data.values ?? []).slice(1).filter((r) => r[0] && r[27] === "1" && r[5] !== "1");
    // ファミリーごとに最初の1件をまとめてバナー化
    const seenFamilies = new Set<string>();
    const result: RescueItem[] = [];
    for (const r of rows) {
      const family = (r[9] ?? "").trim();
      const key = family || r[0];
      if (seenFamilies.has(key)) continue;
      seenFamilies.add(key);
      const stock = r[2] !== undefined && r[2] !== "" ? parseInt(r[2], 10) : null;
      result.push({
        id: r[0],
        title: family || r[1] || "",
        description: r[15] ?? "",
        stock: stock !== null && stock >= 0 ? stock : null,
        deadline: "",
        productId: r[0],
        rescueDeadline: r[28] ?? "",
      });
    }
    return result;
  } catch {
    return [];
  }
}

export default async function Home() {
  const [products, rescueItems, preorderProducts] = await Promise.all([getTopProducts(), getRescueItems(), getPreorderProducts()]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-stone-50">
      <Header />

      <main className="flex-1">
        {/* ── Hero Banner ── */}
        <section className="relative h-[28vh] w-full overflow-hidden bg-stone-900">
          <Image
            src="/images/hero/hero_sand_dunes.jpg"
            alt="鳥取の砂丘長芋畑"
            fill
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative h-full container mx-auto px-4 md:px-6 flex items-center">
            <div>
              <h1 className="text-xl md:text-4xl font-bold text-white leading-tight font-heading drop-shadow">
                まじめにふざける、おいしい毎日。
              </h1>
              <p className="mt-2 text-xs md:text-sm text-white/80 drop-shadow leading-relaxed">
                鳥取の畑から、あなたへ。<br />
                私たちは、ただ野菜を作るだけの農家ではありません。<br />
                「おいしい」のその先にある、みんなの笑顔をつくるために。
              </p>
            </div>
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

        {/* ── Community Scroller ── */}
        <CommunityScroller />

        {/* ── 初めての方へ ── */}
        <section className="py-10 bg-stone-50">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-xl font-bold text-stone-900 mb-6">初めての方へ</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-stone-900 text-sm mb-1">送料込みで分かりやすい価格</p>
                  <p className="text-xs text-stone-500 leading-relaxed">一部地域のみ追加送料が発生します。</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-stone-900 text-sm mb-1">農家から直接発送</p>
                  <p className="text-xs text-stone-500 leading-relaxed">収穫状況に合わせて4〜10日以内に発送します。</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-stone-900 text-sm mb-1">傷みがあった場合も対応</p>
                  <p className="text-xs text-stone-500 leading-relaxed">到着後3日以内に写真を添えてご連絡ください。</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 畑のレスキュー便 ── */}
        {rescueItems.length > 0 && (
          <section className="py-4 bg-red-50 border-y border-red-200">
            <div className="container mx-auto px-4 md:px-6 space-y-3">
              {rescueItems.map((item) => (
                <div key={item.id} className="bg-white border border-red-200 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-0.5">畑から緊急のお知らせ</p>
                      <p className="font-bold text-stone-900 text-sm leading-snug">{item.title}</p>
                      {item.description && <p className="text-xs text-stone-600 mt-1 leading-relaxed">{item.description}</p>}
                      <div className="flex flex-wrap gap-3 mt-2">
                        {item.stock !== null && (
                          <span className="text-xs text-stone-500">残り約 <span className="font-bold text-stone-800">{item.stock}</span> 点</span>
                        )}
                        {item.rescueDeadline && (
                          <span className="text-xs text-stone-500">
                            <span className="font-bold text-red-600">{item.rescueDeadline.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$2月$3日")}</span> まで
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {item.productId && (
                    <Link
                      href={`/products/${item.productId}`}
                      className="shrink-0 px-5 py-2.5 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors text-center"
                    >
                      レスキューする
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Preorder Products ── */}
        {preorderProducts.length > 0 && (
          <section className="py-10 bg-amber-50 border-y border-amber-200">
            <div className="container mx-auto px-4 md:px-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs font-bold text-amber-600 tracking-wider uppercase">Preorder</span>
                  <h2 className="text-xl font-bold text-stone-900 mt-0.5">予約受付中の商品</h2>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {preorderProducts.map((p) => (
                  <Link key={p.id} href={`/products/${p.id}`} className="group bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow border border-amber-100">
                    <div className="relative aspect-square bg-stone-50">
                      {p.image ? (
                        <Image src={p.image} alt={p.name} fill className="object-contain p-3 group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">No Image</div>
                      )}
                      <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">予約受付中</span>
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-stone-700 font-medium line-clamp-2 leading-snug">{p.name}</p>
                      {p.price ? (
                        <p className="text-sm font-bold text-stone-900 mt-1">¥{p.price.toLocaleString()}<span className="text-xs font-normal text-stone-500">（税込）</span></p>
                      ) : (
                        <p className="text-sm text-stone-400 mt-1">価格未定</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

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

        {/* ── Season Calendar ── */}
        <section className="py-10 bg-stone-50">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-xl font-bold text-stone-900 mb-4">旬の恵みカレンダー</h2>
            <div className="rounded-2xl overflow-hidden shadow-sm">
              <Image
                src="/images/season-calendar.png"
                alt="安藤青果の旬の恵みカレンダー"
                width={1200}
                height={630}
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

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
                  <p className="text-white/80 text-sm mt-2">無料会員あり／サポーターは年会費3,000円〜。ポイント・割引・限定商品など特典あり</p>
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
                  <p className="text-white/80 text-sm mt-2">養蜂体験（5〜10月）・芋掘り体験（10〜12月）。事前予約必須</p>
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
