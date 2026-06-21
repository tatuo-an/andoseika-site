import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { User, MapPin, LogOut, Settings, Heart, CalendarDays, Bookmark } from "lucide-react";
import Link from "next/link";
import { isAdmin } from "@/lib/admin";
import { OnlineCounter } from "@/components/admin/OnlineCounter";
import { SkipModeToggle } from "@/components/admin/SkipModeToggle";
import { MyOrders } from "@/components/mypage/MyOrders";
import { ProfileCard } from "@/components/mypage/ProfileCard";
import { BirthdayBanner } from "@/components/mypage/BirthdayBanner";
import { PointsCard } from "@/components/mypage/PointsCard";

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
          <ProfileCard
            fallbackName={user.name ?? ""}
            email={user.email ?? ""}
            image={user.image ?? undefined}
          />

          <BirthdayBanner />
          <PointsCard />

          {/* メニュー */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <MyOrders />

            <Link href="/mypage/saved-posts" className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow block">
              <div className="flex items-center gap-3 mb-3">
                <Bookmark className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-stone-900">記録した料理</h2>
              </div>
              <p className="text-sm text-stone-500">保存したみんなの料理を見られます</p>
              <p className="text-xs text-primary mt-3 font-medium">確認する →</p>
            </Link>

            <Link href="/mypage/favorites" className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow block">
              <div className="flex items-center gap-3 mb-3">
                <Heart className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-stone-900">お気に入り</h2>
              </div>
              <p className="text-sm text-stone-500">気になる商品を保存しておけます</p>
              <p className="text-xs text-primary mt-3 font-medium">確認する →</p>
            </Link>

            <Link href="/mypage/address" className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow block">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-stone-900">配送先住所</h2>
              </div>
              <p className="text-sm text-stone-500">よく使う配送先住所を保存できます</p>
              <p className="text-xs text-primary mt-3 font-medium">設定する →</p>
            </Link>

            <Link href="/mypage/bookings" className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow block">
              <div className="flex items-center gap-3 mb-3">
                <CalendarDays className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-stone-900">体験予約</h2>
              </div>
              <p className="text-sm text-stone-500">予約した体験の日程を確認できます</p>
              <p className="text-xs text-primary mt-3 font-medium">確認する →</p>
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

          {/* 管理者エリア */}
          {isAdmin(user.email) && (
            <div className="mb-6 space-y-3">
              <OnlineCounter />
              <SkipModeToggle />
              <Link
                href="/admin"
                className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 px-5 py-3 rounded-full text-sm font-bold transition-colors w-fit"
              >
                <Settings className="w-4 h-4" />
                管理画面
              </Link>
            </div>
          )}

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
