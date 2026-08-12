import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { google } from "googleapis";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SPREADSHEET_ID = process.env.LINE_ORDER_SPREADSHEET_ID!;
const SHEET_AI_SESSIONS = "AIセッション";
const SHEET_ORDERS = "注文";
const SHEET_PRODUCTS = "商品";
const SHEET_BULK_HEAD = "大口注文";
const SHEET_BULK_LINE = "大口注文明細";

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

function verifyLineSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret || !signature) return false;
  const hash = crypto.createHmac("sha256", secret).update(rawBody).digest("base64");
  return hash === signature;
}

type LineEvent = {
  type: string;
  replyToken?: string;
  source?: { groupId?: string; userId?: string };
  message?: { type: string; text?: string };
};

// replyToken方式（api.line.me/.../reply）は有効期限が短く、Vercelのサーバーレス関数の
// コールドスタート等でタイムアウトしやすいため、期限のないpush APIを使う
// （replyより消費クォータの都合は悪いが、確実性を優先する）。
async function pushLineMessage(to: string, text: string) {
  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ to, messages: [{ type: "text", text }] }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error(`[line-order-webhook] LINE push failed (${res.status}): ${errText}`);
  }
}

type AiSession = { row: number; status: string; data: Record<string, unknown> };

async function getAiSession(key: string): Promise<AiSession | null> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_AI_SESSIONS}!A:D`,
  });
  const rows = res.data.values ?? [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === key) {
      let data: Record<string, unknown> = {};
      try {
        data = JSON.parse(rows[i][2] || "{}");
      } catch {
        data = {};
      }
      return { row: i + 1, status: rows[i][1] || "collecting", data };
    }
  }
  return null;
}

async function saveAiSession(key: string, status: string, data: Record<string, unknown>) {
  const sheets = getSheets();
  const existing = await getAiSession(key);
  const values = [key, status, JSON.stringify(data || {}), new Date().toISOString()];
  if (existing) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_AI_SESSIONS}!A${existing.row}:D${existing.row}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [values] },
    });
  } else {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_AI_SESSIONS}!A:D`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [values] },
    });
  }
}

type ProductColumn = { id: string; name: string; price: number };

async function getWeeklySummaryColumns(): Promise<ProductColumn[]> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_PRODUCTS}!A:G`,
  });
  const rows = res.data.values ?? [];
  const columns: ProductColumn[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0]) continue;
    const group = r[5] || "";
    const availabilityRaw = String(r[6] ?? "").trim();
    const available = availabilityRaw === "" || availabilityRaw.toUpperCase() === "TRUE";
    if (group === "白ネギ" && available) {
      columns.push({ id: r[0], name: r[1], price: Number(r[2]) || 0 });
    }
  }
  return columns;
}

function matchSizeColumn(itemName: string, columns: ProductColumn[]): number {
  const name = itemName || "";
  for (let i = 0; i < columns.length; i++) {
    if (name.indexOf(columns[i].name) >= 0) return i;
  }
  const rules: { keyword: string; label: string }[] = [
    { keyword: "2L", label: "2L" },
    { keyword: "L4", label: "L4" },
    { keyword: "優", label: "優" },
    { keyword: "大", label: "大" },
    { keyword: "小", label: "小" },
    { keyword: "L", label: "L" },
  ];
  for (const r of rules) {
    if (name.indexOf(r.keyword) < 0) continue;
    for (let i = 0; i < columns.length; i++) {
      if (columns[i].name.indexOf(r.label) >= 0) return i;
    }
  }
  return -1;
}

type ClaudeResult = {
  type: "question" | "confirm";
  message: string;
  data: { items: { name: string; quantity: number }[]; deliveryDate?: string };
};

// 発送サイクルは「月曜12時締切→水曜仕入れ→木曜発送」。
// 直近の木曜日を求めた上で、その締切（木曜の3日前＝月曜12時）を今が過ぎていれば
// 1週間先の木曜日にずらす（例: 水曜に注文したら今週木曜には間に合わないので来週木曜になる）。
function nextThursdayInfo(): { iso: string; label: string } {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  const day = now.getDay(); // 0=日 ... 4=木
  let diff = 4 - day;
  if (diff < 0) diff += 7;
  let d = new Date(now);
  d.setDate(d.getDate() + diff);

  const cutoff = new Date(d);
  cutoff.setDate(cutoff.getDate() - 3); // 木曜の3日前＝月曜
  cutoff.setHours(12, 0, 0, 0);

  if (now >= cutoff) {
    d = new Date(d);
    d.setDate(d.getDate() + 7);
  }

  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const label = `${d.getMonth() + 1}月${d.getDate()}日(木)`;
  return { iso, label };
}

async function callClaudeForOrderParsing(
  sessionData: Record<string, unknown>,
  newText: string
): Promise<ClaudeResult | null> {
  if (!anthropic) return null;

  const columns = await getWeeklySummaryColumns();
  const productListText = columns.map((c) => `${c.name}（¥${c.price}）`).join("、");
  const nextThursday = nextThursdayInfo();

  const systemPrompt = `あなたは安藤青果のLINE注文受付アシスタントです。お客様からの自由文章のメッセージを読み取り、注文内容（品名・数量・配達希望日）を抽出してください。
