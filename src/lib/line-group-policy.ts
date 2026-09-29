export const SHIIRE_GROUP_ID = "Cadd011b448330ca4627fdcf44807365a";
export const KOUGA_GROUP_ID = "Cf2c809ab100eecc067703719c3ad4b1e";

export const LEGACY_LINE_GROUP_DEFAULTS = [
  { groupId: KOUGA_GROUP_ID, groupName: "幸雅" },
  { groupId: SHIIRE_GROUP_ID, groupName: "仕入れ・出荷" },
] as const;

export type LegacyLineGroupAutoReplyState = "enabled" | "disabled";

// 既存コードに明示されていた2グループの挙動だけは移行時も維持する。
// それ以外のグループは推測せず、設定側でpending（返信停止）から始める。
export function legacyLineGroupAutoReplyState(groupId: string): LegacyLineGroupAutoReplyState | null {
  if (groupId === KOUGA_GROUP_ID) return "enabled";
  if (groupId === SHIIRE_GROUP_ID) return "disabled";
  return null;
}

export function isNegiReminderExcluded(groupId: string, groupName?: string | null) {
  if (groupId === SHIIRE_GROUP_ID) return true;
  return String(groupName ?? "").includes("紡ぎ");
}
