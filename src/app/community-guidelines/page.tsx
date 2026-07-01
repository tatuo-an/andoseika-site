import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "投稿ガイドライン | 安藤青果",
  description: "みんなの料理への投稿にあたってのガイドラインです。",
};

const sections: { heading: string; items: string[] }[] = [
  {
    heading: "著作権・肖像権",
    items: [
      "他の方が撮影した写真や作成した文章は、本人の許可なく投稿しないでください。",
      "人物が写り込む場合は、被写体本人の同意を得てから投稿してください。",
      "投稿された写真・文章の著作権は投稿者に帰属します。",
    ],
  },
  {
    heading: "禁止事項",
    items: [
      "他のユーザーや第三者への誹謗・中傷・差別的表現を含む投稿",
      "商品の宣伝・勧誘・スパムなど営業目的の投稿",
      "虚偽の情報や誤解を招く表現を含む投稿",
      "危険な調理方法や食品衛生上問題のある内容の投稿",
      "個人情報（住所・電話番号・氏名など）を特定できる投稿",
      "当社や安藤青果の商品と無関係な投稿",
      "公序良俗に反する内容の投稿",
    ],
  },
  {
    heading: "投稿の管理・削除",
    items: [
      "安藤青果は、ガイドラインに違反すると判断した投稿を予告なく非公開・削除することがあります。",
      "削除の理由についてはお答えしかねる場合があります。",
      "悪質な違反が繰り返された場合、投稿機能の利用を停止することがあります。",
    ],
  },
  {
    heading: "投稿写真・コンテンツの利用について",
    items: [
      "投稿いただいた写真・文章は、安藤青果の公式サイト（商品ページ・TOPページ等）や公式SNSアカウントでご紹介する場合があります。",
      "ご紹介の際は、投稿時に登録いただいたニックネームまたは「@ユーザー名」を明記します。本名やメールアドレスを掲載することはありません。",
      "商業目的での大規模利用（広告・パッケージ等）を行う場合は、改めて投稿者に個別にご連絡します。",
      "掲載を希望されない場合は、お問い合わせフォームよりご連絡ください。速やかに対応いたします。",
    ],
  },
  {
    heading: "投稿ポイントの付与条件",
    items: [
      "安藤青果の食材を使った料理写真を投稿すると、審査通過後にポイントを付与します。",
      "ポイント付与の対象は1アカウントにつき月5投稿までです。",
      "同一または類似写真の繰り返し投稿、他者の写真の無断転載など不正と判断した場合はポイントを付与しません。すでに付与済みの場合は取り消すことがあります。",
      "投稿が非公開・削除された場合、付与済みポイントは取り消される場合があります。",
      "ポイントの利用条件については「ポイント利用条件」をご確認ください。",
    ],
  },
  {
    heading: "ガイドラインの変更",
    items: [
      "本ガイドラインは予告なく変更することがあります。変更後の内容は当ページに掲載した時点から適用されます。",
    ],
  },
];

export default function CommunityGuidelinesPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-stone-50">
      <Header />
      <main className="flex-1">
        <section className="bg-white py-16 md:py-20">
          <div className="container mx-auto max-w-3xl px-4 md:px-6">
            <h1 className="mb-8 font-heading text-2xl font-bold text-stone-900 md:text-3xl">
              投稿ガイドライン
            </h1>
            <p className="text-sm text-stone-500 mb-10 leading-relaxed">
              「みんなの料理」への投稿は、以下のガイドラインに従ってご利用ください。
              投稿をいただいた時点で、本ガイドラインに同意いただいたものとみなします。
            </p>
            <div className="space-y-10">
              {sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-lg font-bold text-stone-900 mb-3 border-l-4 border-primary pl-3">
                    {section.heading}
                  </h2>
                  <ul className="space-y-2 text-sm text-stone-700 leading-relaxed">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
            <p className="text-xs text-stone-400 mt-12">制定日：2024年1月1日　最終更新：2026年7月1日</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
