import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "安心・安全への取り組み | 安藤青果",
  description: "安藤青果（&YOU）の個人情報保護・セキュリティ・AI利用・外部サービスへの取り組みをご説明します。",
};

export default function SafetyPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-stone-50">
      <Header />
      <main className="flex-1">
        <section className="bg-white py-16 md:py-20">
          <div className="container mx-auto max-w-3xl px-4 md:px-6">
            <h1 className="mb-4 font-heading text-2xl font-bold text-stone-900 md:text-3xl">
              安心・安全への取り組み
            </h1>
            <p className="text-sm text-stone-500 mb-12 leading-relaxed">
              安藤青果は、お客様が安心してご利用いただけるよう、個人情報の保護・決済セキュリティ・AI利用の透明性に取り組んでいます。
            </p>

            <div className="space-y-12">

              {/* ── 個人情報・プライバシー ── */}
              <div>
                <h2 className="text-lg font-bold text-stone-900 mb-3 border-l-4 border-primary pl-3">
                  個人情報・プライバシー保護
                </h2>
                <div className="text-sm text-stone-700 leading-relaxed space-y-2">
                  <p>お客様からお預かりした個人情報（氏名・住所・メールアドレス等）は、商品発送・ご連絡・サービス提供のみに利用します。</p>
                  <p>第三者への提供は、配送業者・決済事業者への最小限の情報共有（法令に基づく場合を除く）のみです。</p>
                  <p>
                    詳細は
                    <Link href="/privacy" className="underline hover:text-primary mx-1">プライバシーポリシー</Link>
                    をご参照ください。
                  </p>
                </div>
              </div>

              {/* ── 決済セキュリティ ── */}
              <div>
                <h2 className="text-lg font-bold text-stone-900 mb-3 border-l-4 border-primary pl-3">
                  決済セキュリティ
                </h2>
                <div className="text-sm text-stone-700 leading-relaxed space-y-2">
                  <p>本サービスの決済はすべて <strong>Stripe</strong>（Stripe, Inc.）を通じて処理されます。カード番号・セキュリティコードなどの決済情報は当社サーバーには一切保存されません。</p>
                  <p>通信はSSL/TLS暗号化により保護されており、Stripeは国際的なカードセキュリティ基準（PCI DSS）に準拠しています。</p>
                  <p>Stripeのプライバシーポリシー：<a href="https://stripe.com/jp/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">stripe.com/jp/privacy</a></p>
                </div>
              </div>

              {/* ── AI利用上の注意 ── */}
              <div>
                <h2 className="text-lg font-bold text-stone-900 mb-3 border-l-4 border-primary pl-3">
                  安藤AI利用上の注意
                </h2>
                <div className="text-sm text-stone-700 leading-relaxed space-y-2">
                  <p>安藤AIの回答は、農産物・料理・農業体験に関する一般的な案内を目的としています。</p>
                  <p><strong>価格・在庫・発送条件・キャンペーン内容</strong>については、各商品ページおよび注文確認画面の表示が正となります。AIの回答と相違がある場合は商品ページ・注文確認画面をご確認ください。</p>
                  <p><strong>医療・法律・栄養・アレルギー・安全性</strong>に関する専門的な判断には利用できません。健康上の不安やアレルギーがある場合は、医師・専門家にご相談ください。</p>
                  <p>AIはAnthropic社のAPIを利用しており、会話内容はAnthropic社のポリシーに従って処理されます。個人を特定できる情報はAIへ入力しないようお願いします。</p>
                </div>
              </div>

              {/* ── Cookie・外部サービス ── */}
              <div>
                <h2 className="text-lg font-bold text-stone-900 mb-3 border-l-4 border-primary pl-3">
                  Cookie・外部サービスについて
                </h2>
                <p className="text-sm text-stone-500 mb-5 leading-relaxed">
                  本サービスでは、利便性向上とサービス改善のために以下の外部サービスを利用しています。各サービスへはお客様の操作情報や端末情報の一部が送信されます。
                </p>

                <div className="space-y-4">

                  {/* Google Analytics */}
                  <div className="rounded-xl border border-stone-200 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">アクセス解析</span>
                      <span className="font-bold text-stone-800 text-sm">Google Analytics</span>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      サイトの訪問状況・ページ閲覧数・流入経路などを匿名で計測するために利用しています。Cookieを使用してデータを収集しますが、個人を特定する情報は含みません。ブラウザの設定でCookieを無効にするか、
                      <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary mx-1">Google Analytics オプトアウトアドオン</a>
                      でデータ送信を停止できます。
                    </p>
                  </div>

                  {/* Googleログイン */}
                  <div className="rounded-xl border border-stone-200 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">ソーシャルログイン</span>
                      <span className="font-bold text-stone-800 text-sm">Googleログイン</span>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      Google アカウントで会員登録・ログインする際に利用します。当社が取得するのは、お客様のGoogleアカウントの名前・メールアドレスのみです。パスワードは当社に送信・保存されません。
                    </p>
                  </div>

                  {/* LINEログイン */}
                  <div className="rounded-xl border border-stone-200 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">ソーシャルログイン</span>
                      <span className="font-bold text-stone-800 text-sm">LINEログイン</span>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      LINEアカウントで会員登録・ログインする際に利用します。当社が取得するのは、LINEの表示名・プロフィール画像URLのみです。友だちリストや会話内容は取得しません。LINEログインの利用はLINEヤフー株式会社のプライバシーポリシーに従います。
                    </p>
                  </div>

                  {/* Stripe */}
                  <div className="rounded-xl border border-stone-200 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">決済</span>
                      <span className="font-bold text-stone-800 text-sm">Stripe</span>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      クレジットカード決済・サポーター年会費の自動更新に利用します。決済画面ではStripeのサーバーと直接通信が行われ、カード情報は当社サーバーを経由しません。Stripeは不正利用検知のためにブラウザ情報等を収集することがあります（Stripeのプライバシーポリシーに準じます）。
                    </p>
                  </div>

                </div>

                <p className="text-xs text-stone-400 mt-5 leading-relaxed">
                  各外部サービスのプライバシーポリシーや利用規約については、各社のウェブサイトをご参照ください。今後サービスが追加・変更された場合は、このページを更新します。
                </p>
              </div>

              {/* ── お問い合わせ ── */}
              <div className="bg-stone-50 rounded-xl p-6 text-sm text-stone-600 leading-relaxed">
                <p className="font-bold text-stone-800 mb-2">ご不明な点・ご不安な点がある場合</p>
                <p>
                  セキュリティ・プライバシーに関するご質問は
                  <Link href="/contact/personal" className="underline hover:text-primary mx-1">お問い合わせフォーム</Link>
                  よりご連絡ください。
                </p>
              </div>

            </div>

            <p className="text-xs text-stone-400 mt-12">最終更新：2026年7月1日</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
