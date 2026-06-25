"use client";

import { useState } from "react";
import { Sparkles, Loader2, X, Check } from "lucide-react";
import { EXTRA_FIELDS, type ExtraFieldKey } from "@/lib/extraDescriptions";

const ALL_FIELDS: { key: string; label: string }[] = [
  { key: "description", label: "商品説明" },
  ...EXTRA_FIELDS.map((f) => ({ key: f.key as string, label: f.label })),
];

type Props = {
  family: string;
  variations: string[];
  category: string;
  badges: string[];
  description: string;
  extras: Partial<Record<ExtraFieldKey, string>>;
  onApply: (drafts: { description?: string; extras: Partial<Record<ExtraFieldKey, string>> }) => void;
};

type Phase =
  | { kind: "idle" }
  | { kind: "select"; selected: Set<string> }
  | { kind: "loading"; selected: Set<string> }
  | { kind: "review"; selected: Set<string>; drafts: Record<string, string>; edited: Record<string, string>; applyChecked: Set<string> }
  | { kind: "insufficient"; missing: string[] }
  | { kind: "error"; message: string };

export function BulkAiDraftButton({
  family,
  variations,
  category,
  badges,
  description,
  extras,
  onApply,
}: Props) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });

  const currentValueOf = (key: string): string => {
    if (key === "description") return description;
    return extras[key as ExtraFieldKey] ?? "";
  };

  function openModal() {
    setOpen(true);
    // 初期選択：未入力項目のみチェック
    const selected = new Set<string>();
    for (const f of ALL_FIELDS) {
      if (!currentValueOf(f.key).trim()) selected.add(f.key);
    }
    setPhase({ kind: "select", selected });
  }

  function close() {
    setOpen(false);
    setPhase({ kind: "idle" });
  }

  function toggleSelect(key: string) {
    if (phase.kind !== "select") return;
    const next = new Set(phase.selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setPhase({ ...phase, selected: next });
  }

  async function generate() {
    if (phase.kind !== "select") return;
    const fields = Array.from(phase.selected);
    if (fields.length === 0) return;

    setPhase({ kind: "loading", selected: phase.selected });

    try {
      const currentValues: Record<string, string> = {
        description,
        ...Object.fromEntries(Object.entries(extras).filter(([, v]) => typeof v === "string")),
      };
      const res = await fetch("/api/admin/ai-draft-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ family, variations, category, badges, currentValues, fields }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPhase({ kind: "error", message: data.error ?? "生成に失敗しました" });
        return;
      }
      if (data.insufficient) {
        setPhase({ kind: "insufficient", missing: data.missing ?? [] });
        return;
      }
      const drafts: Record<string, string> = data.drafts ?? {};
      const edited = { ...drafts };
      // 反映チェック初期値：未入力の項目のみON
      const applyChecked = new Set<string>();
      for (const f of fields) {
        if (drafts[f] && !currentValueOf(f).trim()) applyChecked.add(f);
      }
      setPhase({ kind: "review", selected: phase.selected, drafts, edited, applyChecked });
    } catch {
      setPhase({ kind: "error", message: "通信エラーが発生しました" });
    }
  }

  function regenerate() {
    if (phase.kind !== "review") return;
    setPhase({ kind: "select", selected: phase.selected });
    setTimeout(generate, 50);
  }

  function applySelected() {
    if (phase.kind !== "review") return;
    const result: { description?: string; extras: Partial<Record<ExtraFieldKey, string>> } = { extras: {} };
    let overwrites = 0;
    for (const key of phase.applyChecked) {
      const text = (phase.edited[key] ?? "").trim();
      if (!text) continue;
      if (currentValueOf(key).trim()) overwrites++;
      if (key === "description") result.description = text;
      else result.extras[key as ExtraFieldKey] = text;
    }
    if (overwrites > 0 && !confirm(`${overwrites}件の項目は既に入力済みです。AI生成文で置き換えますか？`)) return;
    onApply(result);
    close();
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200 text-amber-800 text-xs font-bold whitespace-nowrap transition-colors shadow-sm"
        title="未入力項目を AI で一括生成"
      >
        <Sparkles className="w-3.5 h-3.5" />
        AIで商品情報を一括生成
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={close}>
          <div
            className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h2 className="font-bold text-stone-900">
                  {phase.kind === "review" ? "生成結果を確認・反映" : "AIで商品情報を一括生成"}
                </h2>
              </div>
              <button onClick={close} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="text-xs text-stone-500 bg-stone-50 border border-stone-100 rounded-lg p-3 leading-relaxed">
                対象商品：<span className="font-medium text-stone-700">{family || "(無名)"}</span>
                <br />
                AIは商品名・バリエーション・カテゴリー・バッジ・既存テキストだけを参照し、産地・栽培方法・農薬使用・甘さなどの事実は推測しません。生成結果は反映前に必ずご確認ください。
              </div>

              {/* Step 1: 項目選択 */}
              {phase.kind === "select" && (
                <div className="space-y-2">
                  <p className="text-sm font-bold text-stone-700">生成する項目を選択（未入力項目はデフォルトでチェック済み）</p>
                  <div className="space-y-1">
                    {ALL_FIELDS.map((f) => {
                      const filled = !!currentValueOf(f.key).trim();
                      const checked = phase.selected.has(f.key);
                      return (
                        <label
                          key={f.key}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer border ${
                            checked ? "border-amber-200 bg-amber-50/50" : "border-stone-200 bg-white hover:bg-stone-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSelect(f.key)}
                            className="accent-amber-600"
                          />
                          <span className="text-sm font-medium text-stone-800 flex-1">{f.label}</span>
                          <span className={`text-xs ${filled ? "text-emerald-600" : "text-stone-400"}`}>
                            {filled ? "入力済" : "未入力"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {phase.kind === "loading" && (
                <div className="flex items-center gap-2 text-sm text-stone-500 py-16 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {phase.selected.size}項目を生成中...（最大1分程度）
                </div>
              )}

              {phase.kind === "error" && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  {phase.message}
                </div>
              )}

              {phase.kind === "insufficient" && (
                <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  この商品を生成するための情報が不足しています。
                  {phase.missing.length > 0 && (
                    <ul className="list-disc list-inside mt-2 text-xs">
                      {phase.missing.map((m) => <li key={m}>{m}</li>)}
                    </ul>
                  )}
                </div>
              )}

              {/* Step 2: 確認・反映 */}
              {phase.kind === "review" && (
                <div className="space-y-4">
                  {Array.from(phase.selected).map((key) => {
                    const fieldDef = ALL_FIELDS.find((f) => f.key === key);
                    if (!fieldDef) return null;
                    const draft = phase.edited[key] ?? "";
                    const current = currentValueOf(key);
                    const apply = phase.applyChecked.has(key);
                    return (
                      <div
                        key={key}
                        className={`border rounded-xl overflow-hidden ${apply ? "border-amber-300" : "border-stone-200"}`}
                      >
                        <div
                          className={`px-3 py-2 flex items-center justify-between ${apply ? "bg-amber-50" : "bg-stone-50"}`}
                        >
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={apply}
                              onChange={(e) => {
                                const next = new Set(phase.applyChecked);
                                if (e.target.checked) next.add(key);
                                else next.delete(key);
                                setPhase({ ...phase, applyChecked: next });
                              }}
                              className="accent-amber-600"
                            />
                            <span className="text-sm font-bold text-stone-800">{fieldDef.label}</span>
                          </label>
                          {current.trim() && (
                            <span className="text-[11px] text-stone-500">既存テキストを置換します</span>
                          )}
                        </div>
                        <div className="p-3 space-y-2">
                          {current.trim() && (
                            <div>
                              <p className="text-[11px] text-stone-400 mb-1">現在の{fieldDef.label}</p>
                              <div className="bg-stone-50 border border-stone-200 rounded p-2 text-xs text-stone-600 whitespace-pre-wrap">
                                {current}
                              </div>
                            </div>
                          )}
                          <div>
                            <p className="text-[11px] text-stone-400 mb-1">AI生成（編集可）</p>
                            {draft ? (
                              <textarea
                                value={draft}
                                onChange={(e) =>
                                  setPhase({ ...phase, edited: { ...phase.edited, [key]: e.target.value } })
                                }
                                rows={3}
                                className="w-full border border-stone-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
                              />
                            ) : (
                              <p className="text-xs text-stone-400 italic">（AIがこの項目を出力できませんでした）</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-stone-100 bg-stone-50">
              {phase.kind === "select" && (
                <>
                  <button
                    onClick={close}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-200 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={generate}
                    disabled={phase.selected.size === 0}
                    className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    AIで一括生成（{phase.selected.size}項目）
                  </button>
                </>
              )}
              {phase.kind === "review" && (
                <>
                  <button
                    onClick={close}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-200 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={regenerate}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-stone-300 text-stone-700 bg-white hover:bg-stone-100 transition-colors"
                  >
                    再生成
                  </button>
                  <button
                    onClick={applySelected}
                    disabled={phase.applyChecked.size === 0}
                    className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    選択した項目を反映（{phase.applyChecked.size}項目）
                  </button>
                </>
              )}
              {(phase.kind === "loading" || phase.kind === "insufficient" || phase.kind === "error" || phase.kind === "idle") && (
                <button
                  onClick={close}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-200 transition-colors"
                >
                  閉じる
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
