import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CommunityFeed } from "@/components/community/CommunityFeed";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const session = await auth();
  const myEmail = session?.user?.email ?? "";
  const myName = session?.user?.name ?? "";

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-stone-900">みんなの料理</h1>
            <p className="text-sm text-stone-500 mt-1">
              安藤青果の野菜で作った料理を投稿しよう。
              <Link href="/community-guidelines" className="ml-1 underline hover:text-primary">投稿ガイドライン</Link>
            </p>
          </div>
          <CommunityFeed myEmail={myEmail} myName={myName} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
