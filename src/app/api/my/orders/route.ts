import { NextResponse } from "next/server";
import { sheets as sheetsApi, auth as googleAuth } from "@googleapis/sheets";
import { workersGoogleAuth } from "@/lib/googleAuth";
import { googleFetch } from "@/lib/googleFetch";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authClient = workersGoogleAuth(["https://www.googleapis.com/auth/spreadsheets"]);
  const sheets = sheetsApi({ version: "v4", auth: authClient, fetchImplementation: googleFetch });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
    range: "注文管理!A:O",
  });

  const rows = res.data.values ?? [];
  const email = session.user.email;

  const orders = rows
    .filter((r) => r[3] === email && r[0])
    .map((r) => ({
      orderNumber: r[0] ?? "",
      createdAt: r[1] ?? "",
      productNames: r[6] ?? "",
      amount: parseInt(r[7] ?? "0", 10) || 0,
      status: r[8] ?? "paid",
      desiredDate: r[10] ?? "",
      estimatedDate: r[14] ?? "",
    }))
    .reverse()
    .slice(0, 5);

  return NextResponse.json({ orders });
}
