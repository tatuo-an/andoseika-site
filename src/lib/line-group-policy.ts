export const SHIIRE_GROUP_ID = "Cadd011b448330ca4627fdcf44807365a";
export const KOUGA_GROUP_ID = "Cf2c809ab100eecc067703719c3ad4b1e";

export function isNegiReminderExcluded(groupId: string, groupName?: string | null) {
  if (groupId === SHIIRE_GROUP_ID) return true;
  return String(groupName ?? "").includes("紡ぎ");
}
