"use client";

import { useEffect, useState } from "react";
import { Pencil, Check, X, Cake } from "lucide-react";

type Props = {
  fallbackName: string;
  email: string;
  image?: string;
};

function normalizeBirthday(raw: string): string {
  let s = raw.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
  s = s.replace(/[月年]/g, "/").replace(/日/g, "").trim();
  s = s.replace(/[/.\-・\s]+/g, "/");
  const parts = s.split("/").filter(Boolean);
  let m = "", d = "";
  if (parts.length === 2) { m = parts[0]; d = parts[1]; }
  else if (parts.length === 1 && /^\d{3,4}$/.test(parts[0])) {
    const digits = parts[0].padStart(4, "0");
    m = digits.slice(0, 2); d = digits.slice(2);
  } else return raw;
  const mn = parseInt(m, 10), dn = parseInt(d, 10);
  if (mn < 1 || mn > 12 || dn < 1 || dn > 31) return raw;
  return `${String(mn).padStart(2, "0")}/${String(dn).padStart(2, "0")}`;
}

export function ProfileCard({ fallbackName, email, image }: Props) {
  const [displayName, setDisplayName] = useState(fallbackName);
  const [birthday, setBirthday] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [editingBirthday, setEditingBirthday] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [birthdayInput, setBirthdayInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/my/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.displayName) setDisplayName(d.displayName);
        if (d.birthday) setBirthday(d.birthday);
      })
      .catch(() => {});
  }, []);

  async function saveName() {
    if (!nameInput.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/my/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: nameInput.trim() }),
      });
      const data = await res.json();
      if (data.ok) setDisplayName(data.displayName);
      setEditingName(false);
    } finally {
      setSaving(false);
    }
  }

  async function saveBirthday() {
    const normalized = birthdayInput.trim() ? normalizeBirthday(birthdayInput.trim()) : "";
    setSaving(true);
    try {
      const res = await fetch("/api/my/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthday: normalized }),
      });
      const data = await res.json();
      if (data.ok) setBirthday(data.birthday);
      setEditingBirthday(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex items-center gap-4">
      {image && <img src={image} alt={displayName} className="w-16 h-16 rounded-full shrink-0" />}
      <div className="flex-1 min-w-0">
        {/* アカウント名 */}
        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">アカウント名</p>
        {editingName ? (
          <div className="flex items-center gap-2 mb-1">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false); }}
              maxLength={50}
              autoFocus
              placeholder="サイトで使う表示名（ニックネーム可）"
              className="border border-stone-300 rounded-lg px-3 py-1.5 text-base font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-primary/30 w-full max-w-[240px]"
            />
            <button onClick={saveName} disabled={saving || !nameInput.trim()} className="p-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-40 transition-colors">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => setEditingName(false)} className="p-1.5 border border-stone-200 text-stone-500 rounded-lg hover:bg-stone-50 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setNameInput(displayName); setEditingName(true); }}
            className="group flex items-center gap-2 mb-0.5 cursor-pointer hover:bg-stone-50 -mx-2 px-2 py-1 rounded-lg transition-colors w-full text-left"
            title="アカウント名を編集"
          >
            <p className="font-bold text-lg text-stone-900 truncate">{displayName}</p>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 group-hover:bg-primary group-hover:text-white text-stone-500 text-[10px] font-bold transition-colors shrink-0">
              <Pencil className="w-3 h-3" />
              編集
            </span>
          </button>
        )}

        <p className="text-stone-500 text-sm truncate mb-1">{email}</p>

        {/* 誕生日 */}
        {editingBirthday ? (
          <div className="flex items-center gap-2 mt-1">
            <input
              type="text"
              value={birthdayInput}
              onChange={(e) => setBirthdayInput(e.target.value)}
              onBlur={(e) => { if (e.target.value.trim()) setBirthdayInput(normalizeBirthday(e.target.value.trim())); }}
              onKeyDown={(e) => { if (e.key === "Enter") saveBirthday(); if (e.key === "Escape") setEditingBirthday(false); }}
              placeholder="例: 08/15"
              maxLength={10}
              autoFocus
              className="border border-stone-300 rounded-lg px-3 py-1 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-primary/30 w-28"
            />
            <button onClick={saveBirthday} disabled={saving} className="p-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-40 transition-colors">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setEditingBirthday(false)} className="p-1.5 border border-stone-200 text-stone-500 rounded-lg hover:bg-stone-50 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 mt-1">
            <Cake className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-xs text-stone-400">{birthday || "誕生日未設定"}</span>
            <button onClick={() => { setBirthdayInput(birthday); setEditingBirthday(true); }} className="p-0.5 text-stone-300 hover:text-stone-500 transition-colors" title="誕生日を編集">
              <Pencil className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
