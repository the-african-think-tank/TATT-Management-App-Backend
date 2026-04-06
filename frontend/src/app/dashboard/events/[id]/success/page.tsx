"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { CheckCircle, Calendar, ArrowRight, Share2 } from "lucide-react";
import Link from "next/link";

export default function EventSuccessPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center animate-in zoom-in-95 duration-500">
            <div className="size-24 rounded-full bg-tatt-lime/10 flex items-center justify-center text-tatt-lime mb-8 shadow-xl shadow-tatt-lime/20">
                <CheckCircle size={48} className="animate-in slide-in-from-bottom-2 duration-700" />
            </div>

            <h1 className="text-4xl font-black text-foreground tracking-tighter mb-4 italic">Registration Confirmed!</h1>
            <p className="text-tatt-gray font-medium max-w-md mx-auto mb-10 leading-relaxed">
                Your transmission has been received and verified. Your spot is secured for this gathering. We've sent a confirmation to your email.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <Link
                    href={`/dashboard/events/${id}`}
                    className="flex-1 bg-tatt-lime text-tatt-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest"
                >
                    <Calendar size={16} />
                    View Event Details
                </Link>
                <Link
                    href="/dashboard/events"
                    className="flex-1 bg-surface border border-border text-foreground font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-background transition-all text-xs uppercase tracking-widest"
                >
                    Back to Ecosystem
                    <ArrowRight size={16} />
                </Link>
            </div>

            <div className="mt-12 group cursor-pointer">
                <p className="flex items-center gap-2 text-[10px] font-black text-tatt-gray uppercase tracking-[0.3em] hover:text-tatt-lime transition-colors">
                    <Share2 size={12} />
                    Share with Thinking Partners
                </p>
            </div>
        </div>
    );
}
