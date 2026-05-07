import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表示 | 安藤青果",
  description: "安藤青果の特定商取引法に基づく表示ページです。",
};

const rows = [
  { label: "販売業者名", value: "安藤青果" },
  { label: "代表者名", value: "安藤達夫" },
  {
    label: "所在地",
    value: "〒682-0002\n鳥取県倉吉市中江305-10",
  },
  { label: "電話番号", value: "070-8434-8124" },
  { label: "メールアドレス", value: "tatuo.an@gmail.com" },
  { label: "事業内容", value: "農産物、加工品、はちみつ等の販売" },
  {
    label: "販売価格",
    value: "各商品ページに税込価格で表示します。",
  },
  {
    label: "商品代金以外の\n必要料金",
    value:
      "送料、決済手数料、その他商品ページに記載のある費用がかかる場合があります。\n送料は配送地域・商品サイズ・配送方法により異なります。詳細は各商品ページまたは注文確認画面に表示します。",
  },
  {
    label: "支払方法",
    value:
      "クレジットカード決済（Visa / Mastercard / American Express / JCB 等）\n※ Stripe決済を利用します。",
  },
  {
    label: "支払時期",
    value: "クレジットカード決済：ご注文時に決済が確定します。",
  },
  {
    label: "商品の引渡時期",
    value:
      "ご注文確認後、通常3〜7営業日以内に発送いたします。\nただし、農産物の収穫状況、天候、入荷状況、配送状況により発送が前後する場合があります。",
  },
  {
    label: "返品・交換",
    value:
      "生鮮食品・食品という商品の性質上、お客様都合による返品・交換はお受けできません。\n商品に破損、不良、誤配送があった場合は、商品到着後3日以内にメールまたはお問い合わせフォームよりご連絡ください。内容を確認のうえ、代替品の発送または返金にて対応いたします。",
  },
  {
    label: "販売数量",
    value:
      "各商品ページに記載します。\n農産物のため、収穫量や在庫状況により販売数量が変動する場合があります。",
  },
  {
    label: "申込有効期限",
    value:
      "商品ページに販売期間・申込期限の記載がある場合は、その期限までとします。\n在庫切れ、収穫終了の場合は販売を終了することがあります。",
  },
  {
    label: "配送方法",
    value:
      "ヤマト運輸、クリックポスト、その他当店指定の配送方法にてお届けします。\n商品内容・サイズ・配送地域により配送方法が異なります。",
  },
];

export default function TokushoPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-stone-50">
      <Header />
      <main className="flex-1">
        <section className="bg-white py-16 md:py-20">
          <div className="container mx-auto max-w-3xl px-4 md:px-6">
            <h1 className="mb-8 font-heading text-2xl font-bold text-stone-900 md:text-3xl">
              特定商取引法に基づく表示
            </h1>
            <table className="w-full border-collapse text-sm leading-relaxed">
              <tbody>
                {rows.map(({ label, value }) => (
                  <tr key={label} className="border-b border-stone-200">
                    <th className="w-32 whitespace-pre-wrap py-3 pr-4 text-left align-top font-medium text-stone-600 md:w-44 md:pr-6">
                      {label}
                    </th>
                    <td className="whitespace-pre-wrap py-3 text-stone-800">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
