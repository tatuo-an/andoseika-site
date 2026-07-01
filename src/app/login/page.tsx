import Link from "next/link";
import { signIn } from "@/auth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header />
      <main className="flex-1 flex items-center justify-center py-16">
        <div className="bg-white rounded-2xl shadow-sm p-10 w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-stone-900 mb-2">無料会員登録 / ログイン</h1>
          <p className="text-stone-500 text-sm mb-5">
            アカウントをお持ちでない方も、以下のボタンから<strong className="text-stone-700">無料で登録</strong>できます。
          </p>
          <ul className="text-left text-sm text-stone-600 bg-stone-50 rounded-xl px-5 py-4 mb-6 space-y-1.5">
            <li>🎁 ポイントが貯まる・使える</li>
            <li>🛒 注文履歴・配送状況を確認できる</li>
            <li>📅 体験農業・農場見学の予約ができる</li>
            <li>🌿 サポーター会員へのアップグレードができる</li>
          </ul>
          <p className="text-xs text-stone-400 mb-5">
            登録・ログインにより
            <Link href="/terms" className="underline hover:text-primary mx-1">利用規約</Link>
            および
            <Link href="/privacy" className="underline hover:text-primary mx-1">プライバシーポリシー</Link>
            に同意したものとみなします。
          </p>
          <div className="flex flex-col gap-3">
            {/* LINE（推奨） */}
            <div className="rounded-2xl border-2 border-[#06C755] bg-[#06C755]/5 p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xs bg-[#06C755] text-white font-bold px-2 py-0.5 rounded-full">おすすめ</span>
                <span className="text-xs text-stone-500">注文・発送通知がLINEで届く</span>
              </div>
              <form
                action={async () => {
                  "use server";
                  await signIn("line", { redirectTo: "/mypage" });
                }}
              >
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-3 bg-[#06C755] rounded-full px-6 py-3 font-bold text-white hover:bg-[#05b34c] transition-colors shadow-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.48 2 2 5.81 2 10.5c0 4.2 3.72 7.72 8.74 8.38.34.07.8.22.92.5.1.26.07.66.03.92l-.15.89c-.04.26-.21 1.03.9.56 1.12-.47 6.02-3.54 8.2-6.06C21.2 13.9 22 12.24 22 10.5 22 5.81 17.52 2 12 2z" fill="white"/>
                    <path d="M9.6 8.8H9a.2.2 0 0 0-.2.2v4.4c0 .11.09.2.2.2h.6a.2.2 0 0 0 .2-.2V9a.2.2 0 0 0-.2-.2zm5.8 0h-.8a.2.2 0 0 0-.2.2v2.617L12.25 8.893A.2.2 0 0 0 12.093 8.8H11.2a.2.2 0 0 0-.2.2v4.4c0 .11.09.2.2.2h.8a.2.2 0 0 0 .2-.2V10.73l2.156 2.437a.2.2 0 0 0 .153.07H15.4a.2.2 0 0 0 .2-.2V9a.2.2 0 0 0-.2-.2zM7.4 13.2H5.6V9a.2.2 0 0 0-.2-.2h-.8a.2.2 0 0 0-.2.2v4.4c0 .055.022.104.056.141A.2.2 0 0 0 4.6 13.6H7.4a.2.2 0 0 0 .2-.2v-.8a.2.2 0 0 0-.2-.2zm12-4.4h-2.8a.2.2 0 0 0-.2.2v4.4c0 .11.09.2.2.2h2.8a.2.2 0 0 0 .2-.2v-.8a.2.2 0 0 0-.2-.2H17.6v-.8h1.8a.2.2 0 0 0 .2-.2v-.8a.2.2 0 0 0-.2-.2H17.6V10h1.8a.2.2 0 0 0 .2-.2V9a.2.2 0 0 0-.2-.2z" fill="#06C755"/>
                  </svg>
                  LINEで登録 / ログイン
                </button>
              </form>
            </div>

            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-stone-200" />
              <span className="text-xs text-stone-400">または</span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            {/* Google */}
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/mypage" });
              }}
            >
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 bg-white border border-stone-300 rounded-full px-6 py-3 font-bold text-stone-700 hover:bg-stone-50 transition-colors shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Googleで登録 / ログイン
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
