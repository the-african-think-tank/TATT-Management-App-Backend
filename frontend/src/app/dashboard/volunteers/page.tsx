"use client";

import { useAuth } from "@/context/auth-context";
import api from "@/services/api";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Loader2, ChevronLeft, ChevronRight, HeartHandshake,
    Clock, CheckCircle2, XCircle, CalendarClock, RotateCcw,
    PartyPopper,
} from "lucide-react";
import { Suspense } from "react";
import { VolunteerHeroBanner } from "@/components/volunteers/volunteer-hero-banner";
import { VolunteerFeatures } from "@/components/volunteers/volunteer-features";
import { VolunteerRoleCard } from "@/components/volunteers/volunteer-role-card";
import type { VolunteerRole } from "@/types/volunteers";

// Application status display helpers
const STATUS_META: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
    PENDING:              { label: "Pending Review",       color: "text-tatt-yellow bg-tatt-yellow/10 border-tatt-yellow/30",     Icon: Clock },
    INTERVIEW_SCHEDULED:  { label: "Interview Scheduled",  color: "text-tatt-lime-dark bg-tatt-lime/10 border-tatt-lime/30",       Icon: CalendarClock },
    APPROVED:             { label: "Approved",             color: "text-tatt-lime-dark bg-tatt-lime/10 border-tatt-lime/30",       Icon: CheckCircle2 },
    REJECTED:             { label: "Not Selected",         color: "text-tatt-gray bg-tatt-gray/10 border-tatt-gray/20",            Icon: XCircle },
    WITHDRAWN:            { label: "Withdrawn",            color: "text-tatt-gray bg-tatt-gray/10 border-tatt-gray/20",            Icon: RotateCcw },
};

interface MyApplication {
    id: string;
    status: string;
    createdAt: string;
    interestsAndSkills: string[];
    role?: { name: string; location: string } | null;
}

