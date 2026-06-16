import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CalendarDays, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { google } from "googleapis";
import { BookingCard } from "@/components/mypage/BookingCard";

export const dynamic = "force-dynamic";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;
const SHEET_NAME = "体験予約";

function getSheets() {
    const authClient = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    return google.sheets({ version: "v4", auth: authClient });
}

async function getUserBookings(email: string) {
    try {
        const sheets = getSheets();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:L`,
        });
        const rows = res.data.values ?? [];
        return rows.slice(1)
            .filter(r => r[0] && r[1] === email && r[9] === "confirmed")
            .map(r => ({
                id: r[0] as string,
                experienceName: r[4] ?? "",
                date: r[5] ?? "",
                startTime: r[6] ?? "",
                durationMin: parseInt(r[7] ?? "0", 10) || 0,
                headcount: parseInt(r[8] ?? "0", 10) || 0,
                price: parseInt(r[11] ?? "0", 10) || 0,
            }))
            .sort((a, b) => a.date.localeCompare(b.date));
    } catch {
        return [];
    }
}

export default async function MyBookingsPage() {
    const session = await auth();
    if (!session?.user?.email) redirect("/login");

    const bookings = await getUserBookings(session.user.email);
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = bookings.filter(b => b.date >= today);
    const past = bookings.filter(b => b.date < today);

    return (
        <div className="min-h-screen flex flex-col bg-stone-50">
            <Header />
            <main className="flex-1 py-16">
                <div className="container mx-auto px-4 md:px-6 max-w-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <Link href="/mypage" className="text-stone-400 hover:text-stone-600 transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-2xl font-bold text-stone-900">体験予約</h1>
                    </div>

                    {bookings.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                            <CalendarDays className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                            <p className="text-stone-500 mb-6">予約はまだありません</p>
                            <Link
                                href="/experience"
                                className="inline-block px-6 py-2.5 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors text-sm"
                            >
                                体験を見る
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-8">
                            {upcoming.length > 0 && (
                                <section>
                                    <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-3">upcoming</h2>
                                    <div className="flex flex-col gap-4">
                                        {upcoming.map(b => (
                                            <BookingCard key={b.id} booking={b} isPast={false} />
                                        ))}
                                    </div>
                                </section>
                            )}
                            {past.length > 0 && (
                                <section>
                                    <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-3">past</h2>
                                    <div className="flex flex-col gap-4 opacity-60">
                                        {past.map(b => (
                                            <BookingCard key={b.id} booking={b} isPast={true} />
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