現在注文可能な商品: ${productListText}
配達は木曜日のみです。直近の配達日は ${nextThursday.iso}（${nextThursday.label}）です。
情報が不足している場合は、不足している点だけを尋ねる短い質問を作成してください。
品名・数量が明確になったら、内容を要約してお客様に確認を求める文章を作成してください。
配達日についてお客様から特に指定がなければ、"次の木曜日" のような曖昧な表現を使わず、必ず「${nextThursday.label}」のように具体的な日付でお客様に伝えてください。data.deliveryDateには "${nextThursday.iso}" をそのまま入れてください。
必ず次のJSON形式のみで回答してください。他の文章は一切含めないこと。
{"type":"question"または"confirm", "message":"お客様への返信文", "data":{"items":[{"name":"品名","quantity":数量}],"deliveryDate":"YYYY-MM-DD"}}`;

  const userPrompt = `これまでに分かっている内容: ${JSON.stringify(sessionData || {})}\n今回のメッセージ: ${newText}`;

  try {
    const res = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });
    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]) as ClaudeResult;
  } catch (err) {
    console.error("[line-order-webhook] Claude API error", err);
    return null;
  }
}

async function getGroupName(groupId: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.line.me/v2/bot/group/${groupId}/summary`, {
      headers: { Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}` },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { groupName?: string };
    return json.groupName || null;
  } catch (err) {
    console.error("[line-order-webhook] getGroupName failed", err);
    return null;
  }
}

async function finalizeAiOrder(data: { items: { name: string; quantity: number }[]; deliveryDate?: string }, source: { groupId?: string; userId?: string }) {
  const columns = await getWeeklySummaryColumns();
  const items = (data.items || []).map((it) => {
    const col = columns[matchSizeColumn(it.name, columns)];
    return { name: it.name, quantity: Number(it.quantity) || 0, price: col?.price || 0 };
  });
  if (items.length === 0) return;

  const sheets = getSheets();
  const now = new Date().toISOString();

  if (source.groupId) {
    // 法人（グループチャット経由）：正式な会社名は不明なため、LINEグループ名を取引先名として使う
    // （安藤さんが後で正式名称に手動修正する前提。取得できない場合のみ仮名にフォールバック）
    const groupName = (await getGroupName(source.groupId)) || "（AIボット・要確認）";
    const receiptId = `BLK-AI-${Date.now()}`;
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_BULK_HEAD}!A:M`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          receiptId, now, "", groupName, "様", "LINE自動受付",
          "", "", "AIボット経由の自動登録（グループ名: " + groupName + "）。正式な取引先名か確認してください。", "受付", "", "", "FALSE",
        ]],
      },
    });
    const lineRows = items.map((it) => [
      receiptId, data.deliveryDate || "", it.name, it.quantity, "kg", it.price, 8, "商品", it.price * it.quantity,
    ]);
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_BULK_LINE}!A:I`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: lineRows },
    });
  } else {
    const orderId = `ORD-AI-${Date.now()}`;
    const rows = items.map((it) => [
      orderId, source.userId || "", "（AIボット・要確認）", it.name, it.quantity, it.price,
      it.price * it.quantity, "受付", now, data.deliveryDate || "", "", "LINE個人(AI)", "FALSE",
    ]);
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_ORDERS}!A:M`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: rows },
    });
  }
}

async function processIncomingMessage(event: LineEvent) {
  const sessionKey = event.source?.groupId || event.source?.userId || "";
  if (!sessionKey) return;
  const text = event.message?.text || "";

  const session = (await getAiSession(sessionKey)) || { row: -1, status: "collecting", data: {} };

  if (session.status === "confirming" && /^(はい|ok|お願いします|うん|そうです)/i.test(text.trim())) {
    await finalizeAiOrder(
      session.data as { items: { name: string; quantity: number }[]; deliveryDate?: string },
      event.source || {}
    );
    await saveAiSession(sessionKey, "done", {});
    await pushLineMessage(sessionKey, "ご注文を受け付けました。ありがとうございます！");
    return;
  }

  const aiResult = await callClaudeForOrderParsing(session.data, text);
  if (!aiResult) {
    await pushLineMessage(sessionKey, "すみません、うまく読み取れませんでした。もう一度お願いします。");
    return;
  }

  if (aiResult.type === "confirm") {
    await saveAiSession(sessionKey, "confirming", aiResult.data);
  } else {
    await saveAiSession(sessionKey, "collecting", aiResult.data || session.data);
  }
  await pushLineMessage(sessionKey, aiResult.message);
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-line-signature");

  if (!verifyLineSignature(rawBody, signature)) {
    console.error("[line-order-webhook] invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: { events?: LineEvent[] };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const events = body.events || [];
  // LINEは200を早く返すことを期待するため、処理自体は待たずにレスポンスしたいところだが、
  // Vercelのサーバーレス関数は応答後に処理を継続できないため、ここでは同期的に処理する。
  for (const event of events) {
    try {
      if (event.type === "message" && event.message?.type === "text") {
        await processIncomingMessage(event);
      }
    } catch (err) {
      console.error("[line-order-webhook] event processing error", err);
    }
  }

  return NextResponse.json({ status: "ok" });
}
