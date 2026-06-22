import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ポイント利用条件 | 安藤青果",
  description: "&YOU 安藤青果のポイント制度の利用条件をご案内します。",
};

const sections: { heading: string; items: string[] }[] = [
  {
    heading: "ポイントの価値",
    items: [
      "1ポイント＝1円として、通常商品の商品代金にご利用いただけます。",
      "1ポイント単位でご利用いただけます。",
      "ポイントを現金へ交換することはできません。",
      "他のユーザーへの譲渡、複数アカウントでの合算はできません。",
      "ポイントの購入・チャージはできません。",
    ],
  },
  {
    heading: "ポイントを利用できるもの",
    items: [
      "自社ECサイトで販売する通常商品の商品代金、送料、サービス料にご利用いただけます。",
      "サポーター限定商品も、セール価格でなければご利用いただけます。",
    ],
  },
  {
    heading: "ポイントを利用できないもの",
    items: [
      "セール商品",
      "サポータープランの年会費",
      "農業体験の参加料金",
      "業務用・卸売取引",
      "ふるさと納税",
      "サイト外で受け付けた注文",
    ],
  },
  {
    heading: "ご利用上限",
    items: [
      "1回の注文で、対象となる金額の全額までポイントをご利用いただけます。",
      "ポイントの利用により、対象金額が0円になる場合があります。",
    ],
  },
  {
    heading: "有効期限",
    items: [
      "ポイントに有効期限はありません。",
      "失効処理や期限切れによるポイント消失は行いません。",
    ],
  },
  {
    heading: "会員状態が変わった場合",
    items: [
      "有料サポータープランを解約・期間満了し、一般会員へ戻った場合も、既に獲得したポイントは維持されます。",
      "プラン変更後は、変更後の会員ランクに応じたログインボーナスを適用します。",
      "アカウント自体を削除した場合は、保有ポイントは失効します。再登録しても復元できません。",
    ],
  },
  {
    heading: "決済が完了しなかった場合",
    items: [
      "決済が失敗した場合や、注文が正常に作成されなかった場合は、使用予定だったポイントを消費しません。",
      "ポイント消費後に注文処理が失敗した場合は、使用したポイントを自動的に戻します。",
    ],
  },
  {
    heading: "不正取得・誤付与について",
    items: [
      "システム不具合による重複付与、複数アカウントによる不正取得、自動操作などによる不正なログインボーナス取得、重複または不適切な料理投稿による取得、運営が誤って付与したポイントについては、対象ポイントを取り消すことがあります。",
    ],
  },
];

export default function PointTermsPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-stone-50">
      <Header />
      <main className="flex-1">
        <section className="bg-white py-16 md:py-20">
          <div className="container mx-auto max-w-3xl px-4 md:px-6">
            <h1 className="mb-8 font-heading text-2xl font-bold text-stone-900 md:text-3xl">
              ポイント利用条件
            </h1>
            <p className="text-sm text-stone-500 mb-10 leading-relaxed">
              &YOU 安藤青果のポイント制度では、以下の条件のもとでポイントをご利用いただけます。
              ご利用前にご確認ください。
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
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
