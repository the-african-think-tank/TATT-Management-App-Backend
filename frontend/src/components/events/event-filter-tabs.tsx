"use client";

import type { EventFilterTab } from "@/types/events";

const TAB_LABELS: Record<EventFilterTab, string> = {
    ALL: "All Events",
    WORKSHOP: "Regional Workshops",
    EVENT: "Strategy Intensives",
    MIXER: "Community Mixers",
};

type EventFilterTabsProps = {
    activeTab: EventFilterTab;
    onTabChange: (tab: EventFilterTab) => void;
    sortOption: "newest" | "oldest" | "title";
    onSortChange: (sort: "newest" | "oldest" | "title") => void;
    viewMode?: "grid" | "list";
    onViewModeChange?: (mode: "grid" | "list") => void;
};

export function EventFilterTabs({
    activeTab,
    onTabChange,
    sortOption,
    onSortChange,
    viewMode = "grid",
    onViewModeChange,
}: EventFilterTabsProps) {
    const tabs: EventFilterTab[] = ["ALL", "WORKSHOP", "EVENT", "MIXER"];

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        className={`min-h-[44px] sm:min-h-0 px-4 py-2.5 sm:py-2 rounded-lg text-sm font-bold transition-colors touch-manipulation ${
                            activeTab === tab
                                ? "bg-tatt-lime/20 text-foreground border-2 border-tatt-lime"
                                : "bg-surface border border-border text-foreground hover:bg-border"
                        }`}
                    >
                        {TAB_LABELS[tab]}
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                {onViewModeChange && (
                    <div className="flex rounded-lg border border-border overflow-hidden">
                        <button
                            type="button"
                            onClick={() => onViewModeChange("grid")}
                            className={`p-2.5 ${viewMode === "grid" ? "bg-tatt-lime text-tatt-black" : "bg-surface text-tatt-gray hover:bg-border"}`}
                            aria-label="Grid view"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="2"/></svg>
                        </button>
                        <button
                            type="button"
                            onClick={() => onViewModeChange("list")}
                            className={`p-2.5 ${viewMode === "list" ? "bg-tatt-lime text-tatt-black" : "bg-surface text-tatt-gray hover:bg-border"}`}
                            aria-label="List view"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                        </button>
                    </div>
                )}
                <select
                    value={sortOption}
                    onChange={(e) => onSortChange(e.target.value as "newest" | "oldest" | "title")}
                    className="px-3 py-2 rounded-lg border border-border bg-surface text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-tatt-lime min-h-[44px] sm:min-h-0"
                    aria-label="Sort events"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title">Title A–Z</option>
                </select>
            </div>
        </div>
    );
}
