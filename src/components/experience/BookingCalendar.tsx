"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
const OPEN_HOUR = 9;
const CLOSE_HOUR = 17;
const BREAK_START_MIN = 12 * 60; // 12:00
const BREAK_END_MIN = 13 * 60;   // 13:00

/**
 * 体験時間枠を生成
 * - 9:00〜17:00 の範囲
 * - 12:00〜13:00 の休憩時間は除外（被るスロットもスキップ）
 * - duration: 60分 or 90分など
 */
function generateSlots(durationMin: number): { startMin: number; label: string }[] {
    const slots: { startMin: number; label: string }[] = [];
    let current = OPEN_HOUR * 60;
    const close = CLOSE_HOUR * 60;
    while (current + durationMin <= close) {
        const slotEnd = current + durationMin;
        // 休憩時間と被るならスキップ
        if (current < BREAK_END_MIN && slotEnd > BREAK_START_MIN) {
            current = BREAK_END_MIN;
            continue;
        }
        const h = Math.floor(current / 60);
        const m = current % 60;
        slots.push({ startMin: current, label: `${h}:${m.toString().padStart(2, "0")}` });
        current += durationMin;
    }
    return slots;
}

export function BookingCalendar({
    isOpen,
    onClose,
    experienceName,
    durationMin,
}: {
    isOpen: boolean;
    onClose: () => void;
    experienceName: string;
    durationMin: number;
}) {
    const [weekOffset, setWeekOffset] = useState(0);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

    if (!isOpen) return null;

    const slots = generateSlots(durationMin);

    // 予約可能開始日 = 今日から7日後
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const earliestBookable = new Date(today);
    earliestBookable.setDate(today.getDate() + 7);

    // 表示開始日 = 予約可能開始日 + weekOffset 週
    const startDate = new Date(earliestBookable);
    startDate.setDate(earliestBookable.getDate() + weekOffset * 7);
    const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        return d;
    });

    const handleSelect = (dateStr: string, slotMin: number) => {
        setSelectedDate(dateStr);
        setSelectedSlot(slotMin);
    };

    const handleConfirm = () => {
        if (!selectedDate || selectedSlot === null) return;
        const h = Math.floor(selectedSlot / 60);
        const m = selectedSlot % 60;
        const time = `${h}:${m.toString().padStart(2, "0")}`;
        alert(`予約内容\n体験: ${experienceName}\n日時: ${selectedDate} ${time}〜\n所要: ${durationMin}分\n\n※ 予約システムは現在準備中です。お電話またはメールでご予約ください。`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                {/* ヘッダー */}
                <div className="p-5 border-b border-stone-100 bg-stone-50 rounded-t-2xl flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-stone-900">{experienceName} の予約</h2>
                        <p className="text-xs text-stone-500 mt-0.5">所要時間 {durationMin}分 / 営業 9:00〜17:00 / 休憩 12:00〜13:00 / 予約は1週間先から</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
                        <X className="h-5 w-5 text-stone-500" />
                    </button>
                </div>

                {/* 週切替 */}
                <div className="px-5 py-3 flex items-center justify-between border-b border-stone-100">
                    <button
                        onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
                        disabled={weekOffset === 0}
                        className="flex items-center gap-1 text-sm text-stone-600 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        前の週
                    </button>
                    <span className="text-sm font-medium text-stone-700">
                        {dates[0].getMonth() + 1}/{dates[0].getDate()} 〜 {dates[6].getMonth() + 1}/{dates[6].getDate()}
                    </span>
                    <button
                        onClick={() => setWeekOffset(weekOffset + 1)}
                        className="flex items-center gap-1 text-sm text-stone-600 hover:text-primary"
                    >
                        次の週
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* カレンダー本体 */}
                <div className="flex-1 overflow-auto p-3">
                    <table className="w-full border-collapse text-sm">
                        <thead className="sticky top-0 bg-white">
                            <tr>
                                <th className="border-b border-stone-200 p-2 text-xs text-stone-400 w-16 text-left">時間</th>
                                {dates.map((d, i) => {
                                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                                    return (
                                        <th key={i} className={`border-b border-stone-200 p-2 text-xs font-medium ${isWeekend ? "text-red-500" : "text-stone-700"}`}>
                                            <div>{d.getMonth() + 1}/{d.getDate()}</div>
                                            <div className="text-[10px] text-stone-400">{WEEKDAYS[d.getDay()]}</div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {slots.map((slot) => (
                                <tr key={slot.startMin}>
                                    <td className="border-b border-stone-100 p-2 text-xs text-stone-500 whitespace-nowrap">
                                        {slot.label}
                                    </td>
                                    {dates.map((d, i) => {
                                        const dateStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
                                        const isSelected = selectedDate === dateStr && selectedSlot === slot.startMin;
                                        const isPast = d.getTime() < earliestBookable.getTime();
                                        return (
                                            <td key={i} className="border-b border-stone-100 p-1">
                                                <button
                                                    onClick={() => !isPast && handleSelect(dateStr, slot.startMin)}
                                                    disabled={isPast}
                                                    className={`w-full h-9 rounded-md text-xs font-medium transition-colors ${
                                                        isPast
                                                            ? "bg-stone-100 text-stone-300 cursor-not-allowed"
                                                            : isSelected
                                                                ? "bg-primary text-white"
                                                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                    }`}
                                                >
                                                    {isPast ? "—" : isSelected ? "✓" : "○"}
                                                </button>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* フッター */}
                <div className="p-4 border-t border-stone-100 bg-stone-50 rounded-b-2xl flex items-center justify-between gap-3 flex-wrap">
                    <div className="text-sm text-stone-600 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <span className="inline-block w-3 h-3 bg-emerald-50 border border-emerald-200 rounded"></span>
                            予約可能
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="inline-block w-3 h-3 bg-primary rounded"></span>
                            選択中
                        </span>
                    </div>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedDate || selectedSlot === null}
                        className="px-6 py-2.5 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        この時間で予約する
                    </button>
                </div>
            </div>
        </div>
    );
}