function VolunteersContent() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const justApplied = searchParams?.get("justApplied") === "true";

    const [roles, setRoles] = useState<VolunteerRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const rolesScrollRef = useRef<HTMLDivElement>(null);

    const [myApplications, setMyApplications] = useState<MyApplication[]>([]);
    const [appsLoading, setAppsLoading] = useState(true);

    const fetchApplications = async () => {
        if (!user?.id) { setAppsLoading(false); return; }
        try {
            const { data } = await api.get<MyApplication[]>("/volunteers/my-applications");
            setMyApplications(Array.isArray(data) ? data : []);
        } catch {
            setMyApplications([]);
        } finally {
            setAppsLoading(false);
        }
    };

    useEffect(() => {
        if (!user?.id) { setLoading(false); return; }
        const fetchRoles = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await api.get<VolunteerRole[]>("/volunteers/roles");
                setRoles(Array.isArray(data) ? data : []);
            } catch (err: unknown) {
                const res = err && typeof err === "object" && "response" in err
                    ? (err as { response?: { data?: { message?: string | string[] }; status?: number } }).response
                    : undefined;
                const msg = res?.data?.message;
                const fallback = res?.status === 500 ? "Server error loading volunteer roles." : "Failed to load volunteer roles.";
                setError((Array.isArray(msg) ? msg[0] : msg) || fallback);
                setRoles([]);
            } finally {
                setLoading(false);
            }
        };
        fetchRoles();
        fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const scrollRoles = (direction: "left" | "right") => {
        const el = rolesScrollRef.current;
        if (!el) return;
        el.scrollBy({ left: direction === "left" ? -320 : 320, behavior: "smooth" });
    };

    const handleApplyNow = () => {
        router.push("/dashboard/volunteers/apply");
    };

    return (
        <div className="min-h-screen w-full bg-background text-foreground">
            {/* Page header */}
            <div className="border-b border-border bg-surface px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                <div className="max-w-[1920px] mx-auto flex items-center gap-3 min-w-0">
                    <div className="size-10 sm:size-12 rounded-xl bg-tatt-lime flex items-center justify-center text-tatt-black shrink-0">
                        <HeartHandshake className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tight truncate">Volunteers</h1>
                        <p className="text-tatt-gray text-xs sm:text-sm mt-0.5">Shape the future through policy, research, and community action</p>
                    </div>
                </div>
            </div>

            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pb-24 lg:pb-12">
                {justApplied && (
                    <div className="mt-6 p-4 rounded-2xl bg-tatt-lime/10 border border-tatt-lime/30 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="size-10 rounded-xl bg-tatt-lime flex items-center justify-center text-tatt-black shrink-0">
                            <PartyPopper className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-foreground font-bold">Application Submitted!</p>
                            <p className="text-tatt-gray text-sm">Thank you for applying. You can track your status below.</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mt-6 p-4 rounded-xl bg-tatt-lime/10 border border-tatt-lime/30 text-foreground font-medium">{error}</div>
                )}

                {/* Hero section */}
                <section className="pt-6 sm:pt-8" aria-label="Volunteer hero">
                    <VolunteerHeroBanner
                        cta={
                            <button
                                onClick={handleApplyNow}
                                className="inline-flex items-center justify-center min-h-[44px] sm:min-h-[48px] px-5 sm:px-6 py-2.5 sm:py-3 bg-tatt-lime text-tatt-black font-black rounded-lg text-sm hover:brightness-105 transition-all cursor-pointer shadow-md uppercase tracking-wider"
                            >
                                Apply Now
                            </button>
                        }
                    />
                </section>

                {/* Feature highlights */}
                <VolunteerFeatures />

                {/* ── My Applications ──────────────────────────────────────── */}
                {(appsLoading || myApplications.length > 0) && (
                    <section className="pt-8 pb-4" aria-label="My applications">
                        <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4">My Applications</h2>
                        {appsLoading ? (
                            <div className="flex items-center gap-2 text-tatt-gray py-4">
                                <Loader2 className="h-5 w-5 animate-spin" /> Loading your applications...
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {myApplications.map((app) => {
                                    const FALLBACK = { label: "Pending Review", color: "text-tatt-yellow bg-tatt-yellow/10 border-tatt-yellow/30", Icon: Clock };
                                    const meta = STATUS_META[app.status] ?? FALLBACK;
                                    const Icon = meta.Icon;
                                    const isNew = justApplied && (new Date().getTime() - new Date(app.createdAt).getTime() < 60000);
                                    
                                    return (
                                        <div key={app.id} className={`bg-surface rounded-2xl border p-5 shadow-sm transition-all duration-500 ${isNew ? 'border-tatt-lime shadow-lg shadow-tatt-lime/5 ring-1 ring-tatt-lime/20' : 'border-border'}`}>
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="min-w-0">
                                                    <p className="font-bold text-foreground text-sm leading-snug">
                                                        {app.role?.name ?? "General Application"}
                                                    </p>
                                                    {app.role?.location && (
                                                        <p className="text-tatt-gray text-xs mt-0.5">{app.role.location}</p>
                                                    )}
                                                </div>
                                                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shrink-0 ${meta.color}`}>
                                                    <Icon className="h-3 w-3" />
                                                    {meta.label}
                                                </span>
                                            </div>
                                            {app.interestsAndSkills?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-3">
                                                    {app.interestsAndSkills.slice(0, 4).map((s) => (
                                                        <span key={s} className="px-2 py-0.5 bg-tatt-lime/10 text-tatt-lime-dark text-[10px] font-semibold rounded-full">
                                                            {s}
                                                        </span>
                                                    ))}
                                                    {app.interestsAndSkills.length > 4 && (
                                                        <span className="px-2 py-0.5 bg-border text-tatt-gray text-[10px] rounded-full">
                                                            +{app.interestsAndSkills.length - 4} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            <p className="text-[11px] text-tatt-gray mt-3">
                                                Applied {new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}

                {/* Open Volunteer Roles */}
                <section className="py-8 sm:py-12" id="roles-section" aria-label="Open volunteer roles">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Open Volunteer Roles</h2>
                            <p className="text-tatt-gray text-sm mt-1">Apply for positions that match your skills and passion.</p>
                        </div>
                        {roles.length > 0 && (
                            <div className="flex items-center gap-2 shrink-0">
                                <button type="button" onClick={() => scrollRoles("left")} className="size-10 rounded-full bg-tatt-gray/20 hover:bg-tatt-gray/30 flex items-center justify-center text-foreground transition-colors" aria-label="Scroll roles left">
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button type="button" onClick={() => scrollRoles("right")} className="size-10 rounded-full bg-tatt-gray/20 hover:bg-tatt-gray/30 flex items-center justify-center text-foreground transition-colors" aria-label="Scroll roles right">
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-tatt-lime mb-4" />
                            <p className="text-tatt-gray font-medium">Loading volunteer roles...</p>
                        </div>
                    ) : roles.length === 0 ? (
                        <div className="py-16 text-center">
                            <HeartHandshake className="h-14 w-14 mx-auto text-tatt-gray opacity-50 mb-4" />
                            <h2 className="text-xl font-bold text-foreground mb-2">No open roles yet</h2>
                            <p className="text-tatt-gray max-w-md mx-auto">
                                Check back soon. You can still submit a general application using the Apply Now button.
                            </p>
                        </div>
                    ) : (
                        <div ref={rolesScrollRef} className="overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 min-w-0">
                                {roles.map((role) => (
                                    <li key={role.id} className="min-w-0">
                                        <VolunteerRoleCard role={role} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>


                {/* ── Apply CTA — only shown if user has no applications yet ── */}
                {!appsLoading && myApplications.length === 0 && (
                <section id="apply-section" className="scroll-mt-8 pb-12" aria-label="Apply to volunteer">
                    {/* Compact CTA card */}
                    <div className="bg-surface rounded-3xl border border-border p-8 sm:p-12 max-w-3xl mx-auto text-center shadow-xl relative overflow-hidden group">
                         <div className="absolute -top-24 -right-24 size-48 bg-tatt-lime/10 rounded-full blur-3xl group-hover:bg-tatt-lime/20 transition-all duration-500" />
                        <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-4">Ready to make an impact?</h2>
                        <p className="text-tatt-gray text-base mb-8 max-w-xl mx-auto">
                            Submit a general application to join our volunteer network. We&apos;ll match you with roles that fit your skills and passion for change.
                        </p>
                        <button
                            onClick={handleApplyNow}
                            className="inline-flex items-center gap-3 bg-tatt-lime text-tatt-black font-black px-8 py-4 rounded-2xl text-base uppercase tracking-widest hover:brightness-105 hover:-translate-y-1 transition-all cursor-pointer shadow-lg active:scale-95"
                        >
                            <HeartHandshake className="h-5 w-5" />
                            Start Your Application
                        </button>
                    </div>
                </section>
                )}
            </div>
        </div>
    );
}

export default function VolunteersPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen w-full flex items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-tatt-lime" />
            </div>
        }>
            <VolunteersContent />
        </Suspense>
    );
}
