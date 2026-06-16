"use client";

import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
const OPEN_HOUR = 9;
const CLOSE_HOUR = 17;
const BREAK_START_MIN = 12 * 60;
const BREAK_END_MIN = 13 * 60;

function generateSlots(durationMin: number): { startMin: number; label: string }[] {
    const slots: { startMin: number; label: string }[] = [];
    let current = OPEN_HOUR * 60;
    const close = CLOSE_HOUR * 60;
    while (current + durationMin <= close) {
        const slotEnd = current + durationMin;
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

function toTimeStr(min: number) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}:${m.toString().padStart(2, "0")}`;
}

type ExistingBooking = { date: string; startTime: string };

type Step = "calendar" | "form" | "success" | "error";

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
    const [step, setStep] = useState<Step>("calendar");
    const [headcount, setHeadcount] = useState(1);
    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [bookings, setBookings] = useState<ExistingBooking[]>([]);

    useEffect(() => {
        if (!isOpen) return;
        setStep("calendar");
        setSelectedDate(null);
        setSelectedSlot(null);
        setHeadcount(1);
        setPhone("");
        setName("");
        setErrorMsg("");

        fetch(`/api/bookings?experienceName=${encodeURIComponent(experienceName)}`)
            .then(r => r.json())
            .then(d => setBookings(d.bookings ?? []))
            .catch(() => setBookings([]));
    }, [isOpen, experienceName]);

    if (!isOpen) return null;

    const slots = generateSlots(durationMin);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const earliestBookable = new Date(today);
    earliestBookable.setDate(today.getDate() + 7);

    const startDate = new Date(earliestBookable);
    startDate.setDate(earliestBookable.getDate() + weekOffset * 7);
    const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        return d;
    });

    const isBooked = (dateStr: string, slotMin: number) =>
        bookings.some(b => b.date === dateStr && b.startTime === toTimeStr(slotMin));

    const handleSelect = (dateStr: string, slotMin: number) => {
        setSelectedDate(dateStr);
        setSelectedSlot(slotMin);
    };

    const handleSubmit = async () => {
        if (!selectedDate || selectedSlot === null) return;
        setSubmitting(true);
        setErrorMsg("");
        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    experienceName,
                    date: selectedDate,
                    startTime: toTimeStr(selectedSlot),
                    durationMin,
                    headcount,
                    phone,
                    name,
                }),
            });
            if (res.status === 401) {
                setErrorMsg("予約にはログインが必要です。");
                setStep("error");
                return;
            }
            if (res.status === 409) {
                setErrorMsg("この時間帯は既に予約されています。別の日時をお選びください。");
                setStep("error");
                return;
            }
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                setErrorMsg(d.error ?? "予約に失敗しました。時間をおいて再度お試しください。");
                setStep("error");
                return;
            }
            setStep("success");
        } catch {
            setErrorMsg("通信エラーが発生しました。ネットワークをご確認ください。");
            setStep("error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={step === "calendar" ? onClose : undefined} />
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

                {/* カレンダー */}
                {step === "calendar" && (
                    <>
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
                                                const booked = isBooked(dateStr, slot.startMin);
                                                return (
                                                    <td key={i} className="border-b border-stone-100 p-1">
                                                        <button
                                                            onClick={() => !booked && handleSelect(dateStr, slot.startMin)}
                                                            disabled={booked}
                                                            className={`w-full h-9 rounded-md text-xs font-medium transition-colors ${
                                                                booked
                                                                    ? "bg-stone-100 text-stone-300 cursor-not-allowed"
                                                                    : isSelected
                                                                        ? "bg-primary text-white"
                                                                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                            }`}
                                                        >
                                                            {booked ? "×" : isSelected ? "✓" : "○"}
                                                        </button>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 border-t border-stone-100 bg-stone-50 rounded-b-2xl flex items-center justify-between gap-3 flex-wrap">
                            <div className="text-sm text-stone-600 flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                    <span className="inline-block w-3 h-3 bg-emerald-50 border border-emerald-200 rounded"></span>
                                    予約可能
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="inline-block w-3 h-3 bg-stone-100 border border-stone-200 rounded"></span>
                                    予約済
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="inline-block w-3 h-3 bg-primary rounded"></span>
                                    選択中
                                </span>
                            </div>
                            <button
                                onClick={() => setStep("form")}
                                disabled={!selectedDate || selectedSlot === null}
                                className="px-6 py-2.5 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                この時間で予約する
                            </button>
                        </div>
                    </>
                )}

                {/* 入力フォーム */}
                {step === "form" && selectedDate && selectedSlot !== null && (
                    <div className="flex-1 overflow-auto p-6 flex flex-col gap-5">
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">
                            <div className="font-bold mb-1">選択した日時</div>
                            <div>{selectedDate}（{toTimeStr(selectedSlot)}〜）／ {durationMin}分</div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">お名前</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="山田 太郎"
                                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">電話番号</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="090-0000-0000"
                                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">参加人数</label>
                                <select
                                    value={headcount}
                                    onChange={e => setHeadcount(Number(e.target.value))}
                                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    {[1, 2, 3, 4, 5, 6].map(n => (
                                        <option key={n} value={n}>{n}名</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-auto">
                            <button
                                onClick={() => setStep("calendar")}
                                className="flex-1 px-4 py-2.5 border border-stone-300 text-stone-600 font-medium rounded-full hover:bg-stone-50 transition-colors text-sm"
                            >
                                戻る
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !phone.trim()}
                                className="flex-1 px-4 py-2.5 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                            >
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {submitting ? "送信中..." : "予約を確定する"}
                            </button>
                        </div>
                    </div>
                )}

                {/* 完了 */}
                {step === "success" && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-3xl">✓</div>
                        <h3 className="text-lg font-bold text-stone-900">予約が完了しました</h3>
                        <p className="text-sm text-stone-600">
                            {selectedDate}（{selectedSlot !== null ? toTimeStr(selectedSlot) : ""}〜）にご予約を承りました。<br />
                            確認のご連絡をお待ちください。
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-2 px-8 py-2.5 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors"
                        >
                            閉じる
                        </button>
                    </div>
                )}

                {/* エラー */}
                {step === "error" && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-3xl">!</div>
                        <h3 className="text-lg font-bold text-stone-900">予約できませんでした</h3>
                        <p className="text-sm text-red-600">{errorMsg}</p>
                        <div className="flex gap-3 mt-2">
                            <button
                                onClick={() => setStep("form")}
                                className="px-6 py-2.5 border border-stone-300 text-stone-600 font-medium rounded-full hover:bg-stone-50 transition-colors text-sm"
                            >
                                戻る
                            </button>
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors text-sm"
                            >
                                閉じる
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
