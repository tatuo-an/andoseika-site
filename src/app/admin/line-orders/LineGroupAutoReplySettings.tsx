"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import type { LineGroupAutoReplySetting } from "@/lib/line-group-auto-reply";

function stateLabel(setting: LineGroupAutoReplySetting): string {
  if (setting.state === "enabled") return "ON";
  if (setting.state === "disabled") return "OFF";
  return "未設定";
}

export function LineGroupAutoReplySettings() {
  const [groups, setGroups] = useState<LineGroupAutoReplySetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/line-group-settings", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "読み込みに失敗しました");
      setGroups(data.groups ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function update(groupId: string, autoReplyEnabled: boolean) {
    setUpdatingId(groupId);
    try {
      const res = await fetch("/api/admin/line-group-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, autoReplyEnabled }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "更新に失敗しました");
      setGroups((current) =>
        current.map((group) => (group.groupId === groupId ? data.setting : group))
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗しました");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section id="auto-reply-settings" className="mb-8 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex-1">
          <h2 className="font-bold text-stone-900">グループ自動応答設定</h2>
          <p className="mt-1 text-xs text-stone-500">未設定のグループには返信しません。グループごとにON/OFFを選んでください。</p>
        </div>
        <button
          type="button"
          onClick={() => { setLoading(true); void load(); }}
          disabled={loading}
          className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          更新
        </button>
      </div>

      {error && <p className="mb-3 text-xs text-red-600">{error}</p>}
      {loading && groups.length === 0 ? (
        <p className="py-4 text-center text-sm text-stone-400">読み込み中...</p>
      ) : groups.length === 0 ? (
        <p className="py-4 text-center text-sm text-stone-400">検出済みグループはありません</p>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <div key={group.groupId} className="rounded-xl border border-stone-100 bg-stone-50 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-stone-800">{group.groupName || "（グループ名未取得）"}</p>
                  <p className="break-all text-[11px] text-stone-400">{group.groupId}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-bold ${group.state === "enabled" ? "bg-green-100 text-green-700" : group.state === "disabled" ? "bg-stone-200 text-stone-600" : "bg-amber-100 text-amber-700"}`}>
                  {stateLabel(group)}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => update(group.groupId, true)}
                  disabled={updatingId === group.groupId || group.state === "enabled"}
                  className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-40"
                >
                  自動応答をON
                </button>
                <button
                  type="button"
                  onClick={() => update(group.groupId, false)}
                  disabled={updatingId === group.groupId || group.state === "disabled"}
                  className="flex-1 rounded-lg bg-stone-600 px-3 py-2 text-xs font-bold text-white hover:bg-stone-700 disabled:opacity-40"
                >
                  自動応答をOFF
                </button>
              </div>
              <p className="mt-2 text-[11px] text-stone-400">最終更新: {group.updatedAt || "—"}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
