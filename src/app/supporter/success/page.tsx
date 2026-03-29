import Link from "next/link";
import { Check, Heart } from "lucide-react";

const PLAN_LABELS: Record<string, string> = {
    light: "ライト（梅）",
    standard: "スタンダード（竹）",
    premium: "プレミアム（松）",
};

export default function SupporterSuccessPage({
    searchParams,
}: {
    searchParams: { plan?: string };
}) {
    const plan = searchParams.plan || "standard";
    const planLabel = PLAN_LABELS[plan] || plan;

    return (
        <main className="min-h-screen bg-[#FAFAF9] flex items-center justify-center px-4">
            <div className="max-w-lg w-full text-center">
                <div className="mb-8 flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="h-12 w-12 text-primary" />
                    </div>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold font-heading text-stone-900 mb-4">
                    ありがとうございます！
                </h1>
                <p className="text-stone-600 leading-relaxed mb-6">
                    <strong className="text-stone-800">{planLabel}</strong>{" "}
                    プランへのご入会、ありがとうございます。
                    <br />
                    ご登録のメールアドレスに確認メールをお送りします。
                </p>

                <div className="bg-white border border-stone-100 rounded-2xl p-6 md:p-8 mb-8 text-left space-y-3">
                    <div className="flex items-start gap-3">
                        <Heart className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-stone-700 text-sm">
                            年2回の届け物は<strong>春（3月頃）</strong>と
                            <strong>秋（9月頃）</strong>にお届けします
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <Heart className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-stone-700 text-sm">
                            次回のお買い物から会員割引が自動で適用されます
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <Heart className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-stone-700 text-sm">
                            ご不明な点はお気軽にお問い合わせください
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/products"
                        className="inline-flex items-center justify-center gap-2 bg-primary text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                        商品を見る
                    </Link>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 bg-white text-stone-700 font-bold px-8 py-4 rounded-full border border-stone-200 hover:border-stone-300 transition-all"
                    >
                        トップへ戻る
                    </Link>
                </div>
            </div>
        </main>
    );
}
