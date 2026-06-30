import { NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const a = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth: a });

  const [ordersRes, invRes] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!, range: "注文管理!A:I" }),
    sheets.spreadsheets.values.get({ spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!, range: "商品在庫!A:J" }),
  ]);

  // 購入済み商品名のセット
  const purchasedNames = new Set<string>();
  for (const r of ordersRes.data.values ?? []) {
    if (r[3] === session.user.email && r[8] !== "cancelled" && r[6]) {
      r[6].split(",").forEach((p: string) => {
        const name = p.replace(/×\d+/, "").trim();
        if (name) purchasedNames.add(name);
      });
    }
  }

  // 在庫シートからファミリー名と代表IDを収集
  // A=商品ID, B=バリアント名, J=ファミリー名
  const familyMap = new Map<string, string>(); // family → 代表ID
  for (const r of (invRes.data.values ?? []).slice(1)) {
    const id = r[0]?.trim();
    const variantName = r[1]?.trim() ?? "";
    const family = r[9]?.trim() ?? "";
    if (!id || !family) continue;
    // 購入済み商品名がバリアント名またはファミリー名に含まれていれば登録
    const matched = [...purchasedNames].some(
      (n) => variantName.includes(n) || n.includes(family) || family.includes(n)
    );
    if (matched && !familyMap.has(family)) {
      familyMap.set(family, id);
    }
  }

  // ファミリーが見つからなかった購入商品名はそのままフォールバックとして追加
  const families: { family: string; id: string }[] = Array.from(familyMap.entries()).map(([family, id]) => ({ family, id }));

  return NextResponse.json({ products: families });
}
