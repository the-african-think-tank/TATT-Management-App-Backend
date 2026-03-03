"use client";

import { useAuth } from "@/context/auth-context";
import api from "@/services/api";
import { useEffect, useState, useMemo } from "react";
import { Loader2, Search, Calendar } from "lucide-react";
import { FeaturedEventBanner } from "@/components/events/featured-event-banner";
import { EventFilterTabs } from "@/components/events/event-filter-tabs";
import { EventCard } from "@/components/events/event-card";
import type { EventItem, EventFilterTab, SortOption } from "@/types/events";

export default function EventsPage() {
    const { user } = useAuth();
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterTab, setFilterTab] = useState<EventFilterTab>("ALL");
    const [sortOption, setSortOption] = useState<SortOption>("newest");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    useEffect(() => {
        if (!user?.id) {
            setLoading(false);
            return;
        }
        const fetchEvents = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await api.get<EventItem[]>("/events");
                setEvents(Array.isArray(data) ? data : []);
            } catch (err: unknown) {
                const res = err && typeof err === "object" && "response" in err
                    ? (err as { response?: { data?: { message?: string | string[] }; status?: number } }).response
                    : undefined;
                const msg = res?.data?.message;
                const status = res?.status;
                const fallback = status === 500
                    ? "Server error loading events. Please try again in a moment."
                    : "Failed to load events.";
                setError(Array.isArray(msg) ? msg[0] : (typeof msg === "string" ? msg : fallback));
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [user?.id]);

    const filteredAndSortedEvents = useMemo(() => {
        let list = [...events];

        if (filterTab !== "ALL") {
            list = list.filter((e) => e.type === filterTab);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            list = list.filter(
                (e) =>
                    e.title.toLowerCase().includes(q) ||
                    e.description?.toLowerCase().includes(q)
            );
        }

        switch (sortOption) {
            case "newest":
                list.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
                break;
            case "oldest":
                list.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
                break;
            case "title":
                list.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }

        return list;
    }, [events, filterTab, searchQuery, sortOption]);

    const featuredEvent = useMemo(() => {
        if (filteredAndSortedEvents.length === 0) return null;
        return filteredAndSortedEvents[0];
    }, [filteredAndSortedEvents]);

    const listWithoutFeatured = useMemo(() => {
        if (filteredAndSortedEvents.length <= 1) return [];
        return filteredAndSortedEvents.slice(1);
    }, [filteredAndSortedEvents]);

    return (
        <div className="min-h-screen w-full bg-background text-foreground">
            {/* Page header */}
            <div className="border-b border-border bg-surface px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                <div className="max-w-[1920px] mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 sm:size-12 rounded-xl bg-tatt-lime flex items-center justify-center text-tatt-black shrink-0">
                            <Calendar className="h-5 w-5 sm:h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                                Workshops &amp; Events
                            </h1>
                            <p className="text-tatt-gray text-sm mt-0.5">Discover and register for TATT events</p>
                        </div>
                    </div>
                    <div className="relative w-full sm:w-80 md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tatt-gray h-5 w-5 pointer-events-none" />
                        <input
                            type="search"
                            placeholder="Search events..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-tatt-gray focus:outline-none focus:ring-2 focus:ring-tatt-lime"
                            aria-label="Search events"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-tatt-lime/10 border border-tatt-lime/30 text-foreground font-medium">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-tatt-lime mb-4" />
                        <p className="text-tatt-gray font-medium">Loading events...</p>
                    </div>
                ) : events.length === 0 ? (
                    <div className="py-20 text-center">
                        <Calendar className="h-14 w-14 mx-auto text-tatt-gray opacity-50 mb-4" />
                        <h2 className="text-xl font-bold text-foreground mb-2">No events yet</h2>
                        <p className="text-tatt-gray max-w-md mx-auto">Check back later for workshops, intensives, and community mixers.</p>
                    </div>
                ) : (
                    <div className="space-y-6 sm:space-y-8">
                        {/* Featured event banner */}
                        <section aria-label="Featured event">
                            <FeaturedEventBanner event={featuredEvent} isLoading={false} />
                        </section>

                        {/* Filter tabs + sort */}
                        <EventFilterTabs
                            activeTab={filterTab}
                            onTabChange={setFilterTab}
                            sortOption={sortOption}
                            onSortChange={setSortOption}
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                        />

                        {/* Event cards grid */}
                        <section aria-label="Event list">
                            {listWithoutFeatured.length === 0 ? (
                                <div className="py-16 text-center">
                                    <Calendar className="h-12 w-12 mx-auto text-tatt-gray opacity-50 mb-4" />
                                    <p className="text-foreground font-medium">No events match your filters.</p>
                                    <p className="text-sm text-tatt-gray mt-1">Try a different category or search.</p>
                                </div>
                            ) : viewMode === "list" ? (
                                <ul className="space-y-4">
                                    {listWithoutFeatured.map((event) => (
                                        <li key={event.id}>
                                            <EventCard event={event} />
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                    {listWithoutFeatured.map((event) => (
                                        <li key={event.id}>
                                            <EventCard
                                                event={event}
                                                highlight={event.type === "MIXER" ? "FILLING FAST" : null}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}
