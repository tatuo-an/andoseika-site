import { NextResponse } from "next/server";
import { sheets as sheetsApi, auth as googleAuth } from "@googleapis/sheets";
import { workersGoogleAuth } from "@/lib/googleAuth";
import { googleFetch } from "@/lib/googleFetch";
import { auth } from "@/auth";

export async function POST(_: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderNumber } = await params;
  const a = workersGoogleAuth(["https://www.googleapis.com/auth/spreadsheets"]);
  const sheets = sheetsApi({ version: "v4", auth: a, fetchImplementation: googleFetch });
  const id = process.env.GOOGLE_SPREADSHEET_ID!;

  const res = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: "注文管理!A:L" });
  const rows = res.data.values ?? [];
  const rowIndex = rows.findIndex((r) => r[0] === orderNumber);
  if (rowIndex === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const row = rows[rowIndex];
  if (row[3] !== session.user.email) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (row[8] !== "shipping") return NextResponse.json({ error: "Cannot complete" }, { status: 400 });

  const deliveredAt = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: id,
    requestBody: {
      valueInputOption: "RAW",
      data: [
        { range: `注文管理!I${rowIndex + 1}`, values: [["delivered"]] },
        { range: `注文管理!N${rowIndex + 1}`, values: [[deliveredAt]] },
      ],
    },
  });

  return NextResponse.json({ ok: true });
}
