"use client";

import { useState, useEffect } from "react";
import {
    Calendar,
    Plus,
    Search,
    Filter,
    MoreVertical,
    TrendingUp,
    Calendar as CalendarIcon,
    Users,
    DollarSign,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Building2,
    Globe,
    Lock,
    X,
    Loader2,
    Image as ImageIcon,
    CheckCircle2
} from "lucide-react";
import Image from "next/image";
import api from "@/services/api";
import { toast, Toaster } from "react-hot-toast";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";

// --- Types ---

interface Event {
    id: string;
    title: string;
    description: string;
    dateTime: string;
    type: "EVENT" | "MIXER" | "WORKSHOP";
    imageUrl?: string;
    isForAllMembers: boolean;
    basePrice: number;
    locations: Array<{
        chapterId: string;
        address: string;
        chapter: {
            id: string;
            name: string;
            code: string;
        };
    }>;
    registrationsCount?: number;
}

interface Chapter {
    id: string;
    name: string;
    code: string;
}

export default function AdminEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [attendees, setAttendees] = useState<any[]>([]);
    const [loadingAttendees, setLoadingAttendees] = useState(false);

    const safeDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return isNaN(d.getTime()) ? new Date() : d;
        } catch {
            return new Date();
        }
    };

    // Form State
    const [form, setForm] = useState({
        title: "",
        description: "",
        dateTime: "",
        type: "EVENT",
        basePrice: 0,
        isForAllMembers: true,
        locations: [] as Array<{ chapterId: string; address: string }>
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [eventsRes, chaptersRes] = await Promise.all([
                api.get("/events"),
                api.get("/chapters")
            ]);
            setEvents(eventsRes.data || []);
            setChapters(chaptersRes.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load events or chapters");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/events", form);
            toast.success("Event created successfully!");
            setIsCreateModalOpen(false);
            fetchData();
            setForm({
                title: "",
                description: "",
                dateTime: "",
                type: "EVENT",
                basePrice: 0,
                isForAllMembers: true,
                locations: []
            });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create event");
        }
    };

    const fetchAttendees = async (eventId: string) => {
        setLoadingAttendees(true);
        try {
            const res = await api.get(`/events/${eventId}/attendees`);
            setAttendees(res.data || []);
        } catch (error) {
            toast.error("Failed to load attendees");
        } finally {
            setLoadingAttendees(false);
        }
    };

    const handleEventClick = (event: Event) => {
        setSelectedEvent(event);
        fetchAttendees(event.id);
    };

    // Calendar logic
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const getTypeBadgeClass = (type: string) => {
        if (type === "MIXER") return "bg-tatt-yellow/20 text-tatt-bronze-dark";
        if (type === "WORKSHOP") return "bg-tatt-lime-light text-tatt-lime-dark";
        return "bg-tatt-green-deep/10 text-tatt-green-deep";
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-8 lg:p-12">
            <Toaster position="top-right" />

            {/* Header */}
            <header className="flex flex-wrap items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black tracking-tight">Events & Mixers Management</h1>
                    <p className="text-tatt-gray mt-2 text-base">Plan, coordinate, and track all ecosystem gatherings.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-tatt-lime hover:bg-tatt-lime-dark text-tatt-green-deep px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-tatt-lime/20 transition-all"
                >
                    <Plus className="size-5" />
                    <span>Create New Event</span>
                </button>
            </header>

            {/* Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard
                    icon={<CalendarIcon className="text-tatt-lime-dark" />}
                    label="Total Upcoming Events"
                    value={events.filter(e => safeDate(e.dateTime) > new Date()).length.toString()}
                    trend="+2%"
                />
                <StatCard
                    icon={<Users className="text-tatt-lime-dark" />}
                    label="Registrations (Total)"
                    value={events.reduce((acc, e) => acc + (e.registrationsCount || 0), 0).toString()}
                    trend="+15%"
                />
                <StatCard
                    icon={<DollarSign className="text-tatt-lime-dark" />}
                    label="Base Revenue Goal"
                    value={`$${events.reduce((acc, e) => acc + (e.basePrice * (e.registrationsCount || 0)), 0).toLocaleString()}`}
                    trend="+8%"
                />
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Calendar View */}
                <section className="xl:col-span-1 bg-surface p-6 rounded-xl border border-border h-fit">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold">Event Calendar</h2>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-border rounded-lg transition-colors"><ChevronLeft className="size-5" /></button>
                            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-border rounded-lg transition-colors"><ChevronRight className="size-5" /></button>
                        </div>
                    </div>

                    <p className="text-center font-bold mb-4">{format(currentDate, "MMMM yyyy")}</p>

                    <div className="grid grid-cols-7 text-center text-xs font-bold text-tatt-gray mb-2">
                        <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-10"></div>
                        ))}

                        {calendarDays.map(day => {
                            const dayEvents = events.filter(e => isSameDay(safeDate(e.dateTime), day));
                            const isToday = isSameDay(new Date(), day);

                            return (
                                <div
                                    key={day.toString()}
                                    className={`h-10 flex items-center justify-center font-medium relative rounded-lg cursor-pointer hover:bg-border transition-colors ${isToday ? "bg-tatt-lime text-tatt-green-deep font-black" : ""}`}
                                >
                                    {format(day, "d")}
                                    {dayEvents.length > 0 && !isToday && (
                                        <span className="absolute bottom-1.5 size-1 bg-tatt-lime rounded-full"></span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-tatt-gray mb-4">Upcoming Agenda</h3>
                        <div className="space-y-4">
                            {events
                                .filter(e => new Date(e.dateTime) >= new Date())
                                .slice(0, 3)
                                .map(event => (
                                    <div
                                        key={event.id}
                                        onClick={() => handleEventClick(event)}
                                        className="flex items-start gap-4 p-3 rounded-lg hover:bg-border/50 transition-colors cursor-pointer border-l-2 border-transparent hover:border-tatt-lime"
                                    >
                                        <div className="text-xs font-bold text-tatt-lime-dark mt-1">{format(safeDate(event.dateTime), "HH:mm")}</div>
                                        <div>
                                            <h4 className="text-sm font-bold">{event.title}</h4>
                                            <p className="text-xs text-tatt-gray">
                                                {event.locations?.[0]?.chapter?.name || "Global"} • {event.locations?.[0]?.address || "TBA"}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            }
                            {events.filter(e => new Date(e.dateTime) >= new Date()).length === 0 && (
                                <p className="text-xs text-tatt-gray italic">No upcoming events scheduled.</p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Event List */}
                <section className="xl:col-span-2 space-y-6">
                    <div className="bg-surface rounded-xl border border-border overflow-hidden">
                        <div className="p-6 border-b border-border flex flex-wrap items-center justify-between gap-4">
                            <h2 className="text-lg font-bold">Manage Events</h2>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <input
                                        className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tatt-lime/50 w-64"
                                        placeholder="Search events..."
                                        type="text"
                                    />
                                    <Search className="absolute left-3 top-2.5 text-tatt-gray size-4" />
                                </div>
                                <button className="p-2 bg-background border border-border rounded-lg"><Filter className="size-4" /></button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-border/30 text-tatt-gray text-xs font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Event Name</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Chapter</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Visibility</th>
                                        <th className="px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-tatt-gray italic">
                                                <Loader2 className="size-6 animate-spin mx-auto mb-2" />
                                                Loading events...
                                            </td>
                                        </tr>
                                    ) : events.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-tatt-gray italic">No events found. Create your first event!</td>
                                        </tr>
                                    ) : (
                                        events.map(event => (
                                            <tr
                                                key={event.id}
                                                onClick={() => handleEventClick(event)}
                                                className="hover:bg-border/20 transition-colors cursor-pointer"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm">{event.title}</span>
                                                        <span className="text-xs text-tatt-gray">Base Price: ${Number(event.basePrice).toFixed(2) || "0.00"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium">
                                                    {format(safeDate(event.dateTime), "MMM dd, yyyy")}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    {event.locations && event.locations.length > 0 ? (
                                                        event.locations.length === 1 ? event.locations?.[0]?.chapter?.name : `${event.locations.length} Locations`
                                                    ) : "All Chapters"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${getTypeBadgeClass(event.type)}`}>
                                                        {event.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="flex items-center gap-1 text-tatt-lime-dark text-xs font-bold">
                                                        {event.isForAllMembers ? <Globe className="size-3" /> : <Lock className="size-3 text-tatt-bronze" />}
                                                        <span className={event.isForAllMembers ? "text-tatt-lime-dark" : "text-tatt-bronze"}>
                                                            {event.isForAllMembers ? "Public" : "Members Only"}
                                                        </span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button className="p-1 hover:text-tatt-lime-dark transition-colors"><MoreVertical className="size-4" /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Member Pricing Perk Summary */}
                    <div className="bg-tatt-lime-light/30 p-6 rounded-xl border border-tatt-lime/30">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle2 className="text-tatt-lime-dark size-5" />
                            <h3 className="text-sm font-bold">Dynamic Pricing Logic Active</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold uppercase text-tatt-gray">Ubuntu Members</span>
                                <span className="text-sm font-bold mt-1">15% Discount on all events</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold uppercase text-tatt-gray">Imani Members</span>
                                <span className="text-sm font-bold mt-1">Free Workshops • 25% on Mixers</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold uppercase text-tatt-gray">Kiongozi Members</span>
                                <span className="text-sm font-bold mt-1">All Events 100% Free (Inclusive)</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Create Event Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tatt-black/60 backdrop-blur-sm">
                    <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h2 className="text-xl font-bold">Create New Event</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-border rounded-full transition-colors">
                                <X className="size-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateEvent} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto scrollbar-hide">
                            <div className="space-y-1">
                                <label className="text-sm font-bold">Event Title</label>
                                <input
                                    required
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-tatt-lime"
                                    placeholder="e.g. Pan-African AI Symposium"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold">Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-tatt-lime"
                                    placeholder="Tell members about the event..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold">Date & Time</label>
                                    <input
                                        required
                                        type="datetime-local"
                                        value={form.dateTime}
                                        onChange={e => setForm({ ...form, dateTime: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-tatt-lime"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold">Event Type</label>
                                    <select
                                        value={form.type}
                                        onChange={e => setForm({ ...form, type: e.target.value as any })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-tatt-lime"
                                    >
                                        <option value="EVENT">General Event</option>
                                        <option value="MIXER">Mixer</option>
                                        <option value="WORKSHOP">Workshop</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold">Base Price ($)</label>
                                    <input
                                        type="number"
                                        value={form.basePrice}
                                        onChange={e => setForm({ ...form, basePrice: parseFloat(e.target.value) })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-tatt-lime"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold">Visibility</label>
                                    <select
                                        value={form.isForAllMembers ? "true" : "false"}
                                        onChange={e => setForm({ ...form, isForAllMembers: e.target.value === "true" })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-tatt-lime"
                                    >
                                        <option value="true">Public / All Members</option>
                                        <option value="false">Restricted / Tier-based</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold">Locations & Chapters</label>
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, locations: [...form.locations, { chapterId: chapters[0]?.id || "", address: "" }] })}
                                        className="text-xs font-bold text-tatt-lime-dark hover:underline flex items-center gap-1"
                                    >
                                        <Plus className="size-3" /> Add Location
                                    </button>
                                </div>
                                {form.locations.map((loc, idx) => (
                                    <div key={idx} className="flex gap-2 items-end">
                                        <div className="flex-1 space-y-1">
                                            <select
                                                value={loc.chapterId}
                                                onChange={e => {
                                                    const newLocs = [...form.locations];
                                                    if (newLocs[idx]) newLocs[idx].chapterId = e.target.value;
                                                    setForm({ ...form, locations: newLocs });
                                                }}
                                                className="w-full bg-background border border-border rounded-xl px-4 py-2 text-xs"
                                            >
                                                {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex-[2] space-y-1">
                                            <input
                                                value={loc.address}
                                                onChange={e => {
                                                    const newLocs = [...form.locations];
                                                    if (newLocs[idx]) newLocs[idx].address = e.target.value;
                                                    setForm({ ...form, locations: newLocs });
                                                }}
                                                placeholder="Venue address or 'Online'"
                                                className="w-full bg-background border border-border rounded-xl px-4 py-2 text-xs"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, locations: form.locations.filter((_, i) => i !== idx) })}
                                            className="p-2 text-tatt-bronze hover:bg-tatt-yellow/10 rounded-lg transition-colors"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-border flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 bg-tatt-lime text-tatt-green-deep font-black py-4 rounded-xl uppercase tracking-widest text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-tatt-lime/20"
                                >
                                    Schedule Event
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-8 border border-border font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-border/30 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Event Details and Attendees Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tatt-black/80 backdrop-blur-sm">
                    <div className="bg-surface w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Hero Header */}
                        <div className="relative h-48 bg-tatt-lime-light/30">
                            {selectedEvent.imageUrl ? (
                                <Image src={selectedEvent.imageUrl} alt={selectedEvent.title} fill className="object-cover" />
                            ) : (
                                <div className="size-full flex items-center justify-center font-black text-tatt-lime/30 text-4xl uppercase tracking-tighter italic">
                                    {selectedEvent.title}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent"></div>
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="absolute top-6 right-6 size-10 rounded-full bg-tatt-black/20 hover:bg-tatt-black/40 text-tatt-white flex items-center justify-center backdrop-blur-md transition-all z-10"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <div className="px-8 pb-8 -mt-12 relative z-10 flex-1 overflow-y-auto scrollbar-hide">
                            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                                <div className="space-y-1">
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block ${getTypeBadgeClass(selectedEvent.type)}`}>
                                        {selectedEvent.type}
                                    </div>
                                    <h2 className="text-3xl font-black text-foreground">{selectedEvent.title}</h2>
                                    <div className="flex items-center gap-4 text-xs font-bold text-tatt-gray">
                                        <span className="flex items-center gap-1.5"><CalendarIcon className="size-3.5 text-tatt-lime-dark" /> {format(safeDate(selectedEvent.dateTime), "MMMM dd, yyyy 'at' HH:mm")}</span>
                                        <span className="flex items-center gap-1.5"><MapPin className="size-3.5 text-tatt-lime-dark" /> {selectedEvent.locations?.[0]?.address || "Location TBA"}</span>
                                    </div>
                                </div>
                                <div className="bg-surface p-4 rounded-2xl shadow-sm border border-border text-center min-w-[120px]">
                                    <p className="text-[10px] font-black text-tatt-gray uppercase tracking-widest mb-1">Total Attendees</p>
                                    <p className="text-3xl font-black text-foreground">{attendees.length}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-tatt-lime-dark mb-3">About the Event</h3>
                                        <p className="text-sm text-tatt-gray leading-relaxed font-medium">
                                            {selectedEvent.description}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-tatt-lime-dark mb-3">Locations</h3>
                                        <div className="space-y-3">
                                            {selectedEvent.locations?.map((loc, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border">
                                                    <div className="size-10 bg-tatt-lime-light rounded-lg flex items-center justify-center text-tatt-lime-dark">
                                                        <Building2 className="size-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold">{loc.chapter?.name}</p>
                                                        <p className="text-[10px] text-tatt-gray">{loc.address}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!selectedEvent.locations || selectedEvent.locations.length === 0) && (
                                                <p className="text-xs text-tatt-gray italic">Global / All Chapters</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-tatt-lime-dark mb-3">Registered Members</h3>
                                    <div className="bg-background rounded-2xl border border-border overflow-hidden">
                                        <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                                            {loadingAttendees ? (
                                                <div className="p-8 text-center text-tatt-gray">
                                                    <Loader2 className="size-5 animate-spin mx-auto" />
                                                </div>
                                            ) : attendees.length === 0 ? (
                                                <div className="p-8 text-center text-tatt-gray text-xs italic">
                                                    No registrations yet.
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-border">
                                                    {attendees.map(reg => (
                                                        <div key={reg.id} className="p-3 flex items-center gap-3 hover:bg-border/20 transition-colors">
                                                            <div className="relative size-10 rounded-full overflow-hidden border border-border">
                                                                {reg.user.profilePicture ? (
                                                                    <Image src={reg.user.profilePicture} alt={reg.user.firstName} fill className="object-cover" />
                                                                ) : (
                                                                    <div className="size-full bg-tatt-lime-light flex items-center justify-center text-tatt-green-deep font-bold text-xs uppercase">
                                                                        {reg.user.firstName?.charAt(0)}{reg.user.lastName?.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-bold truncate">{reg.user.firstName} {reg.user.lastName}</p>
                                                                <p className="text-[9px] text-tatt-gray truncate">{reg.user.professionTitle || "Member"}</p>
                                                            </div>
                                                            <div className="text-right shrink-0">
                                                                <span className="text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded bg-surface border border-border">
                                                                    {reg.user.communityTier}
                                                                </span>
                                                                <p className="text-[9px] text-tatt-gray mt-0.5">{reg.user.chapter?.name || "Global"}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: string }) {
    return (
        <div className="bg-surface p-6 rounded-xl border border-border">
            <div className="flex items-center justify-between mb-4">
                <span className="p-2 bg-tatt-lime-light rounded-lg">{icon}</span>
                <span className="text-tatt-lime-dark text-sm font-bold flex items-center gap-1">
                    {trend} <TrendingUp className="size-4" />
                </span>
            </div>
            <p className="text-tatt-gray text-sm font-medium">{label}</p>
            <p className="text-3xl font-black mt-1">{value}</p>
        </div>
    );
}
