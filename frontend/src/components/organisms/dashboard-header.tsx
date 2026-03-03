"use client";

import { useAuth } from "@/context/auth-context";
import { Search, Bell, Menu } from "lucide-react";

export function DashboardHeader({ onMenuClick }: { onMenuClick: () => void }) {
    const { user } = useAuth();

    return (
        <header className="h-16 bg-surface/80 border-b border-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 backdrop-blur-sm">
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 -ml-2 text-tatt-gray hover:text-foreground rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <div className="relative w-full max-w-md hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tatt-gray h-5 w-5" />
                    <input
                        className="w-full bg-surface border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-tatt-lime outline-none text-foreground placeholder:text-tatt-gray shadow-inner"
                        placeholder="Search members, jobs, or discussions..."
                        type="text"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 lg:gap-6">
                <button className="relative text-foreground hover:text-tatt-lime transition-colors">
                    <Bell className="h-6 w-6" />
                    <span className="absolute -top-1 -right-1 size-2.5 bg-red-500 rounded-full border-2 border-white dark:border-black"></span>
                </button>
                <div className="flex items-center gap-3 pl-4 lg:pl-6 border-l border-border">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold leading-none">{user?.firstName} {user?.lastName}</p>
                        <p className="text-[11px] text-tatt-gray font-medium uppercase mt-1">Lagos Chapter</p>
                    </div>
                    <div className="size-10 rounded-full border-2 border-tatt-lime overflow-hidden bg-background flex items-center justify-center font-bold text-tatt-lime">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </div>
                </div>
            </div>
        </header>
    );
}
