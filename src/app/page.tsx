import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[85vh] w-full overflow-hidden bg-stone-900">
          <div className="absolute inset-0">
            <Image
              src="/images/hero/hero_sand_dunes.jpg"
              alt="鳥取の砂丘長芋畑と風車"
              fill
              className="object-cover opacity-90"
              priority
            />
          </div>
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

          <div className="relative container mx-auto h-full px-4 md:px-6 flex flex-col justify-center items-start">
            <div className="max-w-2xl space-y-8 animate-fade-in-up">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight drop-shadow-lg font-heading">
                鳥取の畑みんなで、<br />
                まじめにふざける、<br />
                おいしい毎日。
              </h1>
              <p className="text-lg md:text-xl text-stone-100 font-medium leading-relaxed max-w-xl drop-shadow-md">
                自分の畑だけじゃなく、近所の農家さんの野菜や果物も。<br />
                B型就労支援の仲間と一緒に、遊ぶように働きながら、<br />
                食べる人もつくる人も、みんながちょっと幸せになれる循環を目指しています。<br />
                そんな「あなた（YOU）」と一緒につくるブランドが、&YOU（安藤青果）です。
              </p>
              <div className="pt-6 flex gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-stone-900 font-bold rounded-full hover:bg-stone-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
                >
                  商品を見る
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/experience"
                  className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-bold rounded-full border-2 border-white hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                  体験する
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1 relative aspect-video w-full rounded-2xl overflow-hidden shadow-xl group">
                <Image
                  src="/images/hero/hero_nagaimo_field.jpg"
                  alt="鳥取の長芋畑"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="order-1 md:order-2 space-y-6">
                <span className="text-primary font-bold tracking-wider uppercase text-sm">About Us</span>
                <h2 className="text-3xl md:text-4xl font-bold text-stone-900">
                  &YOU（安藤青果）について
                </h2>
                <p className="text-stone-600 leading-relaxed text-lg">
                  私たち &YOU（安藤青果）は、鳥取県倉吉市・北栄町で、
                  白ネギや長芋、里芋、梨、蜂蜜などを育てている農家です。<br /><br />
                  会長の安藤達夫と、代表の安藤匡志。
                  親子二代で、そして地域の仲間たちと共に、
                  「おいしい」のその先にある「楽しい」農業を追求しています。<br /><br />
                  自分たちの畑だけでなく、近所の農家さんの農産物も預かりながら、
                  B型就労支援の仲間たちと一緒に、仕事を「遊び」のように楽しむ。
                  そんな「まじめにふざける」姿勢で、今日もうまい野菜を作っています。
                </p>
                <Link href="/about" className="inline-flex items-center text-primary font-bold hover:underline decoration-2 underline-offset-4">
                  もっと詳しく
                  <ArrowRight className="ml-1 h-4 w-4" />
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
