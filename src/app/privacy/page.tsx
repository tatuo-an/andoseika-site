import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "プライバシーポリシー",
    description: "安藤青果（&YOU）のプライバシーポリシーです。お客様の個人情報の取り扱いについて定めています。",
};

const SECTIONS = [
    {
        title: "1. 個人情報の収集について",
        body: `当店（安藤青果 / &YOU、以下「当店」）は、以下の場合にお客様の個人情報を収集します。

・商品のご注文・お支払い時（氏名、住所、電話番号、メールアドレス）
・会員登録・サポーター登録時
・お問い合わせフォームのご利用時
・体験イベントのご予約時`,
    },
    {
        title: "2. 個人情報の利用目的",
        body: `収集した個人情報は、以下の目的のために利用します。

・商品の発送・配達
・ご注文内容の確認およびお問い合わせへの対応
・サポーター会員サービスの提供
・メールマガジン・お知らせの送付（ご同意いただいた方のみ）
・サービスの改善および新サービスの開発`,
    },
    {
        title: "3. 個人情報の第三者提供",
        body: `当店は、以下の場合を除き、お客様の個人情報を第三者に提供・開示しません。

・お客様本人の同意がある場合
・法令に基づく開示が必要な場合
・商品配送のために配送業者へ提供する場合（氏名・住所・電話番号に限る）
・決済処理のために決済事業者へ提供する場合`,
    },
    {
        title: "4. 個人情報の管理",
        body: `当店は、お客様の個人情報を適切に管理し、紛失・破壊・改ざん・漏洩などを防ぐために合理的な安全対策を講じます。不要になった個人情報は適切な方法で廃棄します。`,
    },
    {
        title: "5. Cookieおよびアクセス解析",
        body: `当サイトでは、サービス向上のためにCookieおよびGoogle Analyticsを使用する場合があります。これらはお客様の個人を特定するものではありません。ブラウザの設定によりCookieを無効にすることも可能ですが、一部機能が制限される場合があります。`,
    },
    {
        title: "6. LINEを利用した通知について",
        body: `当店では、お得な情報や商品入荷案内をLINE公式アカウントを通じてお届けする場合があります。LINEのご利用はお客様の任意であり、ブロックによりいつでも受信を停止できます。LINE上でのデータ取り扱いはLINEヤフー株式会社のプライバシーポリシーに従います。`,
    },
    {
        title: "7. 個人情報の開示・訂正・削除",
        body: `お客様ご自身の個人情報について、開示・訂正・削除等のご要望がある場合は、下記お問い合わせ先までご連絡ください。ご本人確認の上、合理的な範囲で対応いたします。`,
    },
    {
        title: "8. プライバシーポリシーの変更",
        body: `当店は、必要に応じて本ポリシーを変更することがあります。変更後のポリシーは、当サイトに掲載した時点から効力を生じるものとします。`,
    },
    {
        title: "9. お問い合わせ",
        body: `個人情報の取り扱いに関するご質問・ご要望は、以下までお問い合わせください。

事業者名：安藤青果 / &YOU
所在地：鳥取県
メール：サイト内お問い合わせフォームよりご連絡ください`,
    },
];

export default function PrivacyPage() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-stone-50">
            <Header />

            <main className="flex-1 py-16">
                <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                    <h1 className="text-2xl md:text-3xl font-bold text-stone-900 mb-2">プライバシーポリシー</h1>
                    <p className="text-xs text-stone-400 mb-10">制定日：2024年1月1日　最終更新：2026年6月30日</p>

                    <div className="space-y-8">
                        {SECTIONS.map((sec) => (
                            <section key={sec.title}>
                                <h2 className="text-base font-bold text-stone-800 mb-2">{sec.title}</h2>
                                <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">{sec.body}</p>
                            </section>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
