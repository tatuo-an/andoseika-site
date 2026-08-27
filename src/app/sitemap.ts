import type { MetadataRoute } from "next";
import { client } from "@/lib/microcms";
import type { Product } from "@/types/microcms";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ando-seika.com";

const staticPages: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/products", changeFrequency: "weekly", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/experience", changeFrequency: "monthly", priority: 0.7 },
  { path: "/supporter", changeFrequency: "monthly", priority: 0.7 },
  { path: "/community", changeFrequency: "weekly", priority: 0.6 },
  { path: "/guide", changeFrequency: "monthly", priority: 0.6 },
  { path: "/business", changeFrequency: "monthly", priority: 0.6 },
  { path: "/partners", changeFrequency: "monthly", priority: 0.6 },
  { path: "/news", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.4 },
  { path: "/safety", changeFrequency: "yearly", priority: 0.4 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/tokusho", changeFrequency: "yearly", priority: 0.3 },
  { path: "/supporter-terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/point-terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/community-guidelines", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: new URL(page.path, SITE_URL).toString(),
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  try {
    const data = await client.getList<Product>({
      endpoint: "products",
      queries: { limit: 100, fields: "id,updatedAt,revisedAt,publishedAt" },
    });
    const productPages: MetadataRoute.Sitemap = data.contents.map((product) => ({
      url: new URL(`/products/${product.id}`, SITE_URL).toString(),
      lastModified: product.updatedAt ?? product.revisedAt ?? product.publishedAt ?? now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
    return [...pages, ...productPages];
  } catch {
    return pages;
  }
}
