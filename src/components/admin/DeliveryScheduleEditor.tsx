"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Save, Loader2 } from "lucide-react";

type DeliveryEntry = {
    emoji: string;
    title: string;
    month: string;
    items: string;
    description: string;
};

type Schedule = {
    spring: DeliveryEntry;
    autumn: DeliveryEntry;
};

const DEFAULT_SCHEDULE: Schedule = {
    spring: {
        emoji: "🌸",
        title: "春のお届け",
        month: "3月ごろ",
        items: "干し芋＋はちみつスティック",
        description: "冬の恵みをギュッと凝縮した、自然の甘さ。",
    },
    autumn: {
        emoji: "🍂",
        title: "秋のお届け",
        month: "9月ごろ",
        items: "甘酢らっきょう＋旬の果物",
        description: "プランに応じて梨が届きます。秋の味覚をお楽しみに。",
    },
};

export function DeliveryScheduleEditor() {
    const [open, setOpen] = useState(false);
    const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetch("/api/admin/settings")
            .then((r) => r.json())
            .then((d) => {
                if (d.delivery_schedule) {
                    try {
                        setSchedule(JSON.parse(d.delivery_schedule));
                    } catch { /* use default */ }
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const update = (season: keyof Schedule, field: keyof DeliveryEntry, value: string) => {
        setSchedule((prev) => ({
            ...prev,
            [season]: { ...prev[season], [field]: value },
        }));
        setSaved(false);
    };

    const handleSave = async () => {
        setSaving(true);
        await fetch("/api/admin/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: "delivery_schedule", value: JSON.stringify(schedule) }),
        });
        setSaving(false);
        setSaved(true);
    };

    return (
        <div className="border border-stone-200 rounded-xl bg-white overflow-hidden">
            <button
                onClick={() => setOpen((p) => !p)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-stone-50 transition-colors"
            >
                <CalendarDays className="w-5 h-5 text-stone-400 shrink-0" />
                <div className="flex-1">
                    <p className="text-sm font-bold text-stone-700">届け物カレンダー編集</p>
                    <p className="text-xs text-stone-400">サポーターページの届け物スケジュールを変更</p>
                </div>
                <span className="text-stone-400 text-xs">{open ? "▲" : "▼"}</span>
            </button>

            {open && (
                <div className={`border-t border-stone-100 px-4 py-4 space-y-5 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
                    {(["spring", "autumn"] as const).map((season) => (
                        <div key={season}>
                            <p className="text-xs font-bold text-stone-500 mb-2 uppercase">
                                {season === "spring" ? "🌸 春のお届け" : "🍂 秋のお届け"}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-stone-400">タイトル</label>
                                    <input
                                        type="text"
                                        value={schedule[season].title}
                                        onChange={(e) => update(season, "title", e.target.value)}
                                        className="w-full mt-0.5 border border-stone-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-stone-400">時期</label>
                                    <input
                                        type="text"
                                        value={schedule[season].month}
                                        onChange={(e) => update(season, "month", e.target.value)}
                                        className="w-full mt-0.5 border border-stone-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-stone-400">絵文字</label>
                                    <input
                                        type="text"
                                        value={schedule[season].emoji}
                                        onChange={(e) => update(season, "emoji", e.target.value)}
                                        className="w-full mt-0.5 border border-stone-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-stone-400">内容（商品）</label>
                                    <input
                                        type="text"
                                        value={schedule[season].items}
                                        onChange={(e) => update(season, "items", e.target.value)}
                                        className="w-full mt-0.5 border border-stone-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    />
                                </div>
                            </div>
                            <div className="mt-2">
                                <label className="text-xs text-stone-400">説明文</label>
                                <input
                                    type="text"
                                    value={schedule[season].description}
                                    onChange={(e) => update(season, "description", e.target.value)}
                                    className="w-full mt-0.5 border border-stone-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                />
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors"
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {saving ? "保存中..." : saved ? "✓ 保存しました" : "保存する"}
                    </button>
                </div>
            )}
        </div>
    );
}
