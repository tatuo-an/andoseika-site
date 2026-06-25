// 詰め合わせ発送サイクル（春便り・秋便り）の共通ユーティリティ

export type Season = "spring" | "autumn";
export type CycleId = string; // 例: "spring2026", "autumn2026"

export function makeCycleId(season: Season, year: number): CycleId {
  return `${season}${year}`;
}

export function parseCycleId(cycle: CycleId): { season: Season; year: number } | null {
  const m = cycle.match(/^(spring|autumn)(\d{4})$/);
  if (!m) return null;
  return { season: m[1] as Season, year: parseInt(m[2], 10) };
}

export function cycleLabel(cycle: CycleId): string {
  const p = parseCycleId(cycle);
  if (!p) return cycle;
  const label = p.season === "spring" ? "春便り" : "秋便り";
  return `${label} ${p.year}`;
}

/** 今日時点で「今期」のサイクル：1〜6月→春、7〜12月→秋 */
export function currentCycle(today: Date = new Date()): CycleId {
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  return month <= 6 ? makeCycleId("spring", year) : makeCycleId("autumn", year);
}

/** 候補サイクル一覧（過去2サイクル＋現在＋将来2サイクル） */
export function recentCycles(today: Date = new Date()): CycleId[] {
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const cycles: CycleId[] = [];
  for (let yOffset = -1; yOffset <= 1; yOffset++) {
    cycles.push(makeCycleId("spring", year + yOffset));
    cycles.push(makeCycleId("autumn", year + yOffset));
  }
  // 過去方向に並べ替え（新しいサイクルが上）
  cycles.sort((a, b) => b.localeCompare(a));
  return cycles;
}

/** 発送目安月（春=3月、秋=9月） */
export function approximateShipMonth(cycle: CycleId): string {
  const p = parseCycleId(cycle);
  if (!p) return "";
  return p.season === "spring" ? `${p.year}年3月頃` : `${p.year}年9月頃`;
}
