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
};

const EMPTY: Address = {
    label: "", name: "", postalCode: "", prefecture: "",
    city: "", street: "", building: "", phone: "", birthday: "",
};

export function AddressForm() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Address | null>(null);
    const [originalLabel, setOriginalLabel] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const load = () => {
        setLoading(true);
        fetch("/api/address")
            .then(r => r.json())
            .then(data => setAddresses(data.addresses ?? []))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const startNew = () => {
        setEditing({ ...EMPTY });
        setOriginalLabel(null);
    };

    const startEdit = (addr: Address) => {
        setEditing({ ...addr });
        setOriginalLabel(addr.label);
    };

    const cancelEdit = () => {
        setEditing(null);
        setOriginalLabel(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editing) return;
        setEditing({ ...editing, [e.target.name]: e.target.value });
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
        if (!editing.label.trim()) {
            alert("配送先名（ラベル）を入力してください。例: 自宅、母、友人");
            return;
        }
        // 同じラベルの重複チェック（編集時は除外）
        if (addresses.some(a => a.label === editing.label && a.label !== originalLabel)) {
            alert(`「${editing.label}」というラベルは既に使われています`);
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/address", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...editing, originalLabel }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                alert(`保存失敗: ${body.error ?? res.status}`);
                return;
            }
            setEditing(null);
            setOriginalLabel(null);
            load();
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (label: string) => {
        if (!confirm(`配送先「${label}」を削除しますか？`)) return;
        const res = await fetch("/api/address", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ label }),
        });
        if (!res.ok) {
            alert("削除に失敗しました");
            return;
        }
        load();
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
                    <input name="birthday" value={editing.birthday} onChange={handleChange} placeholder="例: 08/15"
                        maxLength={5}
                        className="w-32 border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <p className="text-xs text-stone-400 mt-1">月/日の形式で入力（例: 08/15）。誕生日2週間前にお知らせします</p>
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
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
                                            {addr.label || "（ラベルなし）"}
                                        </span>
                                        <span className="font-medium text-stone-900">{addr.name}</span>
                                    </div>
                                    <p className="text-sm text-stone-600 leading-relaxed">
                                        〒{addr.postalCode}<br />
                                        {addr.prefecture}{addr.city}{addr.street}
                                        {addr.building && <><br />{addr.building}</>}
                                    </p>
                                    {addr.phone && (
                                        <p className="text-xs text-stone-400 mt-1">TEL: {addr.phone}</p>
                                    )}
                                    {addr.birthday && (
                                        <p className="text-xs text-stone-400 mt-1 flex items-center gap-1">
                                            <Cake className="w-3 h-3" />{addr.birthday}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1 flex-shrink-0">
                                    <button onClick={() => startEdit(addr)}
                                        className="p-2 text-stone-400 hover:text-primary rounded-lg hover:bg-stone-50 transition-colors"
                                        title="編集">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(addr.label)}
                                        className="p-2 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                                        title="削除">
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
