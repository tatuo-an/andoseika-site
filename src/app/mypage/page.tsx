import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { User, Package, MapPin, LogOut } from "lucide-react";
import Link from "next/link";

export default async function MyPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { user } = session;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <h1 className="text-3xl font-bold text-stone-900 mb-8">マイページ</h1>

          {/* プロフィール */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex items-center gap-4">
            {user.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={user.name ?? ""} className="w-16 h-16 rounded-full" />
            )}
            <div>
              <p className="font-bold text-lg text-stone-900">{user.name}</p>
              <p className="text-stone-500 text-sm">{user.email}</p>
            </div>
          </div>

          {/* メニュー */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-3">
                <Package className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-stone-900">注文・発送状況</h2>
              </div>
              <p className="text-sm text-stone-500">過去の注文履歴と発送状況を確認できます</p>
              <p className="text-xs text-stone-400 mt-3">※ 近日公開予定</p>
            </div>

            <Link href="/mypage/address" className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow block">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-stone-900">配送先住所</h2>
              </div>
              <p className="text-sm text-stone-500">よく使う配送先住所を保存できます</p>
              <p className="text-xs text-primary mt-3 font-medium">設定する →</p>
            </Link>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-3">
                <User className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-stone-900">サポーター会員</h2>
              </div>
              <p className="text-sm text-stone-500">サポータープランの加入状況を確認できます</p>
              <p className="text-xs text-stone-400 mt-3">※ 近日公開予定</p>
            </div>
          </div>

          {/* ログアウト */}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              ログアウト
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
