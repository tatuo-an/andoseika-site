import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ReviewsClient } from "./ReviewsClient";

export default async function AdminReviewsPage() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) redirect("/");
  return <div className="min-h-screen flex flex-col bg-stone-50"><Header />
    <main className="container mx-auto max-w-5xl flex-1 px-4 py-12"><ReviewsClient /></main><Footer /></div>;
}
