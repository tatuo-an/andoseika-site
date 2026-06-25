import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { getTier, type TierKey } from "@/lib/tiers";
import { cycleLabel, parseCycleId, type CycleId } from "@/lib/deliveryCycle";
import { sendDeliveryLine, sendDeliveryEmail } from "@/lib/sendDeliveryNotice";

export const dynamic = "force-dynamic";

// 顧客マスタ（プロフィール行 r[1]==="__profile__"）:
//   A=email, C=display, E=tier, F=tierExpiry, G=cancelRequestedAt, H=lineUserId,
//   I=notifiedRenewals, J=preferredDeliverySeason
// 顧客マスタ（住所行 r[1]はラベル）:
//   A=email, B=label, C=name, D=postal, E=prefecture, F=city, G=street, H=building,
//   I=phone, J=birthday, K=relation
// 発送履歴シート: A=email, B=cycle, C=shippedAt, D=trackingNumber, E=status,
//                F=tierAtTime, G=addressSnapshot, H=memo

const PROFILE_SHEET = "顧客マスタ";
const HISTORY_SHEET = "発送履歴";

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

/** 発送履歴シートが無ければ作成し、ヘッダー行も初期化する */
async function ensureHistorySheet(): Promise<void> {
  const sheets = getSheets();
  const id = process.env.GOOGLE_SPREADSHEET_ID!;
  // シート一覧を取得
  const meta = await sheets.spreadsheets.get({ spreadsheetId: id });
  const exists = meta.data.sheets?.some((s) => s.properties?.title === HISTORY_SHEET);
  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: id,
      requestBody: {
        requests: [{ addSheet: { properties: { title: HISTORY_SHEET } } }],
      },
    });
  }
  // ヘッダー有無を確認、無ければ作る
  const head = await sheets.spreadsheets.values.get({
    spreadsheetId: id,
    range: `${HISTORY_SHEET}!A1:H1`,
  }).catch(() => ({ data: { values: [] as string[][] } }));
  if (!head.data.values || head.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: id,
      range: `${HISTORY_SHEET}!A1:H1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [["メール", "配送回", "発送日時", "追跡番号", "ステータス", "プラン", "送付先住所", "メモ"]],
      },
    });
  }
}

type Profile = {
  email: string;
  displayName: string;
  tier: TierKey;
  tierExpiry: string;
  cancelRequestedAt: string;
  lineUserId: string;
  preferredSeason: string; // "spring" | "autumn" | ""
};

type AddressRow = {
  email: string;
  label: string;
  name: string;
  postalCode: string;
  prefecture: string;
  city: string;
  street: string;
  building: string;
  phone: string;
};

type HistoryRow = {
  email: string;
  cycle: string;
  shippedAt: string;
  trackingNumber: string;
  status: string;
  tierAtTime: string;
  addressSnapshot: string;
  memo: string;
};

type DeliveryItem = {
  email: string;
  displayName: string;
  tier: TierKey;
  tierExpiry: string;
  preferredSeason: string;
  primaryAddress: AddressRow | null;
  shipped: boolean;
  shippedAt: string;
  trackingNumber: string;
  memo: string;
};

function fmtAddress(a: AddressRow | null): string {
  if (!a) return "";
  return [
    a.name,
    a.postalCode ? `〒${a.postalCode}` : "",
    `${a.prefecture}${a.city}${a.street}${a.building ? " " + a.building : ""}`,
    a.phone ? `TEL: ${a.phone}` : "",
  ]
    .filter(Boolean)
    .join(" / ");
}

async function loadProfilesAndAddresses(): Promise<{ profiles: Profile[]; addresses: Map<string, AddressRow[]> }> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
    range: `${PROFILE_SHEET}!A:K`,
  });
  const rows = res.data.values ?? [];
  const profiles: Profile[] = [];
  const addresses = new Map<string, AddressRow[]>();
  for (const r of rows.slice(1)) {
    if (!r[0]) continue;
    if (r[1] === "__profile__") {
      profiles.push({
        email: r[0] as string,
        displayName: r[2] ?? "",
        tier: getTier(r[4] ?? ""),
        tierExpiry: r[5] ?? "",
        cancelRequestedAt: r[6] ?? "",
        lineUserId: r[7] ?? "",
        preferredSeason: r[9] ?? "",
      });
    } else {
      const addr: AddressRow = {
        email: r[0] as string,
        label: r[1] ?? "",
        name: r[2] ?? "",
        postalCode: r[3] ?? "",
        prefecture: r[4] ?? "",
        city: r[5] ?? "",
        street: r[6] ?? "",
        building: r[7] ?? "",
        phone: r[8] ?? "",
      };
      if (!addresses.has(addr.email)) addresses.set(addr.email, []);
      addresses.get(addr.email)!.push(addr);
    }
  }
  return { profiles, addresses };
}

async function loadHistory(): Promise<HistoryRow[]> {
  const sheets = getSheets();
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
      range: `${HISTORY_SHEET}!A:H`,
    });
    const rows = res.data.values ?? [];
    return rows.slice(1).map((r) => ({
      email: r[0] ?? "",
      cycle: r[1] ?? "",
      shippedAt: r[2] ?? "",
      trackingNumber: r[3] ?? "",
      status: r[4] ?? "",
      tierAtTime: r[5] ?? "",
      addressSnapshot: r[6] ?? "",
      memo: r[7] ?? "",
    }));
  } catch {
    return [];
  }
}

function eligibleForCycle(profile: Profile, cycle: CycleId): boolean {
  const p = parseCycleId(cycle);
  if (!p) return false;
  // 解約予約済み or 契約満了している会員は対象外
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
  if (profile.cancelRequestedAt && (!profile.tierExpiry || profile.tierExpiry < today)) return false;
  if (!profile.tierExpiry || profile.tierExpiry < today) return false;

  if (profile.tier === "partner") return true; // 春・秋両方
  if (profile.tier === "minori") {
    // 希望時期が一致した場合のみ。未設定は春を初期値とみなす
    const pref = profile.preferredSeason || "spring";
    return pref === p.season;
  }
  return false;
}

function findPrimaryAddress(addrs: AddressRow[] | undefined): AddressRow | null {
  if (!addrs || addrs.length === 0) return null;
  // ラベル「デフォルト」「自分」を優先、無ければ先頭
  const preferred = addrs.find((a) => a.label === "自分" || a.label === "デフォルト");
  return preferred ?? addrs[0];
}

/** GET: 指定サイクルの対象者一覧を返す */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const cycle = req.nextUrl.searchParams.get("cycle") ?? "";
  if (!parseCycleId(cycle)) {
    return NextResponse.json({ error: "Invalid cycle" }, { status: 400 });
  }

  const [profilesAndAddrs, history] = await Promise.all([
    loadProfilesAndAddresses(),
    loadHistory(),
  ]);
  const { profiles, addresses } = profilesAndAddrs;

  const cycleHistory = new Map<string, HistoryRow>();
  for (const h of history) {
    if (h.cycle === cycle) cycleHistory.set(h.email, h);
  }

  const items: DeliveryItem[] = profiles
    .filter((p) => eligibleForCycle(p, cycle))
    .map((p) => {
      const primary = findPrimaryAddress(addresses.get(p.email));
      const hist = cycleHistory.get(p.email);
      return {
        email: p.email,
        displayName: p.displayName,
        tier: p.tier,
        tierExpiry: p.tierExpiry,
        preferredSeason: p.preferredSeason,
        primaryAddress: primary,
        shipped: !!hist && hist.status === "shipped",
        shippedAt: hist?.shippedAt ?? "",
        trackingNumber: hist?.trackingNumber ?? "",
        memo: hist?.memo ?? "",
      };
    });

  return NextResponse.json({ cycle, label: cycleLabel(cycle), items });
}

/** POST: 発送済みとして記録（既存があれば更新）＋通知送信 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { email?: string; cycle?: string; trackingNumber?: string; carrier?: string; memo?: string; notify?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const email = (body.email ?? "").trim();
  const cycle = (body.cycle ?? "").trim();
  const trackingNumber = (body.trackingNumber ?? "").trim();
  const carrier = (body.carrier ?? "").trim();
  const memo = (body.memo ?? "").trim();
  const shouldNotify = body.notify !== false;

  if (!email || !parseCycleId(cycle)) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  try {
    await ensureHistorySheet();
  } catch (err) {
    console.error("[deliveries] ensureHistorySheet failed", err);
    return NextResponse.json({ error: "シート初期化に失敗しました", detail: String(err) }, { status: 500 });
  }

  const [profilesAndAddrs, history] = await Promise.all([
    loadProfilesAndAddresses(),
    loadHistory(),
  ]);
  const { profiles, addresses } = profilesAndAddrs;

  const profile = profiles.find((p) => p.email === email);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const primary = findPrimaryAddress(addresses.get(email));
  const addressSnapshot = fmtAddress(primary);
  const nowJST =
    new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" }) +
    " " +
    new Date().toLocaleTimeString("ja-JP", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit" });

  // 既存履歴があれば update、なければ次の行に append（列ずれ防止のため update を使用）
  const sheets = getSheets();
  const existingIndex = history.findIndex((h) => h.email === email && h.cycle === cycle);
  const row = [email, cycle, nowJST, trackingNumber, "shipped", profile.tier, addressSnapshot, memo];

  try {
    if (existingIndex !== -1) {
      const sheetRow = existingIndex + 2;
      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
        range: `${HISTORY_SHEET}!A${sheetRow}:H${sheetRow}`,
        valueInputOption: "RAW",
        requestBody: { values: [row] },
      });
    } else {
      const colA = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
        range: `${HISTORY_SHEET}!A:A`,
      });
      const nextRow = (colA.data.values?.length ?? 0) + 1;
      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
        range: `${HISTORY_SHEET}!A${nextRow}:H${nextRow}`,
        valueInputOption: "RAW",
        requestBody: { values: [row] },
      });
    }
  } catch (err) {
    console.error("[deliveries] write failed", err);
    return NextResponse.json({ error: "履歴の書き込みに失敗しました", detail: String(err) }, { status: 500 });
  }

  // 通知送信
  const notificationLog: { channel: string; status: string; detail?: string }[] = [];
  if (shouldNotify) {
    const baseUrl = process.env.NEXT_PUBLIC_URL || "https://andoseika.jp";
    const notifyName = (primary?.name || profile.displayName || "お客様").trim();
    const params = {
      customerName: notifyName,
      cycleLabel: cycleLabel(cycle),
      trackingNumber: trackingNumber || undefined,
      carrier: carrier || undefined,
      baseUrl,
    };
    let sentViaLine = false;
    if (profile.lineUserId) {
      try {
        await sendDeliveryLine(profile.lineUserId, params);
        sentViaLine = true;
        notificationLog.push({ channel: "LINE", status: "sent" });
      } catch (err) {
        notificationLog.push({ channel: "LINE", status: "failed", detail: String(err) });
        console.error("[deliveries] LINE notification failed", err);
      }
    } else {
      notificationLog.push({ channel: "LINE", status: "skipped", detail: "lineUserId 未登録（LINEログイン時に自動保存）" });
    }

    if (!sentViaLine) {
      if (email.endsWith("@line.user")) {
        notificationLog.push({ channel: "email", status: "skipped", detail: "LINE専用メールアドレスのため送信不可" });
      } else {
        const { isMailerConfigured, activeMailerName } = await import("@/lib/mailer");
        if (!isMailerConfigured()) {
          notificationLog.push({ channel: "email", status: "skipped", detail: "メール送信が未設定（GMAIL_USER/GMAIL_APP_PASSWORD または RESEND_API_KEY を設定）" });
        } else {
          try {
            await sendDeliveryEmail(email, params);
            notificationLog.push({ channel: `email(${activeMailerName()})`, status: "sent", detail: email });
          } catch (err) {
            notificationLog.push({ channel: "email", status: "failed", detail: String(err) });
            console.error("[deliveries] email notification failed", err);
          }
        }
      }
    }
  } else {
    notificationLog.push({ channel: "none", status: "skipped", detail: "通知OFFで保存" });
  }

  return NextResponse.json({ success: true, notification: notificationLog });
}

/** DELETE: 発送記録を取り消す */
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const email = req.nextUrl.searchParams.get("email") ?? "";
  const cycle = req.nextUrl.searchParams.get("cycle") ?? "";
  if (!email || !parseCycleId(cycle)) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const history = await loadHistory();
  const index = history.findIndex((h) => h.email === email && h.cycle === cycle);
  if (index === -1) return NextResponse.json({ success: true });

  // 行をクリア（消すと他の行がずれるためクリアのみ）
  const sheetRow = index + 2;
  const sheets = getSheets();
  await sheets.spreadsheets.values.clear({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!,
    range: `${HISTORY_SHEET}!A${sheetRow}:H${sheetRow}`,
  });
  return NextResponse.json({ success: true });
}
