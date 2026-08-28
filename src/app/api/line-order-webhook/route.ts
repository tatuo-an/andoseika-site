import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sheets as sheetsApi, auth as googleAuth } from "@googleapis/sheets";
import { workersGoogleAuth } from "@/lib/googleAuth";
import { googleFetch } from "@/lib/googleFetch";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SPREADSHEET_ID = process.env.LINE_ORDER_SPREADSHEET_ID!;
const SHEET_AI_SESSIONS = "AIセッション";
const SHEET_ORDERS = "注文";
const SHEET_PRODUCTS = "商品";
const SHEET_BULK_HEAD = "大口注文";
const SHEET_BULK_LINE = "大口注文明細";
const SHEET_EXISTING_PARTNERS = "既存取引先リスト";

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

function getSheets() {
  const auth = workersGoogleAuth(["https://www.googleapis.com/auth/spreadsheets"]);
  return sheetsApi({ version: "v4", auth, fetchImplementation: googleFetch });
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

// 安藤さん本人へ「新しいAI注文が確定した」ことを通知する。
// OWNER_LINE_USER_ID未設定の間は通知をスキップする（取得方法はHANDOFF.md参照）。
async function notifyOwner(text: string) {
  const ownerId = process.env.OWNER_LINE_USER_ID;
  if (!ownerId) {
    console.log("[line-order-webhook] OWNER_LINE_USER_ID未設定のため安藤さんへの通知をスキップ");
    return;
  }
  await pushLineMessage(ownerId, text);
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
  type: "question" | "confirm" | "ignore";
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

  const nextThursday = nextThursdayInfo();

  const systemPrompt = `あなたは安藤青果のLINE注文受付アシスタントです。お客様からの自由文章のメッセージを読み取り、注文内容（品名・数量・配達希望日）を抽出してください。
配達は木曜日のみです。直近の配達日は ${nextThursday.iso}（${nextThursday.label}）です。

■絶対禁止事項（最優先で守ること）
- 規格（2L/L/優/大/小など）の確認・聞き返しを絶対にしないこと。「正確な規格を教えてください」「以下からお選びください」のような文章は禁止。
- 数量が「20ケースから30ケース」のような幅（レンジ）で書かれていても、「正確な数量を教えてください」のように聞き返すことを絶対にしないこと。
- こちらが把握している商品リストと照合して「お取り扱いしておりません」と断ることを絶対にしないこと。
- 上記はすべて、お客様が書いた表現をそのまま記録し、type:"confirm"として確認メッセージを返すことで対応する（安藤さんが後で人間として内容を確認・調整するので、AIが厳密な値を聞き出す必要はない）。
- ただし例外が1つだけあります：数量に単位（kg/ケース/箱/個など）が本文のどこにも書かれていない場合は、単位だけは必ず聞き返してください（下記「■単位が全く書かれていない場合」参照）。これは規格や数量幅の話とは別の、単位取り違えによる誤発注を防ぐための例外です。

■品名・数量の扱い方
品名は、こちらが用意した商品リストと照合したり、リストにあるものに置き換えたりしないでください。お客様が書いた表現（規格・サイズ・「規格外小」「5kg」「ケース」「箱」などを含む）をできるだけそのままdata.itemsのnameに入れてください。
お客様は1回のメッセージで複数の規格・数量をまとめて書くことがあります（例:「2L6ケース\nL7箱」のように改行や1行ずつで複数規格を並べる書き方）。その場合はdata.itemsに書かれた単位ごとに複数件を分けて入れてください（例: [{"name":"2L","quantity":6},{"name":"L","quantity":7}]）。
数量が幅（レンジ）で示された場合は、quantityに幅の上限値（「20ケースから30ケース」なら30）を入れ、品名に幅の情報も残してください（例: name「5kg規格外小（20〜30ケースの幅あり、上限で仮登録）」）。

■単位（kg/ケース/箱/個など）が全く書かれていない場合は必ず確認する（重要・例外）
お客様が「10」のように数字だけを送ってきて、kg・ケース・箱・個などの単位が本文のどこにも書かれていない場合は、規格や数量幅とは違い、この場合だけは聞き返してください（type:"question"）。「10箱でしょうか、10kgでしょうか？」のように、単位だけを具体的に確認する短い質問にしてください。
絶対にkg・ケース・箱・個などの単位を勝手に補って書かないでください。data.itemsのnameにも、確認メッセージのmessageにも、お客様が言っていない単位を書き加えることは禁止です（単位を取り違えると発注量が数倍〜十倍ずれる重大な誤発注につながるため）。単位がお客様の文章から明確に読み取れる場合（「ケース」「箱」「kg」等が本文にある場合）は、この確認は不要です。

■無関係なメッセージへの対応（重要）
このLINEグループ・チャットには注文と関係ない雑談も流れます。「こんにちは」等の挨拶、お礼、雑談、注文内容と無関係な質問（配達に関係ない世間話など）には反応しないでください。この場合はtype:"ignore"、messageは空文字列で返し、data.itemsは空配列にしてください。すでに注文情報を集めている途中（これまでに分かっている内容がある）場合でも、今回のメッセージが注文と無関係なら、そのセッションの内容には触れずtype:"ignore"を返してください。
「ねぎ」のように商品名らしき単語が単独で送られてきただけで、数量・単位（kg/ケース/箱/個など）も「ください」「お願いします」「注文したいです」といった注文の意思表示も伴わない場合は、注文が始まったとみなさずtype:"ignore"にしてください（雑談で品目の話題が出ただけの可能性があるため）。数量や単位、または明確な依頼表現が伴って初めて注文の意思表示とみなしてください。
迷った場合の判断基準：今回のメッセージに「数量（またはそれに準じる依頼表現）」と「配達日または品目」の両方、あるいは進行中の注文についての明確な返答（訂正・追加・確認への回答など）が含まれていればtype:"question"かtype:"confirm"。そうでなければtype:"ignore"。

■質問してよい場合
type:"question"にしてよいのは、注文しようとしていることは分かるが品名・数量・規格のいずれも一切書かれていない、または配達日について読み取れる情報が全くない場合だけです。少しでも情報があれば、それをそのまま採用して確認（type:"confirm"）に進んでください。
品名・数量が明確になったら、内容を要約してお客様に確認を求める文章を作成してください（複数件ある場合は全件を列挙して確認すること）。
配達日についてお客様から特に指定がなければ、"次の木曜日" のような曖昧な表現を使わず、必ず「${nextThursday.label}」のように具体的な日付でお客様に伝えてください。data.deliveryDateには "${nextThursday.iso}" をそのまま入れてください。

必ず次のJSON形式のみで回答してください。他の文章は一切含めないこと。
{"type":"question"または"confirm"または"ignore", "message":"お客様への返信文（ignoreの場合は空文字列）", "data":{"items":[{"name":"品名","quantity":数量}],"deliveryDate":"YYYY-MM-DD"}}`;

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

type ExistingPartner = { name: string; address: string; staffName: string };

// 既存取引先リストのLINE ID列（E列）をキーに完全一致で検索する。
// グループIDを事前に登録しておけば、LINEグループ名を推測に使わず正式な取引先名を引き当てられる。
async function matchPartnerByLineId(lineId: string): Promise<ExistingPartner | null> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_EXISTING_PARTNERS}!A:G`,
  });
  const rows = res.data.values ?? [];
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][4] || "").trim() === lineId) {
      return {
        name: String(rows[i][0] || ""),
        address: String(rows[i][1] || ""),
        staffName: String(rows[i][6] || ""),
      };
    }
  }
  return null;
}

// 未登録のグループIDを既存取引先リストに自動追加する（名前はLINEグループ名を仮登録、
// 正式な取引先名への修正は安藤さん/今村さんが手動で行う前提）
async function ensurePartnerRowForGroup(groupId: string): Promise<void> {
  const existing = await matchPartnerByLineId(groupId);
  if (existing) return;
  const groupName = (await getGroupName(groupId)) || "（グループ名取得失敗・要確認）";
  const sheets = getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_EXISTING_PARTNERS}!A:G`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[groupName, "", "", "", groupId, new Date().toISOString(), ""]],
    },
  });
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

