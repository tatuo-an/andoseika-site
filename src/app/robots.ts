import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ando-seika.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/mypage", "/api", "/cart", "/login", "/success", "/cancel"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
