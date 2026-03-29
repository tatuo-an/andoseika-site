
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

export const revalidate = 60;

async function getProduct(id: string): Promise<Product | null> {
    let data: Product | null = null;
    try {
        data = await client.get<Product>({
            endpoint: "products",
            contentId: id,
        });
    } catch (error) {
        // console.warn("Failed to fetch product from MicroCMS, attempting fallback.");
    }

    if (data) {
        // Fallback: Map local images if MicroCMS image is missing
        if (!data.image) {
            const localMatch = localProducts.find((p: any) => data!.name.includes(p.name) || p.name.includes(data!.name));
            if (localMatch) {
                return {
                    ...data,
                    image: { url: localMatch.image.url, height: 800, width: 800 }
                };
            }
        }
        return data;
    }

    // Fallback to local data if MicroCMS fetch failed or returned null
    const localMatch = localProducts.find((p: any) => p.id === id);
    if (localMatch) {
        return {
            ...localMatch,
            image: {
                url: localMatch.image.url,
                height: localMatch.image.height,
                width: localMatch.image.width
            },
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

    if (!product) {
        return {
            title: "商品が見つかりません",
        };
    }

    return {
        title: product.name,
        description: product.description,
        openGraph: {
            title: product.name,
            description: product.description,
            images: [product.image?.url || ""],
        },
    };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <p className="text-stone-500">商品が見つかりませんでした。</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 py-12">
            <div className="container mx-auto px-4 md:px-6">
                <Link
                    href="/products"
                    className="inline-flex items-center text-stone-500 hover:text-primary mb-8 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    商品一覧に戻る
                </Link>

                <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
                    <div className="grid md:grid-cols-2 gap-0">
                        {/* Image Section */}
                        <div className="relative aspect-square md:aspect-auto md:h-full bg-stone-100">
                            {product.image ? (
                                <Image
                                    src={product.image.url}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-400">
                                    No Image
                                </div>
                            )}
                        </div>

                        {/* Content Section */}
                        <div className="p-8 md:p-12 flex flex-col justify-center">
                            <div className="mb-6">
                                <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4">
                                    {product.category}
                                </span>
                                <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4 font-heading">
                                    {product.name}
                                </h1>
                                <p className="text-2xl font-bold text-primary">
                                    ¥{product.price.toLocaleString()}
                                    <span className="text-sm text-stone-500 font-normal ml-2">（税込）</span>
                                </p>
                            </div>

                            <div className="prose prose-stone mb-8">
                                <p className="text-stone-600 leading-relaxed">
                                    {product.description}
                                </p>
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

                                <AddToCartButton product={product} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

