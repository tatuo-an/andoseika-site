"use client";

import { useEffect, useState } from "react";
import { Pencil, Check, X } from "lucide-react";

type Props = {
  fallbackName: string;
  email: string;
  image?: string;
};

export function ProfileCard({ fallbackName, email, image }: Props) {
  const [displayName, setDisplayName] = useState(fallbackName);
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/my/profile")
      .then((r) => r.json())
      .then((d) => { if (d.displayName) setDisplayName(d.displayName); })
      .catch(() => {});
  }, []);

  function startEdit() {
    setInput(displayName);
    setEditing(true);
  }

  async function save() {
    if (!input.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/my/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: input.trim() }),
      });
      const data = await res.json();
      if (data.ok) setDisplayName(data.displayName);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function cancel() {
    setEditing(false);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex items-center gap-4">
      {image && <img src={image} alt={displayName} className="w-16 h-16 rounded-full shrink-0" />}
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
              maxLength={50}
              autoFocus
              className="border border-stone-300 rounded-lg px-3 py-1.5 text-base font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-primary/30 w-full max-w-[200px]"
            />
            <button
              onClick={save}
              disabled={saving || !input.trim()}
              className="p-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-40 transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={cancel}
              className="p-1.5 border border-stone-200 text-stone-500 rounded-lg hover:bg-stone-50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="font-bold text-lg text-stone-900 truncate">{displayName}</p>
            <button
              onClick={startEdit}
              className="p-1 text-stone-400 hover:text-stone-600 transition-colors shrink-0"
              title="名前を編集"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <p className="text-stone-500 text-sm truncate">{email}</p>
      </div>
    </div>
  );
}
