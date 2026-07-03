import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ExternalLink, MapPin } from "lucide-react";
import type { Metadata } from "next";
import type { Partner } from "@/app/api/partners/route";

export const metadata: Metadata = {
  title: "取引先・ご利用店舗 | 安藤青果",
  description: "安藤青果の野菜・蜂蜜をご利用いただいているお店をご紹介します。",
};

export const revalidate = 3600;

async function fetchPartners(): Promise<Partner[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/partners`, { cache: "no-store" });
    const data = await res.json();
    return data.partners ?? [];
  } catch {
    return [];
  }
}

export default async function PartnersPage() {
  const partners = await fetchPartners();

  return (
    <div className="min-h-screen flex flex-col font-sans bg-stone-50">
      <Header />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-primary/5 border-b border-primary/10 py-16 md:py-20">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center space-y-4">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Our Partners</p>
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-stone-900">
              取引先・ご利用店舗
            </h1>
            <p className="text-stone-600 leading-relaxed">
              安藤青果の野菜・蜂蜜をお料理やメニューに取り入れてくださっているお店をご紹介します。<br />
              ぜひ足を運んでみてください。
            </p>
          </div>
        </section>

        {/* Partner List */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            {partners.length === 0 ? (
              <p className="text-center text-stone-400 py-20">取引先情報を準備中です。</p>
            ) : (
              <div className="space-y-12">
                {partners.map((p, i) => (
                  <PartnerCard key={i} partner={p} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-white border-t border-stone-100 py-12">
          <div className="container mx-auto px-4 text-center space-y-3">
            <p className="text-stone-600 text-sm">
              安藤青果の食材のご利用・卸売についてはこちら
            </p>
            <a
              href="/business"
              className="inline-block bg-primary text-white font-bold px-8 py-3 rounded-full hover:bg-primary/90 transition-colors text-sm"
            >
              業務用・卸売について
            </a>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}

function PartnerCard({ partner: p }: { partner: Partner }) {
  const mapSrc = p.address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(p.address)}&output=embed&hl=ja&z=15`
    : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-stone-100">
      <div className="grid md:grid-cols-2 gap-0">

        {/* 左：情報 */}
        <div className="p-6 md:p-8 flex flex-col justify-between">
          <div className="space-y-3">
            {p.genre && (
              <span className="inline-block text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                {p.genre}
              </span>
            )}
            <h2 className="text-xl md:text-2xl font-bold text-stone-900">{p.name}</h2>
            {p.catchphrase && (
              <p className="text-primary font-medium text-sm">{p.catchphrase}</p>
            )}
            {p.description && (
              <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                {p.description}
              </p>
            )}
          </div>

          <div className="mt-6 space-y-2">
            {p.address && (
              <p className="flex items-start gap-1.5 text-xs text-stone-500">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-stone-400" />
                {p.address}
              </p>
            )}
            {p.websiteUrl && (
              <a
                href={p.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                ウェブサイトを見る
              </a>
            )}
          </div>
        </div>

        {/* 右：写真 or 地図 */}
        <div className="relative min-h-[240px] md:min-h-[300px] bg-stone-100">
          {p.driveId ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={`/api/drive-image?id=${p.driveId}`}
              alt={p.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : mapSrc ? (
            <iframe
              src={mapSrc}
              className="absolute inset-0 w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`${p.name}の地図`}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-stone-300">
              <MapPin className="w-12 h-12" />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
