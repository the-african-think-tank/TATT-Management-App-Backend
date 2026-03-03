"use client";

import { useAuth } from "@/context/auth-context";
import api from "@/services/api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Calendar,
    MapPin,
    Clock,
    Users,
    User,
    ArrowLeft,
    Loader2,
    CheckCircle,
    ExternalLink,
} from "lucide-react";
import type { EventItem } from "@/types/events";

function formatDate(dateTime: string) {
    try {
        return new Date(dateTime).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    } catch {
        return "";
    }
}

function formatTime(dateTime: string) {
    try {
        return new Date(dateTime).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    } catch {
        return "";
    }
}

function typeLabel(type: string): string {
    switch (type) {
        case "WORKSHOP": return "Regional Workshop";
        case "MIXER": return "Community Mixer";
        case "EVENT": return "Strategy Intensive";
        default: return type;
    }
}

export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const id = params?.id as string;

    const [event, setEvent] = useState<EventItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [registering, setRegistering] = useState(false);
    const [registrationDone, setRegistrationDone] = useState(false);
    const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        const fetchEvent = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await api.get<EventItem>(`/events/${id}`);
                setEvent(data);
            } catch (err: unknown) {
                const msg = err && typeof err === "object" && "response" in err
                    ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                    : "Event not found.";
                setError(Array.isArray(msg) ? msg[0] : (msg ?? "Event not found."));
                setEvent(null);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const handleRegister = async (isBusinessRegistration = false) => {
        if (!id || registering) return;
        setRegistering(true);
        try {
            const { data } = await api.post<{ registration?: unknown; message?: string; checkoutUrl?: string }>(
                `/events/${id}/register`,
                { isBusinessRegistration }
            );
            setRegistrationDone(true);
            if (data?.checkoutUrl) {
                setCheckoutUrl(data.checkoutUrl);
            }
        } catch (err: unknown) {
            const msg = err && typeof err === "object" && "response" in err
                ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                : "Registration failed.";
            setError(Array.isArray(msg) ? msg[0] : (msg ?? "Registration failed."));
        } finally {
            setRegistering(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-tatt-lime" />
            </div>
        );
    }

    if (error && !event) {
        return (
            <div className="min-h-screen bg-background px-4 py-8">
                <div className="max-w-2xl mx-auto text-center">
                    <p className="text-foreground font-medium mb-4">{error}</p>
                    <Link
                        href="/dashboard/events"
                        className="inline-flex items-center gap-2 text-tatt-lime font-bold hover:underline"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Events
                    </Link>
                </div>
            </div>
        );
    }

    if (!event) return null;

    const firstLocation = event.locations?.[0];
    const address = firstLocation?.address ?? "Virtual event";
    const isVirtual = address.toLowerCase().includes("zoom") || address.toLowerCase().includes("virtual");

    return (
        <div className="min-h-screen w-full bg-background text-foreground">
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <Link
                    href="/dashboard/events"
                    className="inline-flex items-center gap-2 text-tatt-gray hover:text-tatt-lime font-medium text-sm mb-6"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Workshops &amp; Events
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="relative aspect-video sm:aspect-[21/9] rounded-xl overflow-hidden bg-tatt-black">
                            {event.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={event.imageUrl}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div
                                    className="w-full h-full bg-cover bg-center"
                                    style={{
                                        backgroundImage: "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200')",
                                    }}
                                />
                            )}
                            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-tatt-black/90 to-transparent">
                                <span className="text-tatt-lime text-xs font-bold uppercase tracking-widest">
                                    {typeLabel(event.type)}
                                </span>
                            </div>
                        </div>

                        <div className="bg-surface rounded-xl border border-border p-6 sm:p-8">
                            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mb-4">
                                {event.title}
                            </h1>
                            <div className="prose prose-sm max-w-none text-foreground/90 mb-6">
                                {event.description}
                            </div>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-tatt-lime shrink-0" />
                                    <span>{formatDate(event.dateTime)}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-tatt-lime shrink-0" />
                                    <span>{formatTime(event.dateTime)}</span>
                                </div>
                                <div className="flex items-center gap-3 sm:col-span-2">
                                    {isVirtual ? (
                                        <><MapPin className="h-5 w-5 text-tatt-lime shrink-0" /> Virtual Event (Zoom)</>
                                    ) : (
                                        <><MapPin className="h-5 w-5 text-tatt-lime shrink-0" /> {address}</>
                                    )}
                                </div>
                                {event.featuredGuests?.length ? (
                                    <div className="flex items-center gap-3 sm:col-span-2">
                                        <User className="h-5 w-5 text-tatt-lime shrink-0" />
                                        <span>
                                            Lead: {event.featuredGuests.map((g) => `${g.firstName} ${g.lastName}`).join(", ")}
                                        </span>
                                    </div>
                                ) : null}
                            </dl>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-surface rounded-xl border border-border p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-foreground mb-4">Register</h2>
                            {registrationDone ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-tatt-lime font-medium">
                                        <CheckCircle className="h-6 w-6 shrink-0" />
                                        You’re registered for this event.
                                    </div>
                                    {checkoutUrl ? (
                                        <a
                                            href={checkoutUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 w-full py-3 bg-tatt-lime text-tatt-black font-bold rounded-lg hover:brightness-95"
                                        >
                                            Complete payment <ExternalLink className="h-4 w-4" />
                                        </a>
                                    ) : null}
                                </div>
                            ) : (
                                <>
                                    {error && (
                                        <p className="text-sm text-foreground font-medium mb-4">{error}</p>
                                    )}
                                    <div className="space-y-3">
                                        <button
                                            type="button"
                                            onClick={() => handleRegister(false)}
                                            disabled={registering}
                                            className="w-full min-h-[48px] py-3 bg-tatt-lime text-tatt-black font-bold rounded-lg hover:brightness-95 disabled:opacity-60 flex items-center justify-center gap-2 touch-manipulation"
                                        >
                                            {registering ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : null}
                                            Register
                                        </button>
                                        {user?.communityTier === "KIONGOZI" ? (
                                            <button
                                                type="button"
                                                onClick={() => handleRegister(true)}
                                                disabled={registering}
                                                className="w-full min-h-[48px] py-3 border-2 border-tatt-lime text-tatt-lime font-bold rounded-lg hover:bg-tatt-lime/10 disabled:opacity-60 flex items-center justify-center gap-2 touch-manipulation"
                                            >
                                                Register as Business
                                            </button>
                                        ) : null}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
