import { NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";
import { cycleLabel } from "@/lib/deliveryCycle";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ items: [] });

  try {
    const authClient = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth: authClient });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
      range: "発送履歴!A:H",
    });
    const rows = res.data.values ?? [];
    const items = rows
      .slice(1)
      .filter((r) => r[0] === email && r[4] === "shipped")
      .map((r) => ({
        cycle: r[1] ?? "",
        cycleLabel: cycleLabel(r[1] ?? ""),
        shippedAt: r[2] ?? "",
        trackingNumber: r[3] ?? "",
      }))
      .sort((a, b) => b.shippedAt.localeCompare(a.shippedAt));
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
