import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "サポーター会員規約 | 安藤青果",
  description: "安藤青果の農家サポーター制度（住民票）に関する会員規約です。契約期間・自動更新・解約・お届け物の内容についてご確認ください。",
};

const sections: { heading: string; items: (string | { text: string; sub?: string[] })[] }[] = [
  {
    heading: "会員プランと年会費",
    items: [
      "芽吹きサポーター：年会費 3,000円（税込）",
      "実りサポーター：年会費 5,000円（税込）",
      "農園パートナー：年会費 10,000円（税込）",
      "年会費はStripeを通じてクレジットカードでお支払いいただきます。",
    ],
  },
  {
    heading: "契約期間と自動更新",
    items: [
      "契約期間はお申し込み日から1年間です。",
      "契約期間終了後は、お客様が停止手続きを行わない限り、同一プランで1年間自動更新されます。",
      "自動更新時の年会費は、更新日当日にご登録のカードへ請求されます。",
    ],
  },
  {
    heading: "次回請求日・次回請求額の確認",
    items: [
      "次回更新日（＝次回請求日）はマイページ「サポーター」タブからご確認いただけます。",
      "次回請求額はご加入中のプランの年会費と同額です（プラン変更がない場合）。",
      "料金改定が行われる場合は、次回更新日の30日前までにメールおよびサイト上でご案内します。",
    ],
  },
  {
    heading: "自動更新の停止（解約）方法と期限",
    items: [
      "マイページ「サポーター」タブ →「自動更新を停止する」から、いつでも手続きができます。解約手数料はかかりません。",
      "次回更新日の前日23:59（日本時間）までに停止手続きを完了してください。更新日当日以降の手続きは、すでに処理された年会費には適用されません。",
      "自動更新を停止しても、現在の契約期間終了日まではすべての特典・割引・限定商品購入が継続してご利用いただけます。",
      "契約期間終了後は自動的に一般会員（無料）へ移行します。アカウントと保有ポイントはそのまま維持されます。",
    ],
  },
  {
    heading: "途中解約・返金",
    items: [
      "お客様都合による途中解約・日割り・月割りでの返金は承っておりません。",
      "以下の場合は確認の上で返金対応を行います：二重決済・誤請求・本人が承諾していない決済・当社都合によるサービス提供停止。",
      "返金が認められた場合は、ご登録のカードへ返金処理を行います（Stripeの仕様上、返金まで数営業日かかる場合があります）。",
    ],
  },
  {
    heading: "旬の詰め合わせのお届け（実りサポーター・農園パートナー）",
    items: [
      { text: "実りサポーター：年1回、春（3月ごろ）または秋（9月ごろ）のいずれかをご選択いただき、旬の詰め合わせをお届けします。" },
      { text: "農園パートナー：年2回（春・秋）、旬の詰め合わせをお届けします。" },
      "いずれも送料込みで追加費用はかかりません。",
      "詰め合わせの内容（品目・品種・内容量）は安藤青果がおまかせで選定します。お客様による品目の指定・変更はできません。",
      "加入時期によっては、最初のお届けが加入から半年以上先になる場合があります。",
      "農園パートナーの場合、解約後も契約期間中に予定されていたお届けは引き続き実施します。",
    ],
  },
  {
    heading: "不作・天候不良・欠品時の対応",
    items: [
      "天候不良・自然災害・病害虫等により収穫量が著しく減少した場合、詰め合わせの内容を変更する場合があります（同等価格の別農産物・加工品等で代替）。",
      "代替品での対応が困難な場合は、発送時期を延期することがあります。延期する場合は事前にメールでご案内します。",
      "延期が長期にわたる場合または当社の判断により発送が困難と判断した場合は、対象回分の詰め合わせを取りやめ、相当額をポイントまたは返金にて対応します（お客様のご希望を確認の上で選択いただきます）。",
    ],
  },
  {
    heading: "お届け先住所について",
    items: [
      "詰め合わせはマイページに登録された住所へ発送します。",
      "引越し等で住所が変わった場合は、発送予告メールが届く前までにマイページから住所を更新してください。",
      "旧住所への配送後、住所変更が原因で荷物が返送された場合、再発送にかかる送料はお客様のご負担となります。",
      "住所不備により荷物を受け取れなかった場合でも、詰め合わせの再送・返金は原則対応できません。",
    ],
  },
  {
    heading: "会員特典（割引・ポイント）の変更",
    items: [
      "会員割引率（3%・5%・8%等）、ログインボーナスポイント、誕生日ボーナスポイントの内容は、当社の判断により変更することがあります。",
      "変更が生じる場合は、変更日の30日前までにサイト上およびメールでお知らせします。",
      "お客様に著しく不利益となる重要な特典の変更（割引率の大幅引き下げ・ポイント付与の廃止等）は、原則として次回更新日以降から適用します。契約期間中に遡って適用することはありません。",
      "やむを得ず契約期間中に大きく特典を減らす場合は、お客様の選択により途中解約または相当額の返金に応じます。",
      "変更内容に同意いただけない場合は、次回更新日の前日までに自動更新を停止してください。",
      "限定商品のラインナップは時期・在庫状況により変動します。特定商品の継続的な供給は保証できません。",
    ],
  },
  {
    heading: "規約の変更",
    items: [
      "本規約は予告なく変更することがあります。重要な変更の場合は、変更日の30日前までにサイト上およびメールでご案内します。",
      "変更後も引き続きサービスをご利用いただいた場合、変更後の規約に同意いただいたものとみなします。",
    ],
  },
];

export default function SupporterTermsPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-stone-50">
      <Header />
      <main className="flex-1">
        <section className="bg-white py-16 md:py-20">
          <div className="container mx-auto max-w-3xl px-4 md:px-6">
            <h1 className="mb-8 font-heading text-2xl font-bold text-stone-900 md:text-3xl">
              サポーター会員規約
            </h1>
            <p className="text-sm text-stone-500 mb-10 leading-relaxed">
              農家サポーター制度「住民票」にご加入いただく前に、本規約をよくお読みください。
              お申し込みをいただいた時点で、本規約に同意いただいたものとみなします。<br />
              お届け物に関する詳細は
              <Link href="/supporter#plans" className="underline hover:text-primary mx-1">プラン詳細ページ</Link>
              もあわせてご参照ください。
            </p>
            <div className="space-y-10">
              {sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-lg font-bold text-stone-900 mb-3 border-l-4 border-primary pl-3">
                    {section.heading}
                  </h2>
                  <ul className="space-y-2 text-sm text-stone-700 leading-relaxed">
                    {section.items.map((item, i) => {
                      const text = typeof item === "string" ? item : item.text;
                      return (
                        <li key={i} className="flex gap-2">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                          <span>{text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
            <div className="mt-12 pt-8 border-t border-stone-200 text-xs text-stone-400 space-y-1">
              <p>制定日：2024年1月1日　最終更新：2026年7月1日</p>
              <p>事業者名：安藤青果 / &YOU　所在地：鳥取県</p>
              <p>
                お問い合わせ：
                <Link href="/contact/personal" className="underline hover:text-primary">お問い合わせフォーム</Link>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
