"use client";

import { useState } from "react";
import { BookingCalendar } from "./BookingCalendar";

export function BookingButton({ experienceName, durationMin }: {
    experienceName: string;
    durationMin: number;
}) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="w-full md:w-auto px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors shadow-md"
            >
                予約状況を確認する
            </button>
            <BookingCalendar
                isOpen={open}
                onClose={() => setOpen(false)}
                experienceName={experienceName}
                durationMin={durationMin}
            />
        </>
    );
}
