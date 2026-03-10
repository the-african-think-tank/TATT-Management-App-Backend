"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";

import {
    LayoutDashboard,
    Mail as MailIcon,
    Rss,
    Users,
    Briefcase,
    Store,
    Folder,
    Calendar,
    HeartHandshake,
    Building2,
    Settings as SettingsIcon,
    ShieldCheck,
    Menu,
    X,
    Trello,
    Zap
} from "lucide-react";

export function DashboardSidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (open: boolean) => void }) {
    const pathname = usePathname();
    const { user } = useAuth();

    const communityTier = user?.communityTier || "FREE";
    const displayTierName = communityTier.charAt(0).toUpperCase() + communityTier.slice(1).toLowerCase();

    const closeSidebar = () => setIsOpen(false);

    const mainLinks = [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { name: "TATT Feed", href: "/dashboard/feed", icon: Rss },
        { name: "Network", href: "/dashboard/network", icon: Users },
        { name: "Messages", href: "/dashboard/messages", icon: MailIcon },
        { name: "Events", href: "/dashboard/events", icon: Calendar },
        { name: "Resources", href: "/dashboard/resources", icon: Folder },
        { name: "Job Board", href: "/dashboard/jobs", icon: Briefcase },
        { name: "Volunteers", href: "/dashboard/volunteers", icon: HeartHandshake },
        { name: "My Chapter", href: "/dashboard/chapter", icon: Building2 },
        ...(communityTier !== "KIONGOZI" ? [{ name: "Upgrade", href: "/dashboard/upgrade", icon: Zap, highlight: true }] : []),
        ...(communityTier === "KIONGOZI" ? [{ name: "My Business", href: "/dashboard/business", icon: Store }] : []),
    ];

    const bottomLinks = [
        { name: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-tatt-black border-r border-border flex flex-col transition-transform duration-300
                ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
            `}>
                <div className="p-6 flex items-center justify-between gap-3 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg flex items-center justify-center shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/assets/tattlogoIcon.svg"
                                alt="TATT Logo"
                                width={40}
                                height={40}
                                className="object-contain w-10 h-10"
                            />
                        </div>
                        <div>
                            <h1 className="font-black text-xl tracking-tighter leading-none text-white whitespace-nowrap">The African</h1>
                            <p className="font-black text-xl tracking-tighter leading-none text-tatt-lime uppercase">Think Tank</p>
                        </div>
                    </div>
                    <button onClick={closeSidebar} className="lg:hidden text-white hover:text-tatt-lime">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1 custom-scrollbar">
                    {mainLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        const isHighlight = (link as any).highlight;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={closeSidebar}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm
                                    ${
                                        isActive
                                            ? "bg-black/20 border-l-4 border-tatt-lime text-tatt-lime font-semibold"
                                            : isHighlight
                                            ? "text-tatt-lime/80 hover:bg-tatt-lime/10 hover:text-tatt-lime border border-tatt-lime/20"
                                            : "text-white/70 hover:bg-black/10 hover:text-white"
                                    }
                                `}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                <span>{link.name}</span>
                                {isHighlight && !isActive && (
                                    <span className="ml-auto text-[9px] font-black uppercase tracking-wider bg-tatt-lime text-tatt-black px-1.5 py-0.5 rounded-full">New</span>
                                )}
                            </Link>
                        );
                    })}

                    <div className="pt-4 mt-4 border-t border-border space-y-1">
                        {bottomLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={closeSidebar}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm
                                        ${isActive
                                            ? "bg-black/20 border-l-4 border-tatt-lime text-tatt-lime font-semibold"
                                            : "text-white/70 hover:bg-black/10 hover:text-white"
                                        }
                                    `}
                                >
                                    <Icon className="h-5 w-5 shrink-0" />
                                    <span>{link.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="p-4 border-t border-border">
                    <div className="bg-black/20 rounded-xl p-4 border border-tatt-lime/20">
                        <p className="text-xs text-tatt-lime font-bold uppercase mb-2">Current Tier</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-white">{displayTierName}</span>
                            <ShieldCheck className="text-tatt-lime h-4 w-4" />
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
