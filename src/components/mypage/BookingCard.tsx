"use client";

import { useState } from "react";
import { CalendarDays, Clock, Users, Loader2 } from "lucide-react";
import { CANCEL_POLICY, calcCancelFee, basePrice } from "@/lib/cancelPolicy";

type Booking = {
    id: string;
    experienceName: string;
    date: string;
    startTime: string;
    durationMin: number;
    headcount: number;
    price: number;
};

type CancelStep = "idle" | "confirm" | "loading" | "done" | "error";

export function BookingCard({ booking, isPast }: { booking: Booking; isPast: boolean }) {
    const [cancelStep, setCancelStep] = useState<CancelStep>("idle");
    const [errMsg, setErrMsg] = useState("");

    const price = booking.price || basePrice(booking.experienceName);
    const cancelInfo = calcCancelFee(booking.date, price);

    const [year, month, day] = booking.date.split("-");
    const dateLabel = `${year}年${parseInt(month)}月${parseInt(day)}日`;

    const handleCancel = async () => {
        setCancelStep("loading");
        try {
            const res = await fetch("/api/bookings/cancel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: booking.id }),
            });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                setErrMsg(d.error ?? "キャンセルに失敗しました");
                setCancelStep("error");
                return;
            }
            setCancelStep("done");
        } catch {
            setErrMsg("通信エラーが発生しました");
            setCancelStep("error");
        }
    };

    if (cancelStep === "done") {
        return (
            <div className="bg-white rounded-2xl shadow-sm p-5 border-l-4 border-stone-200 opacity-60">
                <p className="text-sm text-stone-500 font-medium">キャンセル済み</p>
                <p className="text-stone-700 font-bold mt-1">{booking.experienceName}</p>
                <p className="text-sm text-stone-500">{dateLabel} {booking.startTime}〜</p>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-2xl shadow-sm border-l-4 overflow-hidden ${isPast ? "border-stone-200" : "border-primary"}`}>
            {/* 予約サマリー */}
            <div className={`p-5 ${isPast ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                    <p className="font-bold text-stone-900 text-base">{booking.experienceName}</p>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${isPast ? "bg-stone-100 text-stone-400" : "bg-emerald-50 text-emerald-700"}`}>
                        {isPast ? "終了" : "確定"}
                    </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-600">
                    <span className="flex items-center gap-1">
                        <CalendarDays className="w-4 h-4 text-stone-400" />
                        {dateLabel}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-stone-400" />
                        {booking.startTime}〜（{booking.durationMin}分）
                    </span>
                    <span className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-stone-400" />
                        {booking.headcount}名
                    </span>
                </div>

                {/* 料金・支払い状況 */}
                {price > 0 && (
                    <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-sm">
                        <span className="text-stone-500">基本料金</span>
                        <span className="font-bold text-stone-800">¥{price.toLocaleString()}〜</span>
                    </div>
                )}
                <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-stone-500">お支払い</span>
                    <span className="text-stone-600">現地払い</span>
                </div>
            </div>

            {/* キャンセル規定 */}
            {!isPast && (
                <div className="border-t border-stone-100 mx-5 pt-4 pb-1">
                    <p className="text-xs font-bold text-stone-500 mb-2">キャンセル規定</p>
                    {CANCEL_POLICY.map((section, i) => (
                        <div key={i} className={i > 0 ? "mt-2" : ""}>
                            <p className="text-xs font-medium text-stone-600">【{section.title}】</p>
                            <ul className="mt-0.5 space-y-0.5">
                                {section.items.map((item, j) => (
                                    <li key={j} className="text-xs text-stone-500 leading-relaxed">・{item}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {/* キャンセルボタン */}
            {!isPast && cancelStep === "idle" && (
                <div className="px-5 py-4">
                    <button
                        onClick={() => setCancelStep("confirm")}
                        className="text-sm text-red-500 hover:text-red-700 underline underline-offset-2 transition-colors"
                    >
                        予約をキャンセルする
                    </button>
                </div>
            )}

            {/* キャンセル確認 */}
            {cancelStep === "confirm" && (
                <div className="mx-5 mb-5 mt-1 bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-sm font-bold text-red-800 mb-3">キャンセルの確認</p>
                    <div className="text-sm text-red-700 space-y-1 mb-4">
                        <div className="flex justify-between">
                            <span>キャンセル料</span>
                            <span className="font-bold">
                                {cancelInfo.fee === 0 ? "無料" : `¥${cancelInfo.fee.toLocaleString()}（${cancelInfo.label}）`}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>返金予定額</span>
                            <span className="font-bold">
                                {price === 0 ? "現地払いのため対象外" : `¥${cancelInfo.refund.toLocaleString()}`}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCancelStep("idle")}
                            className="flex-1 py-2 text-sm border border-stone-300 rounded-full text-stone-600 hover:bg-stone-50 transition-colors"
                        >
                            戻る
                        </button>
                        <button
                            onClick={handleCancel}
                            className="flex-1 py-2 text-sm bg-red-500 text-white font-bold rounded-full hover:bg-red-600 transition-colors"
                        >
                            キャンセルを確定する
                        </button>
                    </div>
                </div>
            )}

            {cancelStep === "loading" && (
                <div className="px-5 pb-5 flex items-center gap-2 text-sm text-stone-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    キャンセル処理中...
                </div>
            )}

            {cancelStep === "error" && (
                <div className="mx-5 mb-5 mt-1 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                    {errMsg}
                    <button onClick={() => setCancelStep("idle")} className="ml-3 underline">戻る</button>
                </div>
            )}
        </div>
    );
}
