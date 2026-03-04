"use client";

import { useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import Image from "next/image";
import {
    LayoutDashboard,
    Users,
    Globe,
    MessageSquare,
    Heart,
    Calendar,
    ClipboardList,
    Rss,
    Handshake,
    IdCard,
    BookOpen,
    Package,
    BarChart3,
    LogOut,
    Search,
    Bell,
    Settings,
    Menu,
    X
} from "lucide-react";

interface MenuItem {
    icon: React.ReactNode;
    label: string;
    href: string;
    active?: boolean;
    badge?: string;
    dot?: boolean;
    flag?: string;
}


interface MenuGroup {
    group: string;
    items: MenuItem[];
}


export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logout } = useAuth();

    const userHasAccess = (requiredFlag?: string) => {
        if (!requiredFlag) return true; // No specific flag needed
        if (!user) return false;
        if (user.systemRole === 'SUPERADMIN' || user.systemRole === 'ADMIN') return true;
        return user.flags?.includes(requiredFlag);
    };

    const menuItems: MenuGroup[] = [
        {

            group: "Overview", items: [
                { icon: <LayoutDashboard size={20} />, label: "Dashboard Overview", href: "/admin", active: true }
            ]
        },
        {
            group: "Community", items: [
                { icon: <Users size={20} />, label: "Org Management", href: "/admin/org-management", badge: "NEW", flag: "CAN_ACCESS_ORG_MANAGEMENT" },
                { icon: <Globe size={20} />, label: "Regional Chapters", href: "#", flag: "CAN_ACCESS_REGIONAL_CHAPTERS" },
                { icon: <MessageSquare size={20} />, label: "Forum Moderation", href: "#", dot: true, flag: "CAN_ACCESS_FORUM_MODERATION" },
                { icon: <Heart size={20} />, label: "Volunteer Center", href: "#", flag: "CAN_ACCESS_VOLUNTEER_CENTER" },
                { icon: <Calendar size={20} />, label: "Events & Mixers", href: "/admin/events", flag: "CAN_ACCESS_EVENTS" },
                { icon: <ClipboardList size={20} />, label: "Programs", href: "#", flag: "CAN_ACCESS_PROGRAMS" },
                { icon: <Rss size={20} />, label: "Community Feed", href: "#", flag: "CAN_ACCESS_COMMUNITY_FEED" },
                { icon: <Handshake size={20} />, label: "Promotions & Partnerships", href: "#", flag: "CAN_ACCESS_PARTNERSHIPS" },
                { icon: <IdCard size={20} />, label: "Membership Center", href: "/admin/membership-center", flag: "CAN_ACCESS_MEMBERSHIP_CENTER" }
            ]
        },
        {
            group: "Resources", items: [
                { icon: <BookOpen size={20} />, label: "Content & Resources", href: "#", flag: "CAN_ACCESS_CONTENT_RESOURCES" },
                { icon: <Package size={20} />, label: "Sales & Inventory", href: "#", flag: "CAN_ACCESS_SALES_INVENTORY" },
                { icon: <BarChart3 size={20} />, label: "Analytics", href: "#", flag: "CAN_ACCESS_ANALYTICS" }
            ]
        }
    ];

    return (
        <AdminGuard>
            <div className="flex h-screen overflow-hidden bg-background font-sans">
                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside className={`
                    fixed inset-y-0 left-0 z-50 w-72 bg-tatt-black text-white flex flex-col shrink-0 border-r border-border transform transition-transform duration-300 ease-in-out
                    lg:relative lg:translate-x-0
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                `}>
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-tatt-lime flex items-center justify-center p-1">
                                <Image src="/assets/tattlogoIcon.svg" alt="TATT" width={32} height={32} className="invert brightness-0" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold leading-tight tracking-tight">TATT</h1>
                                <p className="text-[10px] uppercase tracking-widest text-tatt-lime font-semibold">Admin Portal</p>
                            </div>
                        </div>
                        <button className="lg:hidden text-white hover:text-tatt-lime" onClick={() => setIsSidebarOpen(false)}>
                            <X size={24} />
                        </button>
                    </div>

                    <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
                        {menuItems.map((group, idx) => {
                            const visibleItems = group.items.filter(item => userHasAccess(item.flag));
                            if (visibleItems.length === 0) return null;

                            return (
                                <div key={idx} className="pb-4">
                                    {group.group !== "Overview" && (
                                        <p className="px-3 py-2 text-[11px] font-bold text-white/40 uppercase tracking-wider">{group.group}</p>
                                    )}
                                    {visibleItems.map((item, i) => (
                                        <Link
                                            key={i}
                                            href={item.href}
                                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${item.active
                                                ? "bg-tatt-lime text-tatt-black font-bold"
                                                : "text-white/70 hover:text-white hover:bg-tatt-lime/10"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {item.icon}
                                                {item.label}
                                            </div>
                                            {item.badge && (
                                                <span className="bg-tatt-lime/20 text-tatt-lime text-[10px] px-1.5 py-0.5 rounded font-bold">{item.badge}</span>
                                            )}
                                            {item.dot && (
                                                <div className="size-2 rounded-full bg-red-500"></div>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            );
                        })}
                    </nav>

                    <div className="p-4 mt-auto border-t border-white/10">
                        <button
                            onClick={logout}
                            className="w-full bg-tatt-lime hover:bg-tatt-lime/90 text-tatt-black font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all uppercase tracking-widest text-xs shadow-sm"
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {/* Header */}
                    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 lg:px-8 shrink-0">
                        <div className="flex items-center gap-4 flex-1">
                            <button className="lg:hidden p-2 text-tatt-gray hover:bg-background rounded-lg" onClick={() => setIsSidebarOpen(true)}>
                                <Menu size={24} />
                            </button>
                            <div className="flex-1 max-w-md hidden md:block">
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tatt-gray size-4 group-focus-within:text-tatt-lime transition-colors" />
                                    <input
                                        className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-tatt-lime outline-none transition-all placeholder:text-tatt-gray/50"
                                        placeholder="Search members, reports, or resources..."
                                        type="text"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 lg:gap-6">
                            <div className="flex items-center gap-1 lg:gap-2">
                                <button className="p-2 text-tatt-gray hover:bg-background rounded-lg relative">
                                    <Bell size={20} />
                                    <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-surface"></span>
                                </button>

                                <button className="p-2 text-tatt-gray hover:bg-background rounded-lg">
                                    <Settings size={20} />
                                </button>
                            </div>
                            <div className="h-8 w-px bg-border hidden sm:block"></div>
                            <div className="flex items-center gap-3 cursor-pointer group">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-foreground line-clamp-1">{user?.firstName} {user?.lastName}</p>
                                    <p className="text-[10px] font-bold text-tatt-gray uppercase tracking-widest">{user?.systemRole?.replace('_', ' ')}</p>
                                </div>
                                <div className="size-10 rounded-full border-2 border-tatt-lime flex items-center justify-center overflow-hidden shrink-0">
                                    {user?.profilePicture ? (
                                        <Image src={user.profilePicture} alt="Admin" width={40} height={40} className="object-cover" />
                                    ) : (
                                        <div className="size-full bg-tatt-lime/20 flex items-center justify-center text-tatt-lime font-bold">
                                            {user?.firstName?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Dashboard Body */}
                    <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-background custom-scrollbar">
                        {children}
                    </main>
                </div>
            </div>
        </AdminGuard>
    );
}
