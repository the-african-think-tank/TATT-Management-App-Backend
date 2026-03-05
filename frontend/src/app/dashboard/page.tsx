"use client";

import { useAuth } from "@/context/auth-context";
import api from "@/services/api";
import {
    Users,
    Eye,
    UserSearch,
    PiggyBank,
    GraduationCap,
    Ticket,
    Megaphone,
    Shield,
    FileText,
    Award,
    MessageSquare,
    Download,
    ChevronDown,
    Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import MembershipCard from "@/components/molecules/MembershipCard";

export default function DashboardPage() {
    const { user } = useAuth();
    const [connectionCount, setConnectionCount] = useState<number | null>(null);
    const [networkLoading, setNetworkLoading] = useState(true);
    const [dashboardEvents, setDashboardEvents] = useState<any[]>([]);
    const [eventsLoading, setEventsLoading] = useState(true);

    const safeDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return isNaN(d.getTime()) ? new Date() : d;
        } catch {
            return new Date();
        }
    };

    useEffect(() => {
        const fetchNetwork = async () => {
            try {
                const { data } = await api.get<Array<{ connectionId: string; member: unknown }>>("/connections/network");
                setConnectionCount(Array.isArray(data) ? data.length : 0);
            } catch {
                setConnectionCount(0);
            } finally {
                setNetworkLoading(false);
            }
        };
        if (user?.id) fetchNetwork();

        const fetchEvents = async () => {
            try {
                const { data } = await api.get("/events");
                // Filter for upcoming events and limit to 2
                const upcoming = (data || [])
                    .filter((e: any) => new Date(e.dateTime) > new Date())
                    .sort((a: any, b: any) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
                    .slice(0, 2);
                setDashboardEvents(upcoming);
            } catch (err) {
                console.error("Dashboard events error:", err);
            } finally {
                setEventsLoading(false);
            }
        };
        fetchEvents();
    }, [user?.id]);

    const firstName = user?.firstName || "Member";
    const tier = user?.communityTier || "FREE";
    const displayTierName =
        tier === "KIONGOZI"
            ? "Kiongozi Business Member"
            : `${tier.charAt(0)}${tier.slice(1).toLowerCase()} Member`;
    const chapterName = user?.chapterName || "—";
    const memberId = user?.tattMemberId || (user?.id ? `MEM-2024-${user.id.slice(0, 4)}` : "MEM-2024-0000");
    const initials = user?.firstName && user?.lastName
        ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
        : "M";
    const companyName = user?.companyName || "—";
    const professionTitle = user?.professionTitle || "—";

    return (
        <div className="p-4 lg:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Welcome */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                        Welcome back, {firstName}!
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="px-3 py-1 bg-tatt-lime text-tatt-black text-xs font-black uppercase rounded shadow-sm">
                            {displayTierName}
                        </span>
                        <span className="text-tatt-gray text-sm font-medium">• {chapterName} Chapter</span>
                    </div>
                </div>
                <Link
                    href="/dashboard/profile"
                    className="px-6 py-2.5 bg-foreground text-background rounded-lg font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2"
                >
                    <Users className="h-4 w-4" />
                    View Public Profile
                </Link>
            </div>

            {/* Profile Setup Banner for New Members */}
            {(!user?.professionTitle || !companyName || companyName === "—") && (
                <div className="bg-tatt-lime/10 border border-tatt-lime/30 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="font-black text-foreground text-lg flex items-center gap-2">
                            <span className="bg-tatt-lime text-tatt-black p-1 rounded-full"><Award className="h-4 w-4" /></span>
                            Welcome to the community!
                        </h3>
                        <p className="text-tatt-gray text-sm font-medium mt-1">
                            Your profile is currently incomplete. Take a moment to add your profession, company, and location to get the most out of your TATT experience.
                        </p>
                    </div>
                    <Link
                        href="/dashboard/settings"
                        className="shrink-0 px-6 py-2.5 bg-tatt-lime text-tatt-black font-black uppercase text-xs rounded-lg hover:brightness-105 transition-all shadow-sm"
                    >
                        Setup My Profile
                    </Link>
                </div>
            )}

            {/* Key metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-tatt-lime bg-tatt-lime/10 p-2 rounded-lg">
                            <Eye className="h-5 w-5" />
                        </span>
                        <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">+12%</span>
                    </div>
                    <p className="text-tatt-gray text-sm font-medium">Business Impressions</p>
                    <p className="text-3xl font-black text-foreground">12,482</p>
                </div>
                <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-tatt-lime bg-tatt-lime/10 p-2 rounded-lg">
                            <Users className="h-5 w-5" />
                        </span>
                        <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                            {networkLoading ? "…" : "+5%"}
                        </span>
                    </div>
                    <p className="text-tatt-gray text-sm font-medium">Network Connections</p>
                    <p className="text-3xl font-black text-foreground">
                        {networkLoading ? "—" : connectionCount ?? 0}
                    </p>
                </div>
                <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-tatt-lime bg-tatt-lime/10 p-2 rounded-lg">
                            <UserSearch className="h-5 w-5" />
                        </span>
                        <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">+18%</span>
                    </div>
                    <p className="text-tatt-gray text-sm font-medium">Talent Applications</p>
                    <p className="text-3xl font-black text-foreground">156</p>
                </div>
                <div className="bg-surface p-6 rounded-xl border border-border shadow-sm bg-gradient-to-br from-surface to-tatt-lime/5">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-tatt-lime bg-tatt-lime/10 p-2 rounded-lg">
                            <PiggyBank className="h-5 w-5" />
                        </span>
                        <span className="text-xs font-bold text-tatt-lime bg-tatt-lime/10 px-2 py-1 rounded">DBU Saver</span>
                    </div>
                    <p className="text-tatt-gray text-sm font-medium">Workforce Savings</p>
                    <p className="text-3xl font-black text-foreground">$2,400</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: DBU Academy, Business Spotlight, Benefits */}
                <div className="lg:col-span-2 space-y-8">
                    {/* DBU Career Academy */}
                    <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-lg bg-foreground flex items-center justify-center text-tatt-lime">
                                    <GraduationCap className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-foreground">DBU Career Academy</h3>
                                    <p className="text-sm text-tatt-gray font-medium">Employee Upskilling & Licensing</p>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold rounded-full">Active Portal</span>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-bold text-foreground">License Usage</span>
                                        <span className="font-medium text-tatt-gray">24 / 30 Licenses</span>
                                    </div>
                                    <div className="w-full bg-background h-3 rounded-full overflow-hidden">
                                        <div className="bg-tatt-lime h-full w-[80%] rounded-full" />
                                    </div>
                                    <p className="text-xs text-tatt-gray mt-3 italic">"You are saving $400 per license compared to retail rates."</p>
                                </div>
                                <div className="bg-background p-4 rounded-lg flex flex-col items-center justify-center text-center">
                                    <p className="text-xs font-black uppercase text-tatt-gray mb-1">Exclusive Kiongozi Offer</p>
                                    <p className="text-2xl font-black text-foreground mb-3">$99<span className="text-sm font-medium">/year per license</span></p>
                                    <button className="w-full bg-tatt-lime text-tatt-black font-black py-2 rounded-lg hover:brightness-105 transition-all text-sm shadow-sm">
                                        Purchase More Licenses
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Business Spotlight */}
                    <div className="bg-surface rounded-xl border border-border shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg text-foreground">Annual Business Spotlight</h3>
                            <div className="flex items-center gap-2">
                                <span className="size-2 bg-tatt-lime rounded-full animate-pulse" />
                                <span className="text-sm font-bold text-tatt-lime uppercase">Scheduled: Oct 2024</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 p-4 bg-background rounded-xl">
                            <div className="size-24 rounded-lg bg-surface border border-border flex items-center justify-center p-4">
                                <div className="w-full h-full bg-foreground flex items-center justify-center rounded text-tatt-lime font-black text-xl">
                                    {companyName.slice(0, 2).toUpperCase()}
                                </div>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-black text-foreground">{companyName} Spotlight</h4>
                                <p className="text-sm text-tatt-gray mt-1 leading-relaxed">
                                    Your business can be featured across the TATT network. Ensure your media kit is ready.
                                </p>
                                <div className="flex gap-4 mt-4">
                                    <button className="px-4 py-2 bg-foreground text-background rounded-lg text-xs font-bold hover:opacity-90">Manage Spotlight Content</button>
                                    <button className="px-4 py-2 border border-border rounded-lg text-xs font-bold hover:bg-background transition-colors">Preview Feature</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Exclusive Member Benefits */}
                    <div>
                        <h3 className="font-bold text-lg text-foreground mb-4">Exclusive Member Benefits</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-surface p-4 rounded-xl border border-border flex items-start gap-3 hover:border-tatt-lime transition-colors cursor-pointer group">
                                <Ticket className="h-5 w-5 text-tatt-lime group-hover:scale-110 transition-transform shrink-0" />
                                <div>
                                    <p className="font-bold text-sm text-foreground">Free Vendor Tables</p>
                                    <p className="text-xs text-tatt-gray">2 credits available</p>
                                </div>
                            </div>
                            <div className="bg-surface p-4 rounded-xl border border-border flex items-start gap-3 hover:border-tatt-lime transition-colors cursor-pointer group">
                                <Megaphone className="h-5 w-5 text-tatt-lime group-hover:scale-110 transition-transform shrink-0" />
                                <div>
                                    <p className="font-bold text-sm text-foreground">Pitch Event Access</p>
                                    <p className="text-xs text-tatt-gray">VIP Entry to Q4 Summit</p>
                                </div>
                            </div>
                            <div className="bg-surface p-4 rounded-xl border border-border flex items-start gap-3 hover:border-tatt-lime transition-colors cursor-pointer group">
                                <Shield className="h-5 w-5 text-tatt-lime group-hover:scale-110 transition-transform shrink-0" />
                                <div>
                                    <p className="font-bold text-sm text-foreground">Talent Access</p>
                                    <p className="text-xs text-tatt-gray">Pre-vetted shortlist</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Digital ID card + Quick Resources */}
                <div className="space-y-8">
                    {/* Digital Business ID Card */}
                    {user && (
                        <MembershipCard
                            member={{
                                ...user,
                                id: user.id || "",
                                firstName: user.firstName || "",
                                lastName: user.lastName || "",
                                communityTier: user.communityTier || "FREE",
                                chapterName: user.chapterName || "Global",
                                createdAt: user.createdAt || new Date().toISOString()
                            }}
                            isCurrentUser={true}
                        />
                    )}

                    {/* Upcoming Events */}
                    <div className="bg-surface rounded-xl border border-border shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-foreground">Upcoming Gatherings</h4>
                            <Link href="/dashboard/events" className="text-[10px] font-black text-tatt-lime hover:underline uppercase">View All</Link>
                        </div>
                        <div className="space-y-4">
                            {eventsLoading ? (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="size-5 animate-spin text-tatt-lime" />
                                </div>
                            ) : dashboardEvents.length === 0 ? (
                                <p className="text-xs text-tatt-gray italic">No upcoming events found.</p>
                            ) : (
                                dashboardEvents.map(event => (
                                    <Link key={event.id} href="/dashboard/events" className="block group">
                                        <div className="flex gap-3">
                                            <div className="size-10 rounded-lg bg-tatt-black flex flex-col items-center justify-center shrink-0 border border-white/5">
                                                <span className="text-[7px] font-black text-white/50 uppercase leading-none">{safeDate(event.dateTime).toLocaleDateString("en-US", { month: "short" })}</span>
                                                <span className="text-sm font-black text-white leading-none mt-1">{safeDate(event.dateTime).getDate()}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h5 className="text-xs font-bold text-foreground group-hover:text-tatt-lime transition-colors truncate">{event.title}</h5>
                                                <p className="text-[10px] text-tatt-gray mt-0.5">{event.type} • {event.locations?.[0]?.chapter?.name || "Global"}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Resources */}
                    <div className="bg-surface rounded-xl border border-border shadow-sm p-6">
                        <h4 className="font-bold text-foreground mb-4">Quick Resources</h4>
                        <div className="space-y-4">
                            <Link href="/dashboard/resources" className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-tatt-gray group-hover:text-tatt-lime" />
                                    <span className="text-sm font-medium text-foreground">Business Toolkit 2024</span>
                                </div>
                                <Download className="h-4 w-4 text-tatt-gray" />
                            </Link>
                            <Link href="/dashboard/network" className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <Award className="h-5 w-5 text-tatt-gray group-hover:text-tatt-lime" />
                                    <span className="text-sm font-medium text-foreground">Network Directory</span>
                                </div>
                                <ChevronDown className="h-4 w-4 text-tatt-gray rotate-[-90deg]" />
                            </Link>
                            <Link href="/dashboard/feed" className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <MessageSquare className="h-5 w-5 text-tatt-gray group-hover:text-tatt-lime" />
                                    <span className="text-sm font-medium text-foreground">Executive Roundtable</span>
                                </div>
                                <ChevronDown className="h-4 w-4 text-tatt-gray rotate-[-90deg]" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
