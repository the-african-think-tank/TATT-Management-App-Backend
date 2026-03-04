"use client";

import Link from "next/link";
import { Calendar, Loader2 } from "lucide-react";
import type { EventItem } from "@/types/events";

type FeaturedEventBannerProps = {
    event: EventItem | null;
    isLoading?: boolean;
};

function formatDateRange(dateTime: string) {
    try {
        const d = new Date(dateTime);
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    } catch {
        return "";
    }
}

export function FeaturedEventBanner({ event, isLoading }: FeaturedEventBannerProps) {
    if (isLoading) {
        return (
            <div className="relative w-full rounded-xl overflow-hidden bg-tatt-black/90 min-h-[200px] sm:min-h-[240px] md:min-h-[280px] flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-tatt-lime" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="relative w-full rounded-xl overflow-hidden bg-tatt-green-deep min-h-[180px] sm:min-h-[220px] flex items-end p-6 sm:p-8">
                <p className="text-tatt-white/80 text-sm sm:text-base font-medium">No featured event at the moment. Check back soon.</p>
            </div>
        );
    }

    const dateStr = formatDateRange(event.dateTime);
    const firstLocation = event.locations?.[0]?.address;

    return (
        <div className="relative w-full rounded-xl overflow-hidden min-h-[200px] sm:min-h-[240px] md:min-h-[280px]">
            {/* Background image */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: event.imageUrl
                        ? `url(${event.imageUrl})`
                        : "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200')",
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-tatt-black/90 via-tatt-black/50 to-tatt-black/30" />
            {/* Optional watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-tatt-white/5 text-6xl sm:text-8xl font-black select-none">FEATURED</span>
            </div>

            <div className="relative z-10 h-full flex flex-col justify-end p-4 sm:p-6 md:p-8">
                <span className="text-tatt-lime text-xs font-bold uppercase tracking-widest mb-1">Featured Intensive</span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-tatt-white tracking-tight max-w-3xl mb-2">
                    {event.title}
                </h2>
                <p className="text-tatt-white/90 text-sm sm:text-base max-w-2xl mb-4 line-clamp-2">
                    {event.description}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                    <Link
                        href={`/dashboard/events/${event.id}`}
                        className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 bg-tatt-lime text-tatt-black font-bold rounded-lg text-sm hover:brightness-95 transition-all touch-manipulation"
                    >
                        Register Now
                    </Link>
                    <span className="inline-flex items-center gap-2 text-tatt-white/90 text-sm font-medium">
                        <Calendar className="h-4 w-4 shrink-0" />
                        {dateStr}
                    </span>
                </div>
            </div>
        </div>
    );
}