async function finalizeAiOrder(data: { items: { name: string; quantity: number }[]; deliveryDate?: string }, source: { groupId?: string; userId?: string }): Promise<string | null> {
  const columns = await getWeeklySummaryColumns();
  const items = (data.items || []).map((it) => {
    const col = columns[matchSizeColumn(it.name, columns)];
    return { name: it.name, quantity: Number(it.quantity) || 0, price: col?.price || 0 };
  });
  if (items.length === 0) return null;

  // 数量の幅（レンジ）や規格が曖昧なまま仮登録された注文は、安藤さんへの通知で目立たせる
  const needsReview = items.some((it) => /幅あり|仮登録|要確認/.test(it.name));
  const itemsText = items.map((it) => `・${it.name} ${it.quantity}`).join("\n");

  const sheets = getSheets();
  const now = new Date().toISOString();

  if (source.groupId) {
    // 既存取引先リストにグループIDが事前登録されていれば、そちらの正式名称を優先して使う。
    // 未登録の場合のみ、LINEグループ名を仮の取引先名として使い、安藤さんに手動確認を促す。
    const partner = await matchPartnerByLineId(source.groupId);
    const groupName = partner ? partner.name : (await getGroupName(source.groupId)) || "（AIボット・要確認）";
    const note = partner
      ? "AIボット経由の自動登録（既存取引先リストと照合済み: " + groupName + "）"
      : "AIボット経由の自動登録（グループ名: " + groupName + "）。正式な取引先名か確認してください。";
    const receiptId = `BLK-AI-${Date.now()}`;
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_BULK_HEAD}!A:M`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          receiptId, now, source.groupId, groupName, "様", "LINE自動受付",
          "", "", note, "受付", "", "", "FALSE",
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

    return (
      (needsReview ? "【要確認】" : "") + "新しい注文が入りました（" + groupName + "）\n" +
      itemsText + "\n" +
      (data.deliveryDate ? "配達日: " + data.deliveryDate + "\n" : "") +
      (needsReview ? "\n※数量や規格が曖昧なまま仮登録されています。管理画面で確認してください。" : "")
    );
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

    return (
      (needsReview ? "【要確認】" : "") + "新しい個人注文が入りました\n" +
      itemsText + "\n" +
      (data.deliveryDate ? "配達日: " + data.deliveryDate + "\n" : "") +
      (needsReview ? "\n※数量や規格が曖昧なまま仮登録されています。管理画面で確認してください。" : "")
    );
  }
}

async function processIncomingMessage(event: LineEvent) {
  const sessionKey = event.source?.groupId || event.source?.userId || "";
  if (!sessionKey) return;
  const text = event.message?.text || "";

  // 「ID」とだけ送ると、送信者本人のLINE userIdをそのまま返信する。
  // 安藤さんのuserId（OWNER_LINE_USER_ID用）をグループ内からでも取得できるようにするための仕組み。
  if (/^id$/i.test(text.trim())) {
    const myUserId = event.source?.userId || "(取得できませんでした)";
    await pushLineMessage(sessionKey, "あなたのLINE ID:\n" + myUserId);
    return;
  }

  if (event.source?.groupId) {
    try {
      await ensurePartnerRowForGroup(event.source.groupId);
    } catch (err) {
      console.error("[line-order-webhook] ensurePartnerRowForGroup failed", err);
    }
  }

  const session = (await getAiSession(sessionKey)) || { row: -1, status: "collecting", data: {} };

  if (session.status === "confirming" && /^(はい|ok|お願いします|うん|そうです)/i.test(text.trim())) {
    const summary = await finalizeAiOrder(
      session.data as { items: { name: string; quantity: number }[]; deliveryDate?: string },
      event.source || {}
    );
    await saveAiSession(sessionKey, "done", {});
    await pushLineMessage(sessionKey, "ご注文を受け付けました。ありがとうございます！");
    if (summary) {
      try {
        await notifyOwner(summary);
      } catch (err) {
        console.error("[line-order-webhook] notifyOwner failed", err);
      }
    }
    return;
  }

  const aiResult = await callClaudeForOrderParsing(session.data, text);
  if (!aiResult) {
    // 解釈失敗時も無反応にする（雑談等で解釈できないケースが多いグループ内で、
    // 毎回「読み取れませんでした」と返信するとノイズになるため）
    return;
  }

  if (aiResult.type === "ignore") {
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
      if (event.type === "join" || event.type === "leave" || event.type === "memberJoined" || event.type === "memberLeft") {
        console.log(`[line-order-webhook] group event: type=${event.type} groupId=${event.source?.groupId || ""}`);
      }
      if (event.type === "message" && event.message?.type === "text") {
        await processIncomingMessage(event);
      } else if (event.type === "join" && event.source?.groupId) {
        await ensurePartnerRowForGroup(event.source.groupId);
      }
    } catch (err) {
      console.error("[line-order-webhook] event processing error", err);
    }
  }

  return NextResponse.json({ status: "ok" });
}
