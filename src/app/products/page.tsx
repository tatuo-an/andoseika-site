import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { client } from "@/lib/microcms";
import { Product } from "@/types/microcms";
import { Metadata } from "next";
import localProducts from "@/data/products.json";
import { QuickAddButton } from "@/components/products/QuickAddButton";

export const metadata: Metadata = {
  title: "商品一覧",
  description: "安藤青果の自慢の野菜と加工品。白ネギ、長芋、里芋、梨、蜂蜜、らっきょうなど、旬の味をお届けします。",
};

export const revalidate = 60;

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
  const products = await getProducts();

  if (products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <p className="text-stone-500">商品が見つかりませんでした。</p>
      </div>
    );
  }

  // Group products by category
  const rootProducts = products.filter(p => p.category === "root");
  const leafProducts = products.filter(p => p.category === "leaf");
  const honeyProducts = products.filter(p => p.category === "honey");
  const otherProducts = products.filter(p => !["root", "leaf", "honey"].includes(p.category));

  const ProductSection = ({ title, items }: { title: string, items: Product[] }) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-16 last:mb-0">
        <h2 className="text-2xl font-bold text-stone-900 mb-8 border-l-4 border-primary pl-4">
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((product) => (
            <Link href={`/products/${product.id}`} key={product.id} className="group">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
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
                  {product.isRecommended && (
                    <span className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      おすすめ
                    </span>
                  )}
                </div>
                <div className="p-6 relative">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                      {product.category === "root" ? "根菜・芋類" :
                        product.category === "leaf" ? "葉物野菜" :
                          product.category === "honey" ? "蜂蜜" :
                            product.category === "processed" ? "加工品" : "その他"}
                    </span>
                    <span className="font-bold text-lg text-stone-900">
                      ¥{product.price.toLocaleString()}
                    </span>
                  </div>
                  <h2 className="font-bold text-stone-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h2>
                  <p className="text-sm text-stone-500 line-clamp-2 pr-12">
                    {product.description}
                  </p>
                  <QuickAddButton product={product} />
                </div>
              </div>
            </Link>
          ))}
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
