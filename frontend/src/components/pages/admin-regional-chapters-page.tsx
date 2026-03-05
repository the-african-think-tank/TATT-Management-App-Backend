"use client";

import { useState, useEffect } from "react";
import {
    PlusCircle,
    Search,
    Users,
    ClipboardList,
    Edit,
    Activity,
    Megaphone,
    Info,
    Globe,
    ChevronLeft,
    ChevronRight,
    MapPin,
    X,
    Loader2,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import api from "@/services/api";
import { useAuth, User } from "@/context/auth-context";

interface Chapter {
    id: string;
    code: string;
    name: string;
    description?: string;
    country?: string;
    stateRegion?: string;
    cities: string[];
    regionalManagerId?: string;
    associateRegionalDirectorId?: string;
    regionalManager?: User;
    associateRegionalDirector?: User;
    createdAt: string;
    _count?: {
        members: number;
    }
}

export function AdminRegionalChaptersPage() {
    const [activeTab, setActiveTab] = useState("directory");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orgMembers, setOrgMembers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        country: "",
        stateRegion: "",
        cities: "",
        regionalManagerId: "",
        associateRegionalDirectorId: ""
    });

    useEffect(() => {
        fetchChapters();
        fetchOrgMembers();
    }, []);

    const fetchChapters = async () => {
        try {
            setIsLoading(true);
            const response = await api.get("/chapters");
            setChapters(response.data);
        } catch (error) {
            console.error("Failed to fetch chapters:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchOrgMembers = async () => {
        try {
            // Fetch potential leaders (admins/staff)
            const response = await api.get("/users/org-members", {
                params: { role: 'ADMIN' } // Or fetch all and filter
            });
            setOrgMembers(response.data);
        } catch (error) {
            console.error("Failed to fetch org members:", error);
        }
    };

    const generateChapterCode = () => {
        // Find highest existing code if they are numeric
        const numericCodes = chapters
            .map(c => parseInt(c.code))
            .filter(n => !isNaN(n));

        if (numericCodes.length === 0) return "1001";

        const nextCode = Math.max(...numericCodes) + 1;
        return nextCode.toString().padStart(4, "0");
    };

    const handleCreateChapter = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const code = generateChapterCode();

            const payload = {
                ...formData,
                code,
                cities: formData.cities.split(",").map(c => c.trim()).filter(c => c !== ""),
                regionalManagerId: formData.regionalManagerId || undefined,
                associateRegionalDirectorId: formData.associateRegionalDirectorId || undefined
            };

            await api.post("/chapters", payload);
            setIsCreateModalOpen(false);
            setFormData({
                name: "",
                country: "",
                stateRegion: "",
                cities: "",
                regionalManagerId: "",
                associateRegionalDirectorId: ""
            });
            fetchChapters();
        } catch (error) {
            console.error("Failed to create chapter:", error);
            alert("Error creating chapter. Please check if the name is unique.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredChapters = chapters.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.stateRegion?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10 px-4 sm:px-0">
            {/* Header / Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Regional Chapters Administration</h2>
                    <p className="text-sm text-tatt-gray mt-1">Manage global chapters, leadership, and regional activities.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-tatt-lime hover:brightness-105 text-tatt-black font-bold px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all text-sm shrink-0"
                >
                    <PlusCircle className="h-4 w-4" />
                    Create New Chapter
                </button>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
                    <p className="text-sm text-tatt-gray font-medium">Total Chapters</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-3xl font-black text-foreground">{chapters.length}</span>
                    </div>
                </div>
                <div className="bg-surface p-5 rounded-xl border border-border shadow-sm opacity-60">
                    <p className="text-sm text-tatt-gray font-medium">Global Volunteers</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-3xl font-black text-foreground">--</span>
                        <span className="text-[10px] text-tatt-gray italic font-medium px-1.5 py-0.5 rounded">Coming Soon</span>
                    </div>
                </div>
                <div className="bg-surface p-5 rounded-xl border border-border shadow-sm opacity-60">
                    <p className="text-sm text-tatt-gray font-medium">Active Members</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-3xl font-black text-foreground">--</span>
                    </div>
                </div>
                <div className="bg-surface p-5 rounded-xl border border-border shadow-sm opacity-60">
                    <p className="text-sm text-tatt-gray font-medium">Recent Activities</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-3xl font-black text-foreground">--</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-border flex gap-6 overflow-x-auto custom-scrollbar">
                <button
                    className={`whitespace-nowrap px-4 py-3 border-b-2 font-bold text-sm transition-colors ${activeTab === 'directory' ? 'border-tatt-lime text-foreground' : 'border-transparent text-tatt-gray hover:text-foreground'}`}
                    onClick={() => setActiveTab('directory')}
                >
                    Chapter Directory
                </button>
                <button
                    className={`whitespace-nowrap px-4 py-3 border-b-2 font-bold text-sm transition-colors ${activeTab === 'activities' ? 'border-tatt-lime text-foreground' : 'border-transparent text-tatt-gray hover:text-foreground'}`}
                    onClick={() => setActiveTab('activities')}
                >
                    Chapter Activities
                </button>
                <button
                    className={`whitespace-nowrap px-4 py-3 border-b-2 font-bold text-sm transition-colors ${activeTab === 'announcements' ? 'border-tatt-lime text-foreground' : 'border-transparent text-tatt-gray hover:text-foreground'}`}
                    onClick={() => setActiveTab('announcements')}
                >
                    Regional Announcements
                </button>
            </div>

            {/* Chapter Directory Table Area */}
            {activeTab === 'directory' && (
                <div className="space-y-6">
                    {/* Search/Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tatt-gray h-4 w-4" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search chapters by name or region..."
                                className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-1 focus:ring-tatt-lime outline-none text-foreground placeholder:text-tatt-gray/60"
                            />
                        </div>
                    </div>

                    <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-background border-b border-border">
                                        <th className="px-6 py-4 text-xs font-bold text-tatt-gray uppercase tracking-wider">Chapter Name & Region</th>
                                        <th className="px-6 py-4 text-xs font-bold text-tatt-gray uppercase tracking-wider">ID / Code</th>
                                        <th className="px-6 py-4 text-xs font-bold text-tatt-gray uppercase tracking-wider">Leadership Team</th>
                                        <th className="px-6 py-4 text-xs font-bold text-tatt-gray uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Loader2 className="h-8 w-8 text-tatt-lime animate-spin" />
                                                    <p className="text-sm text-tatt-gray font-medium">Loading chapters...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredChapters.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-20 text-center text-tatt-gray">
                                                {searchQuery ? "No chapters match your search." : "No chapters created yet."}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredChapters.map((chapter) => (
                                            <tr key={chapter.id} className="hover:bg-background/50 transition-colors">
                                                <td className="px-6 py-5">
                                                    <div className="font-bold text-foreground flex items-center gap-2">
                                                        {chapter.name}
                                                    </div>
                                                    <div className="text-sm text-tatt-gray flex items-center gap-1 mt-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {chapter.country || "Unspecified"} / {chapter.stateRegion || chapter.cities?.[0]}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="font-mono text-xs bg-background px-2 py-1 rounded border border-border font-bold">
                                                        ID: {chapter.code}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex -space-x-2">
                                                            {chapter.regionalManager ? (
                                                                <div className="size-8 rounded-full border-2 border-surface bg-tatt-lime flex items-center justify-center text-tatt-black font-bold text-[10px] uppercase">
                                                                    {chapter.regionalManager.firstName[0]}{chapter.regionalManager.lastName[0]}
                                                                </div>
                                                            ) : (
                                                                <div className="size-8 rounded-full border-2 border-surface bg-background flex items-center justify-center text-tatt-gray">
                                                                    <Users className="h-3 w-3" />
                                                                </div>
                                                            )}
                                                            {chapter.associateRegionalDirector ? (
                                                                <div className="size-8 rounded-full border-2 border-surface bg-tatt-black flex items-center justify-center text-white font-bold text-[10px] uppercase">
                                                                    {chapter.associateRegionalDirector.firstName[0]}{chapter.associateRegionalDirector.lastName[0]}
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                        <div className="text-[11px] leading-tight">
                                                            {chapter.regionalManager ? (
                                                                <p className="font-bold text-foreground">
                                                                    {chapter.regionalManager.firstName} {chapter.regionalManager.lastName} <span className="text-tatt-gray font-normal">(RD)</span>
                                                                </p>
                                                            ) : <p className="text-tatt-gray italic">No Director Assigned</p>}
                                                            {chapter.associateRegionalDirector && (
                                                                <p className="text-tatt-gray mt-0.5">
                                                                    {chapter.associateRegionalDirector.firstName} {chapter.associateRegionalDirector.lastName} <span className="opacity-70">(ARD)</span>
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <button className="p-2 text-tatt-gray hover:text-tatt-lime hover:bg-tatt-lime/10 rounded-lg transition-colors group" title="Manage Volunteers">
                                                            <Users className="h-4 w-4" />
                                                        </button>
                                                        <button className="p-2 text-tatt-gray hover:text-tatt-lime hover:bg-tatt-lime/10 rounded-lg transition-colors group" title="View Activities">
                                                            <ClipboardList className="h-4 w-4" />
                                                        </button>
                                                        <button className="p-2 text-tatt-gray hover:text-tatt-lime hover:bg-tatt-lime/10 rounded-lg transition-colors group" title="Edit Chapter">
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                        {/* Chapter Activities Mini View */}
                        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm opacity-60">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
                                    <Activity className="h-5 w-5 text-tatt-lime" />
                                    Ongoing Activities
                                </h3>
                                <button className="text-[10px] font-black text-tatt-lime uppercase tracking-widest hover:underline" onClick={() => setActiveTab('activities')}>View All</button>
                            </div>
                            <div className="py-8 text-center">
                                <p className="text-xs text-tatt-gray italic">Activity integration coming soon...</p>
                            </div>
                        </div>

                        {/* Regional Announcements Mini View */}
                        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm opacity-60">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
                                    <Megaphone className="h-5 w-5 text-tatt-lime" />
                                    Regional Updates
                                </h3>
                                <button className="text-[10px] font-black text-tatt-lime uppercase tracking-widest hover:underline" onClick={() => setActiveTab('announcements')}>New Post</button>
                            </div>
                            <div className="py-8 text-center">
                                <p className="text-xs text-tatt-gray italic">Announcements integration coming soon...</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {(activeTab === 'activities' || activeTab === 'announcements') && (
                <div className="py-12 flex flex-col items-center justify-center bg-surface border border-border border-dashed rounded-xl text-center">
                    <Globe className="h-10 w-10 text-tatt-gray mb-4 opacity-50" />
                    <h3 className="text-lg font-bold text-foreground">Content Coming Soon</h3>
                    <p className="text-sm text-tatt-gray mt-2 max-w-sm">
                        The fully featured module for {activeTab === 'activities' ? "Chapter Activities" : "Regional Announcements"} is currently undergoing integration.
                    </p>
                    <button
                        className="mt-6 px-4 py-2 border border-border rounded-lg text-sm font-bold text-foreground hover:bg-background transition-colors"
                        onClick={() => setActiveTab('directory')}
                    >
                        Return to Directory
                    </button>
                </div>
            )}

            {/* Create Chapter Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-tatt-black/80 backdrop-blur-sm p-4 animate-in fade-in transition-opacity">
                    <div className="bg-surface rounded-2xl border border-border w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-background/50">
                            <div>
                                <h3 className="text-xl font-bold text-foreground">Establish Regional Chapter</h3>
                                <p className="text-xs text-tatt-gray mt-1">Configure identity, location, and leadership roles.</p>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} className="bg-surface hover:bg-background h-8 w-8 flex items-center justify-center rounded-full border border-border text-tatt-gray hover:text-foreground transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateChapter}>
                            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                {/* Section: Identity */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-tatt-lime font-bold text-[10px] uppercase tracking-widest">
                                        <Info className="h-3 w-3" />
                                        Chapter Identity
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-tatt-gray mb-1.5 uppercase tracking-wide">Chapter Name</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-tatt-lime outline-none text-foreground placeholder-tatt-gray/40 transition-all font-medium"
                                            placeholder="e.g. Accra Collective Hub"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Section: Location */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-tatt-lime font-bold text-[10px] uppercase tracking-widest">
                                        <MapPin className="h-3 w-3" />
                                        Detailed Location
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-tatt-gray mb-1.5 uppercase tracking-wide">Country</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-tatt-lime outline-none text-foreground transition-all"
                                                placeholder="e.g. Ghana"
                                                value={formData.country}
                                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-tatt-gray mb-1.5 uppercase tracking-wide">State / Region</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-tatt-lime outline-none text-foreground transition-all"
                                                placeholder="e.g. Greater Accra"
                                                value={formData.stateRegion}
                                                onChange={(e) => setFormData({ ...formData, stateRegion: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-tatt-gray mb-1.5 uppercase tracking-wide">Primary Cities (Comma Separated)</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-tatt-lime outline-none text-foreground transition-all"
                                            placeholder="Accra, Tema, Kumasi"
                                            value={formData.cities}
                                            onChange={(e) => setFormData({ ...formData, cities: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Section: Leadership */}
                                <div className="space-y-4 pt-2 border-t border-border/50">
                                    <div className="flex items-center gap-2 text-tatt-lime font-bold text-[10px] uppercase tracking-widest">
                                        <Users className="h-3 w-3" />
                                        Leadership Directives
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-tatt-gray mb-1.5 uppercase tracking-wide">Regional Director</label>
                                            <select
                                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-tatt-lime outline-none text-foreground"
                                                value={formData.regionalManagerId}
                                                onChange={(e) => setFormData({ ...formData, regionalManagerId: e.target.value })}
                                            >
                                                <option value="">Search & Assign Director...</option>
                                                {orgMembers.map(member => (
                                                    <option key={member.id} value={member.id}>{member.firstName} {member.lastName} ({member.email})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-tatt-gray mb-1.5 uppercase tracking-wide">Associate Director</label>
                                            <select
                                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-tatt-lime outline-none text-foreground"
                                                value={formData.associateRegionalDirectorId}
                                                onChange={(e) => setFormData({ ...formData, associateRegionalDirectorId: e.target.value })}
                                            >
                                                <option value="">Search & Assign Associate...</option>
                                                {orgMembers.map(member => (
                                                    <option key={member.id} value={member.id}>{member.firstName} {member.lastName}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-background border-t border-border flex flex-col-reverse sm:flex-row justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-foreground bg-surface border border-border hover:bg-background transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto px-10 py-3 rounded-xl text-sm font-black text-tatt-black bg-tatt-lime hover:brightness-105 transition-all shadow-xl shadow-tatt-lime/10 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                    Create Regional Chapter
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
