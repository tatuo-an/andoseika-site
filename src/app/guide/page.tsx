import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "使い方ガイド",
};

const pages = [
  {
    name: "TOP",
    href: "/",
    emoji: "🏠",
    description: "安藤青果のトップページです。最新のお知らせや商品のピックアップを確認できます。",
    features: ["最新情報のチェック", "おすすめ商品の確認", "各ページへのナビゲーション"],
  },
  {
    name: "商品一覧",
    href: "/products",
    emoji: "🥬",
    description: "白ネギ・長芋・梨・はちみつ・らっきょうなど、安藤青果の商品を購入できます。",
    features: ["会員登録で購入可能", "カートに入れてまとめて注文", "お気に入り登録ができる"],
    needsLogin: true,
  },
  {
    name: "みんなの料理",
    href: "/community",
    emoji: "🍳",
    description: "安藤青果の野菜を使った料理写真や、みんなのレシピを投稿・共有できるコミュニティです。",
    features: ["料理写真の投稿", "いいね・コメント", "レシピの保存"],
    needsLogin: true,
  },
  {
    name: "体験・予約",
    href: "/experience",
    emoji: "🌾",
    description: "農場体験や収穫体験など、鳥取の畑でのリアル体験を予約できます。",
    features: ["体験プランの確認", "日程を選んで予約", "予約履歴の確認"],
    needsLogin: true,
  },
  {
    name: "サポーター募集",
    href: "/supporter",
    emoji: "💚",
    description: "安藤青果を応援するサポーター会員になると、割引・ポイント特典が受けられます。農園パートナープランでは、年2回、旬の詰め合わせを送料込みでお届けします。",
    features: ["会員割引・ログインポイント特典", "農園パートナー限定：年2回の旬の詰め合わせ（送料込み）", "サポーター限定商品の購入"],
    needsLogin: true,
  },
  {
    name: "業務用・卸",
    href: "/business",
    emoji: "📦",
    description: "飲食店・小売店向けの業務用注文・卸のご相談ページです。",
    features: ["業務用価格でのご注文", "定期配送の相談", "お問い合わせフォーム"],
  },
];

export default function GuidePage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">

          {/* タイトル */}
          <div className="text-center mb-12">
            <p className="text-4xl mb-3">🌿</p>
            <h1 className="text-3xl font-bold text-stone-900 mb-3">使い方ガイド</h1>
            <p className="text-stone-500">安藤青果サイトの使い方をご紹介します</p>
          </div>

          {/* 会員登録の方法 */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">👤</span> 会員登録の方法
            </h2>
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
              <p className="text-stone-600 text-sm mb-6">
                会員登録は無料です。GoogleアカウントまたはLINEアカウントで簡単に登録できます。
                パスワードの設定は不要です。
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {/* Google */}
                <div className="border border-stone-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="font-bold text-stone-800">Googleで登録</span>
                  </div>
                  <ol className="text-sm text-stone-600 space-y-1 list-decimal list-inside">
                    <li>「ログイン / 登録」ボタンをタップ</li>
                    <li>「Googleでログイン」を選択</li>
                    <li>Googleアカウントを選ぶ</li>
                    <li>完了！マイページに移動します</li>
                  </ol>
                </div>
                {/* LINE */}
                <div className="border border-stone-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 bg-[#06C755] rounded-sm flex items-center justify-center">
                      <span className="text-white text-xs font-bold">L</span>
                    </div>
                    <span className="font-bold text-stone-800">LINEで登録</span>
                  </div>
                  <ol className="text-sm text-stone-600 space-y-1 list-decimal list-inside">
                    <li>「ログイン / 登録」ボタンをタップ</li>
                    <li>「LINEでログイン」を選択</li>
                    <li>LINEアプリで認証する</li>
                    <li>完了！マイページに移動します</li>
                  </ol>
                </div>
              </div>
              <Link
                href="/login"
                className="block w-full text-center bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors"
              >
                今すぐ登録する（無料）
              </Link>
            </div>
          </section>

          {/* 各ページの使い方 */}
          <section>
            <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">📖</span> 各ページの使い方
            </h2>
            <div className="space-y-4">
              {pages.map((page) => (
                <div key={page.href} className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{page.emoji}</span>
                      <div>
                        <h3 className="font-bold text-stone-900">{page.name}</h3>
                        {page.needsLogin && (
                          <span className="text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">
                            会員登録が必要
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={page.href}
                      className="text-xs text-primary font-bold shrink-0 hover:underline"
                    >
                      ページへ →
                    </Link>
                  </div>
                  <p className="text-sm text-stone-600 mb-3">{page.description}</p>
                  <ul className="space-y-1">
                    {page.features.map((f) => (
                      <li key={f} className="text-sm text-stone-500 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* フッターCTA */}
          <div className="mt-12 text-center">
            <p className="text-stone-500 text-sm mb-4">なにかご不明な点があればAIに聞いてみてください</p>
            <Link
              href="/login"
              className="inline-block bg-primary text-white font-bold px-8 py-3 rounded-full hover:bg-primary/90 transition-colors"
            >
              会員登録はこちら（無料）
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
