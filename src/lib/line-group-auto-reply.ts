export type LineGroupAutoReplyState = "pending" | "enabled" | "disabled";
export type LineGroupAdminPromptStatus = "queued" | "sent" | "not_required";

export type LineGroupAutoReplySetting = {
  groupId: string;
  groupName: string;
  state: LineGroupAutoReplyState;
  autoReplyEnabled: boolean | null;
  detectedAt: string;
  updatedAt: string;
  updatedBy: string;
  adminPromptStatus: LineGroupAdminPromptStatus;
  adminPromptQueuedAt: string;
  adminPromptSentAt: string;
};

export const LINE_GROUP_SETTINGS_SHEET = "LINEグループ設定";
export const LINE_GROUP_SETTINGS_HEADERS = [
  "groupId",
  "groupName",
  "state",
  "autoReplyEnabled",
  "detectedAt",
  "updatedAt",
  "updatedBy",
  "adminPromptStatus",
  "adminPromptQueuedAt",
  "adminPromptSentAt",
] as const;

export function normalizeLineGroupAutoReplyState(value: unknown): LineGroupAutoReplyState {
  if (value === "enabled" || value === "disabled") return value;
  return "pending";
}

export function lineGroupSettingFromRow(row: string[]): LineGroupAutoReplySetting | null {
  const groupId = String(row[0] ?? "").trim();
  if (!groupId) return null;
  const state = normalizeLineGroupAutoReplyState(row[2]);
  return {
    groupId,
    groupName: String(row[1] ?? ""),
    state,
    autoReplyEnabled: state === "enabled" ? true : state === "disabled" ? false : null,
    detectedAt: String(row[4] ?? ""),
    updatedAt: String(row[5] ?? ""),
    updatedBy: String(row[6] ?? ""),
    adminPromptStatus:
      row[7] === "sent" || row[7] === "not_required"
        ? row[7]
        : state === "pending"
          ? "queued"
          : "not_required",
    adminPromptQueuedAt: String(row[8] ?? ""),
    adminPromptSentAt: String(row[9] ?? ""),
  };
}

export function shouldRunLineGroupAutoReply(state: LineGroupAutoReplyState): boolean {
  return state === "enabled";
}

export function stateFromAdminChoice(autoReplyEnabled: boolean): LineGroupAutoReplyState {
  return autoReplyEnabled ? "enabled" : "disabled";
}

// 深夜帯の範囲は業務側で未確定のため、時刻をコードへ決め打ちしない。
// 本番環境で明示的に immediate を設定した場合だけ管理者LINEへ送り、
// 未設定を含むそれ以外は安全側でキュー保存する。
export function shouldSendAdminPromptImmediately(mode: unknown): boolean {
  return String(mode ?? "").trim().toLowerCase() === "immediate";
}
