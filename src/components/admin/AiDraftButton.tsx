"use client";

import { useState } from "react";
import { Sparkles, Loader2, X } from "lucide-react";

type Props = {
  family: string;
  variations?: string[];
  category?: string;
  badges?: string[];
  current: string;
  onApply: (text: string) => void;
};

type DraftState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; draft: string; edited: string }
  | { status: "insufficient"; missing: string[] }
  | { status: "error"; message: string };

export function AiDraftButton({ family, variations, category, badges, current, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<DraftState>({ status: "idle" });

  async function generate() {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/admin/ai-draft-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ family, variations, category, badges, current }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState({ status: "error", message: data.error ?? "生成に失敗しました" });
        return;
      }
      if (data.insufficient) {
        setState({ status: "insufficient", missing: data.missing ?? [] });
        return;
      }
      setState({ status: "ready", draft: data.draft ?? "", edited: data.draft ?? "" });
    } catch {
      setState({ status: "error", message: "通信エラーが発生しました" });
    }
  }

  function openModal() {
    setOpen(true);
    generate();
  }

  function close() {
    setOpen(false);
    setState({ status: "idle" });
  }

  function apply() {
    if (state.status !== "ready") return;
    const text = state.edited.trim();
    if (!text) return;
    if (current.trim() && !confirm("現在の商品説明をAI生成文で置き換えます。よろしいですか？")) return;
    onApply(text);
    close();
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs font-medium whitespace-nowrap transition-colors"
        title="AIで商品説明の下書きを作成"
      >
        <Sparkles className="w-3 h-3" />
        AIで下書きを作成
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={close}>
          <div
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h2 className="font-bold text-stone-900">AIで商品説明の下書きを作成</h2>
              </div>
              <button onClick={close} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="text-xs text-stone-500 bg-stone-50 border border-stone-100 rounded-lg p-3 leading-relaxed">
                対象商品：<span className="font-medium text-stone-700">{family || "(無名)"}</span>
                <br />
                AIは商品名・バリエーション・カテゴリー・既存説明文だけを参照します。価格・在庫・産地・栽培方法など事実情報は推測しません。生成結果は反映前に必ずご確認ください。
              </div>

              {current.trim() && (
                <div>
                  <p className="text-xs font-bold text-stone-500 mb-1">現在の商品説明</p>
                  <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-sm text-stone-700 whitespace-pre-wrap">
                    {current}
                  </div>
                </div>
              )}

              {state.status === "loading" && (
                <div className="flex items-center gap-2 text-sm text-stone-500 py-8 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  生成中...
                </div>
              )}

              {state.status === "error" && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  {state.message}
                </div>
              )}

              {state.status === "insufficient" && (
                <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  この項目を生成するための情報が不足しています。
                  {state.missing.length > 0 && (
                    <ul className="list-disc list-inside mt-2 text-xs">
                      {state.missing.map((m) => <li key={m}>{m}</li>)}
                    </ul>
                  )}
                </div>
              )}

              {state.status === "ready" && (
                <div>
                  <p className="text-xs font-bold text-stone-500 mb-1">AI生成下書き（編集できます）</p>
                  <textarea
                    value={state.edited}
                    onChange={(e) => setState({ ...state, edited: e.target.value })}
                    rows={6}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-stone-100 bg-stone-50">
              <button
                onClick={close}
                className="px-4 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-200 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={generate}
                disabled={state.status === "loading"}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-stone-300 text-stone-700 bg-white hover:bg-stone-100 disabled:opacity-50 transition-colors"
              >
                再生成
              </button>
              <button
                onClick={apply}
                disabled={state.status !== "ready" || !state.edited.trim()}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                この下書きを反映
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
