"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { AlertCircle, RefreshCcw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EventCancelPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center animate-in zoom-in-95 duration-500">
            <div className="size-24 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-8 shadow-xl shadow-red-500/20">
                <AlertCircle size={48} />
            </div>

            <h1 className="text-4xl font-black text-foreground tracking-tighter mb-4 italic uppercase tracking-widest">Transaction Interrupted</h1>
            <p className="text-tatt-gray font-medium max-w-md mx-auto mb-10 leading-relaxed uppercase tracking-tighter text-sm">
                Your payment process was canceled or interrupted. Your registration is not confirmed. Please try again or contact the support center.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <Link
                    href={`/dashboard/events/${id}/checkout`}
                    className="flex-1 bg-tatt-lime text-tatt-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest"
                >
                    <RefreshCcw size={16} />
                    Try Again
                </Link>
                <Link
                    href={`/dashboard/events/${id}`}
                    className="flex-1 bg-surface border border-border text-foreground font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-background transition-all text-xs uppercase tracking-widest"
                >
                    <ArrowLeft size={16} />
                    Event Details
                </Link>
            </div>
        </div>
    );
}
