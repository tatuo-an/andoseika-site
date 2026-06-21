"use client";

import { useState, useEffect } from "react";
import { Check, Loader2, Plus, Trash2, Edit, X, MapPin, Cake } from "lucide-react";

type Address = {
    label: string;
    name: string;
    postalCode: string;
    prefecture: string;
    city: string;
    street: string;
    building: string;
    phone: string;
    birthday: string;
    relation: string;
};

const EMPTY: Address = {
    label: "", name: "", postalCode: "", prefecture: "",
    city: "", street: "", building: "", phone: "", birthday: "", relation: "",
};

const RELATIONS = [
    { value: "自分", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { value: "家族", color: "bg-green-100 text-green-700 border-green-300" },
    { value: "友達", color: "bg-orange-100 text-orange-700 border-orange-300" },
];

function RelationBadge({ value }: { value: string }) {
    const rel = RELATIONS.find(r => r.value === value);
    if (!rel) return null;
    return (
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${rel.color}`}>
            {rel.value}
        </span>
    );
}

export function AddressForm() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Address | null>(null);
    const [originalLabel, setOriginalLabel] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [savingRelation, setSavingRelation] = useState<string | null>(null);

    const load = () => {
        setLoading(true);
        fetch("/api/address")
            .then(r => r.json())
            .then(data => setAddresses(data.addresses ?? []))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const startNew = () => { setEditing({ ...EMPTY }); setOriginalLabel(null); };
    const startEdit = (addr: Address) => { setEditing({ ...addr }); setOriginalLabel(addr.label); };
    const cancelEdit = () => { setEditing(null); setOriginalLabel(null); };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editing) return;
        setEditing({ ...editing, [e.target.name]: e.target.value });
    };

    const normalizeBirthday = (raw: string): string => {
        let s = raw.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0));
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
    };

    const handlePostalCode = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editing) return;
        const value = e.target.value;
        setEditing({ ...editing, postalCode: value });
        const code = value.replace(/-/g, "");
        if (code.length === 7) {
            try {
                const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${code}`);
                const data = await res.json();
                if (data.results?.[0]) {
                    const r = data.results[0];
                    setEditing(prev => prev ? { ...prev, postalCode: value, prefecture: r.address1, city: r.address2 + r.address3 } : prev);
                }
            } catch { /* ignore */ }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        if (!editing.label.trim()) { alert("配送先名（ラベル）を入力してください。例: 自宅、母、友人"); return; }
        if (addresses.some(a => a.label === editing.label && a.label !== originalLabel)) {
            alert(`「${editing.label}」というラベルは既に使われています`); return;
        }
        setSaving(true);
        try {
            const res = await fetch("/api/address", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...editing, originalLabel }),
            });
            if (!res.ok) { const body = await res.json().catch(() => ({})); alert(`保存失敗: ${body.error ?? res.status}`); return; }
            setEditing(null); setOriginalLabel(null); load();
        } finally { setSaving(false); }
    };

    const handleDelete = async (label: string) => {
        if (!confirm(`配送先「${label}」を削除しますか？`)) return;
        const res = await fetch("/api/address", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label }) });
        if (!res.ok) { alert("削除に失敗しました"); return; }
        load();
    };

    const handleRelation = async (label: string, relation: string) => {
        // 同じ値をタップしたら解除
        const current = addresses.find(a => a.label === label)?.relation ?? "";
        const next = current === relation ? "" : relation;
        setSavingRelation(label);
        setAddresses(prev => prev.map(a => a.label === label ? { ...a, relation: next } : a));
        await fetch("/api/address", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ label, relation: next }),
        }).catch(() => {});
        setSavingRelation(null);
    };

    if (loading) {
        return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-stone-400" /></div>;
    }

    // 編集モード
    if (editing) {
        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="font-bold text-stone-900">
                        {originalLabel ? `配送先「${originalLabel}」を編集` : "新しい配送先を追加"}
                    </h2>
                    <button type="button" onClick={cancelEdit} className="p-1 text-stone-400 hover:text-stone-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">配送先名（ラベル）</label>
                    <input name="label" value={editing.label} onChange={handleChange} placeholder="例: 自宅、母、お友達"
                        className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <p className="text-xs text-stone-400 mt-1">配送先を識別するための名前です</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">お名前</label>
                    <input name="name" value={editing.name} onChange={handleChange} placeholder="安藤 達夫"
                        className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">郵便番号</label>
                    <input name="postalCode" value={editing.postalCode} onChange={handlePostalCode}
                        placeholder="682-0000" maxLength={8}
                        className="w-40 border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <span className="text-xs text-stone-400 ml-2">入力すると住所が自動入力されます</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">都道府県</label>
                        <input name="prefecture" value={editing.prefecture} onChange={handleChange} placeholder="鳥取県"
                            className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">市区町村</label>
                        <input name="city" value={editing.city} onChange={handleChange} placeholder="倉吉市"
                            className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">番地</label>
                    <input name="street" value={editing.street} onChange={handleChange} placeholder="上井1丁目1-1"
                        className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">建物名・部屋番号（任意）</label>
                    <input name="building" value={editing.building} onChange={handleChange} placeholder="○○マンション 101号"
                        className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">電話番号</label>
                    <input name="phone" value={editing.phone} onChange={handleChange} placeholder="090-0000-0000"
                        className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">誕生日（任意）</label>
                    <input
                        name="birthday"
                        value={editing.birthday}
                        onChange={handleChange}
                        onBlur={(e) => {
                            if (!editing || !e.target.value.trim()) return;
                            setEditing({ ...editing, birthday: normalizeBirthday(e.target.value.trim()) });
                        }}
                        placeholder="例: 8/13　6月13日　0613"
                        className="w-48 border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <p className="text-xs text-stone-400 mt-1">ご家族やお友達への贈り物用に設定してください。誕生日2週間前にお知らせします</p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button type="submit" disabled={saving}
                        className="flex items-center gap-2 bg-stone-900 text-white px-8 py-3 rounded-full font-bold hover:bg-primary transition-colors disabled:opacity-50">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        保存する
                    </button>
                    <button type="button" onClick={cancelEdit}
                        className="px-6 py-3 text-stone-500 hover:text-stone-700 text-sm font-medium">
                        キャンセル
                    </button>
                </div>
            </form>
        );
    }

    // 一覧モード
    return (
        <div className="space-y-4">
            {addresses.length === 0 ? (
                <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                    <p className="text-stone-500 mb-4">配送先がまだ登録されていません</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {addresses.map((addr) => (
                        <div key={addr.label} className="border border-stone-200 rounded-xl p-4 hover:border-primary/40 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
                                            {addr.label || "（ラベルなし）"}
                                        </span>
                                        <span className="font-medium text-stone-900">{addr.name}</span>
                                        {addr.relation && <RelationBadge value={addr.relation} />}
                                    </div>
                                    <p className="text-sm text-stone-600 leading-relaxed">
                                        〒{addr.postalCode}<br />
                                        {addr.prefecture}{addr.city}{addr.street}
                                        {addr.building && <><br />{addr.building}</>}
                                    </p>
                                    {addr.phone && <p className="text-xs text-stone-400 mt-1">TEL: {addr.phone}</p>}
                                    {addr.birthday && (
                                        <p className="text-xs text-stone-400 mt-1 flex items-center gap-1">
                                            <Cake className="w-3 h-3" />{addr.birthday}
                                        </p>
                                    )}

                                    {/* 続柄ボタン */}
                                    <div className="flex items-center gap-1.5 mt-3">
                                        <span className="text-[11px] text-stone-400 mr-0.5">続柄:</span>
                                        {RELATIONS.map(rel => (
                                            <button
                                                key={rel.value}
                                                onClick={() => handleRelation(addr.label, rel.value)}
                                                disabled={savingRelation === addr.label}
                                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                                                    addr.relation === rel.value
                                                        ? rel.color
                                                        : "bg-stone-50 text-stone-400 border-stone-200 hover:border-stone-300"
                                                }`}
                                            >
                                                {rel.value}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 flex-shrink-0">
                                    <button onClick={() => startEdit(addr)}
                                        className="p-2 text-stone-400 hover:text-primary rounded-lg hover:bg-stone-50 transition-colors" title="編集">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(addr.label)}
                                        className="p-2 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors" title="削除">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button onClick={startNew}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-stone-300 text-stone-600 px-5 py-4 rounded-xl text-sm font-bold hover:border-primary/50 hover:text-primary hover:bg-stone-50 transition-colors">
                <Plus className="w-5 h-5" />
                配送先を追加
            </button>
        </div>
    );
}
