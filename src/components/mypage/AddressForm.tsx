"use client";

import { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";

type Address = {
    name: string;
    postalCode: string;
    prefecture: string;
    city: string;
    street: string;
    building: string;
    phone: string;
};

const EMPTY: Address = {
    name: "", postalCode: "", prefecture: "",
    city: "", street: "", building: "", phone: "",
};

export function AddressForm() {
    const [form, setForm] = useState<Address>(EMPTY);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetch("/api/address")
            .then((r) => r.json())
            .then((data) => {
                if (data.address) setForm(data.address);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setSaved(false);
    };

    // 郵便番号から住所を自動入力
    const handlePostalCode = async (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e);
        const code = e.target.value.replace(/-/g, "");
        if (code.length === 7) {
            try {
                const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${code}`);
                const data = await res.json();
                if (data.results?.[0]) {
                    const r = data.results[0];
                    setForm((prev) => ({
                        ...prev,
                        prefecture: r.address1,
                        city: r.address2 + r.address3,
                    }));
                }
            } catch { /* 失敗時は何もしない */ }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await fetch("/api/address", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            setSaved(true);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-stone-400" /></div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">お名前</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="安藤 達夫"
                    className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>

            <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">郵便番号</label>
                <input name="postalCode" value={form.postalCode} onChange={handlePostalCode}
                    placeholder="682-0000" maxLength={8}
                    className="w-40 border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <span className="text-xs text-stone-400 ml-2">入力すると住所が自動入力されます</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">都道府県</label>
                    <input name="prefecture" value={form.prefecture} onChange={handleChange} placeholder="鳥取県"
                        className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">市区町村</label>
                    <input name="city" value={form.city} onChange={handleChange} placeholder="倉吉市"
                        className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">番地</label>
                <input name="street" value={form.street} onChange={handleChange} placeholder="上井1丁目1-1"
                    className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>

            <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">建物名・部屋番号（任意）</label>
                <input name="building" value={form.building} onChange={handleChange} placeholder="○○マンション 101号"
                    className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>

            <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">電話番号</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="090-0000-0000"
                    className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>

            <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-stone-900 text-white px-8 py-3 rounded-full font-bold hover:bg-primary transition-colors disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
                {saved ? "保存しました" : "住所を保存する"}
            </button>
        </form>
    );
}
