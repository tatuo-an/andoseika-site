import "server-only";

import { google, sheets_v4 } from "googleapis";
import {
  LINE_GROUP_SETTINGS_HEADERS,
  LINE_GROUP_SETTINGS_SHEET,
  lineGroupSettingFromRow,
  LineGroupAutoReplySetting,
  stateFromAdminChoice,
} from "@/lib/line-group-auto-reply";
import {
  LEGACY_LINE_GROUP_DEFAULTS,
  legacyLineGroupAutoReplyState,
} from "@/lib/line-group-policy";

type LocatedSetting = { row: number; setting: LineGroupAutoReplySetting };

export type EnsureLineGroupSettingResult = {
  setting: LineGroupAutoReplySetting;
  firstPromptRequired: boolean;
};

function quoteSheetTitle(title: string): string {
  return `'${title.replace(/'/g, "''")}'`;
}

export function getLineOrderSheets(): sheets_v4.Sheets {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

function spreadsheetId(): string {
  const id = process.env.LINE_ORDER_SPREADSHEET_ID;
  if (!id) throw new Error("LINE_ORDER_SPREADSHEET_ID is not configured");
  return id;
}

async function ensureSettingsSheet(sheets: sheets_v4.Sheets): Promise<void> {
  const id = spreadsheetId();
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: id,
    fields: "sheets.properties.title",
  });
  const exists = (metadata.data.sheets ?? []).some(
    (sheet) => sheet.properties?.title === LINE_GROUP_SETTINGS_SHEET
  );
  if (!exists) try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: id,
      requestBody: {
        requests: [{ addSheet: { properties: { title: LINE_GROUP_SETTINGS_SHEET } } }],
      },
    });
  } catch (err) {
    // 同時に複数イベントを受けた場合、先行リクエストが作成済みなら続行する。
    const refreshed = await sheets.spreadsheets.get({
      spreadsheetId: id,
      fields: "sheets.properties.title",
    });
    const createdByAnotherRequest = (refreshed.data.sheets ?? []).some(
      (sheet) => sheet.properties?.title === LINE_GROUP_SETTINGS_SHEET
    );
    if (!createdByAnotherRequest) throw err;
  }

  // 既存行は触らず、ヘッダーだけを現行列数へ拡張する。
  await sheets.spreadsheets.values.update({
    spreadsheetId: id,
    range: `${quoteSheetTitle(LINE_GROUP_SETTINGS_SHEET)}!A1:J1`,
    valueInputOption: "RAW",
    requestBody: { values: [[...LINE_GROUP_SETTINGS_HEADERS]] },
  });
}

async function readLocatedSettings(sheets: sheets_v4.Sheets): Promise<LocatedSetting[]> {
  await ensureSettingsSheet(sheets);
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
    range: `${quoteSheetTitle(LINE_GROUP_SETTINGS_SHEET)}!A:J`,
  });
  const rows = res.data.values ?? [];
  const located: LocatedSetting[] = [];
  for (let i = 1; i < rows.length; i++) {
    const setting = lineGroupSettingFromRow((rows[i] ?? []).map((v) => String(v ?? "")));
    if (setting) located.push({ row: i + 1, setting });
  }
  return located;
}

export async function listLineGroupAutoReplySettings(): Promise<LineGroupAutoReplySetting[]> {
  let located = await readLocatedSettings(getLineOrderSheets());
  for (const legacy of LEGACY_LINE_GROUP_DEFAULTS) {
    if (!located.some((item) => item.setting.groupId === legacy.groupId)) {
      await ensureLineGroupAutoReplySetting(legacy.groupId, legacy.groupName);
    }
  }
  located = await readLocatedSettings(getLineOrderSheets());
  return located
    .map((item) => item.setting)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function ensureLineGroupAutoReplySetting(
  groupId: string,
  groupName: string | null
): Promise<EnsureLineGroupSettingResult> {
  if (!groupId) throw new Error("groupId is required");
  const sheets = getLineOrderSheets();
  const located = await readLocatedSettings(sheets);
  const existing = located.find((item) => item.setting.groupId === groupId);
  if (existing) {
    if (groupName && groupName !== existing.setting.groupName) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId(),
        range: `${quoteSheetTitle(LINE_GROUP_SETTINGS_SHEET)}!B${existing.row}`,
        valueInputOption: "RAW",
        requestBody: { values: [[groupName]] },
      });
      existing.setting.groupName = groupName;
    }
    return { setting: existing.setting, firstPromptRequired: false };
  }

  const now = new Date().toISOString();
  const displayName = groupName || "（グループ名取得失敗・要確認）";
  const legacyState = legacyLineGroupAutoReplyState(groupId);
  const state = legacyState ?? "pending";
  const enabledValue = state === "enabled" ? "TRUE" : state === "disabled" ? "FALSE" : "";
  const updatedBy = legacyState ? "legacy-migration" : "system-detected";
  const setting: LineGroupAutoReplySetting = {
    groupId,
    groupName: displayName,
    state,
    autoReplyEnabled: state === "enabled" ? true : state === "disabled" ? false : null,
    detectedAt: now,
    updatedAt: now,
    updatedBy,
    adminPromptStatus: legacyState ? "not_required" : "queued",
    adminPromptQueuedAt: legacyState ? "" : now,
    adminPromptSentAt: "",
  };

  await sheets.spreadsheets.values.append({
    spreadsheetId: spreadsheetId(),
    range: `${quoteSheetTitle(LINE_GROUP_SETTINGS_SHEET)}!A:J`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[
        groupId,
        displayName,
        state,
        enabledValue,
        now,
        now,
        updatedBy,
        setting.adminPromptStatus,
        setting.adminPromptQueuedAt,
        setting.adminPromptSentAt,
      ]],
    },
  });

  return { setting, firstPromptRequired: legacyState === null };
}

export async function updateLineGroupAutoReplySetting(
  groupId: string,
  autoReplyEnabled: boolean,
  updatedBy: string
): Promise<LineGroupAutoReplySetting | null> {
  const sheets = getLineOrderSheets();
  const located = await readLocatedSettings(sheets);
  const existing = located.find((item) => item.setting.groupId === groupId);
  if (!existing) return null;

  const state = stateFromAdminChoice(autoReplyEnabled);
  const now = new Date().toISOString();
  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId(),
    range: `${quoteSheetTitle(LINE_GROUP_SETTINGS_SHEET)}!C${existing.row}:G${existing.row}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[state, autoReplyEnabled ? "TRUE" : "FALSE", existing.setting.detectedAt, now, updatedBy]],
    },
  });

  return {
    ...existing.setting,
    state,
    autoReplyEnabled,
    updatedAt: now,
    updatedBy,
    adminPromptStatus: existing.setting.adminPromptStatus,
    adminPromptQueuedAt: existing.setting.adminPromptQueuedAt,
    adminPromptSentAt: existing.setting.adminPromptSentAt,
  };
}

export async function markLineGroupAdminPromptSent(groupId: string): Promise<boolean> {
  const sheets = getLineOrderSheets();
  const located = await readLocatedSettings(sheets);
  const existing = located.find((item) => item.setting.groupId === groupId);
  if (!existing) return false;

  const now = new Date().toISOString();
  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId(),
    range: `${quoteSheetTitle(LINE_GROUP_SETTINGS_SHEET)}!H${existing.row}:J${existing.row}`,
    valueInputOption: "RAW",
    requestBody: { values: [["sent", existing.setting.adminPromptQueuedAt || now, now]] },
  });
  return true;
}
