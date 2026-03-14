"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    AlertCircle,
    HeartHandshake,
    Settings,
    MessageSquare,
    ArrowUpRight
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
    memberCount?: number;
    _count?: {
        members: number;
    }
}

export function AdminRegionalChaptersPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("directory");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orgMembers, setOrgMembers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
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

    const openEditModal = (chapter: Chapter) => {
        setSelectedChapterId(chapter.id);
        setFormData({
            name: chapter.name,
            country: chapter.country || "",
            stateRegion: chapter.stateRegion || "",
            cities: chapter.cities.join(", "),
            regionalManagerId: chapter.regionalManagerId || "",
            associateRegionalDirectorId: chapter.associateRegionalDirectorId || ""
        });
        setIsCreateModalOpen(true);
    };

    const handleCreateChapter = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            
            const payload = {
                ...formData,
                cities: formData.cities.split(",").map(c => c.trim()).filter(c => c !== ""),
                regionalManagerId: formData.regionalManagerId || undefined,
                associateRegionalDirectorId: formData.associateRegionalDirectorId || undefined
            };

            if (selectedChapterId) {
                await api.patch(`/chapters/${selectedChapterId}`, payload);
            } else {
                const code = generateChapterCode();
                await api.post("/chapters", { ...payload, code });
            }

            setIsCreateModalOpen(false);
            setSelectedChapterId(null);
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
            console.error("Failed to save chapter:", error);
            alert("Error saving chapter. Please check if the name is unique.");
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
                <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
                    <p className="text-sm text-tatt-gray font-medium">Active Members</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-3xl font-black text-foreground">
                            {chapters.reduce((acc, curr) => acc + (Number(curr.memberCount) || 0), 0)}
                        </span>
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
                                        <th className="px-6 py-4 text-xs font-bold text-tatt-gray uppercase tracking-wider">Members</th>
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
                                                    <div 
                                                        className="font-bold text-foreground flex items-center gap-2 cursor-pointer hover:text-tatt-lime transition-colors group/name"
                                                        onClick={() => router.push(`/admin/regional-chapters/${chapter.id}`)}
                                                    >
                                                        {chapter.name}
                                                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover/name:opacity-100 transition-opacity" />
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
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-8 rounded-lg bg-background border border-border flex items-center justify-center">
                                                            <Users className="h-4 w-4 text-tatt-lime" />
                                                        </div>
                                                        <span className="text-sm font-black text-foreground">
                                                            {Number(chapter.memberCount) || 0}
                                                        </span>
                                                    </div>
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
                                                        <button 
                                                            className="p-2 text-tatt-gray hover:text-tatt-lime hover:bg-tatt-lime/10 rounded-lg transition-colors group" 
                                                            title="View Chapter Details"
                                                            onClick={() => router.push(`/admin/regional-chapters/${chapter.id}`)}
                                                        >
                                                            <ArrowUpRight className="h-4 w-4" />
                                                        </button>
                                                        <button 
                                                            className="p-2 text-tatt-gray hover:text-tatt-lime hover:bg-tatt-lime/10 rounded-lg transition-colors group" 
                                                            title="Manage Volunteers"
                                                            onClick={() => router.push(`/admin/regional-chapters/${chapter.id}?tab=volunteers`)}
                                                        >
                                                            <Users className="h-4 w-4" />
                                                        </button>
                                                        <button 
                                                            className="p-2 text-tatt-gray hover:text-tatt-lime hover:bg-tatt-lime/10 rounded-lg transition-colors group" 
                                                            title="View Activities"
                                                            onClick={() => router.push(`/admin/regional-chapters/${chapter.id}?tab=activities`)}
                                                        >
                                                            <ClipboardList className="h-4 w-4" />
                                                        </button>
                                                        <button 
                                                            className="p-2 text-tatt-gray hover:text-tatt-lime hover:bg-tatt-lime/10 rounded-lg transition-colors group" 
                                                            title="Edit Chapter"
                                                            onClick={() => openEditModal(chapter)}
                                                        >
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
                                <h3 className="text-xl font-bold text-foreground">{selectedChapterId ? 'Edit Regional Chapter' : 'Establish Regional Chapter'}</h3>
                                <p className="text-xs text-tatt-gray mt-1">{selectedChapterId ? 'Update chapter configuration and leadership.' : 'Configure identity, location, and leadership roles.'}</p>
                            </div>
                            <button onClick={() => { setIsCreateModalOpen(false); setSelectedChapterId(null); }} className="bg-surface hover:bg-background h-8 w-8 flex items-center justify-center rounded-full border border-border text-tatt-gray hover:text-foreground transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateChapter}>
                            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                {/* Section: Chapter Identity */}
                                <section className="bg-surface  p-8 rounded-xl shadow-sm border border-border">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-tatt-lime/10 p-2 rounded-lg text-tatt-lime">
                                            <Info className="h-5 w-5" />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground">Chapter Identity</h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-semibold text-tatt-gray">Chapter Name</label>
                                            <input
                                                required
                                                type="text"
                                                className="rounded-lg border border-border focus:border-tatt-lime focus:ring-tatt-lime bg-background-light/30   h-12 px-4"
                                                placeholder="e.g., Accra Hub, Berlin Collective"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </section>
                                {/* Section: Detailed Location */}
                                <section className="bg-surface  p-8 rounded-xl shadow-sm border border-border mt-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-tatt-lime/10 p-2 rounded-lg text-tatt-lime">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground">Detailed Location</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-semibold text-tatt-gray">Country</label>
                                            <input
                                                required
                                                type="text"
                                                className="rounded-lg border border-border focus:border-tatt-lime focus:ring-tatt-lime bg-background-light/30   h-12 px-4"
                                                placeholder="e.g. Ghana"
                                                value={formData.country}
                                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-semibold text-tatt-gray">State / Region</label>
                                            <input
                                                required
                                                type="text"
                                                className="rounded-lg border border-border focus:border-tatt-lime focus:ring-tatt-lime bg-background-light/30   h-12 px-4"
                                                placeholder="e.g. Greater Accra"
                                                value={formData.stateRegion}
                                                onChange={(e) => setFormData({ ...formData, stateRegion: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-semibold text-tatt-gray">Primary Cities (Comma Separated)</label>
                                            <input
                                                required
                                                type="text"
                                                className="rounded-lg border border-border focus:border-tatt-lime focus:ring-tatt-lime bg-background-light/30   h-12 px-4"
                                                placeholder="Accra, Tema, Kumasi"
                                                value={formData.cities}
                                                onChange={(e) => setFormData({ ...formData, cities: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </section>
                                {/* Section: Leadership Assignment */}
                                <section className="bg-surface  p-8 rounded-xl shadow-sm border border-border mt-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-tatt-lime/10 p-2 rounded-lg text-tatt-lime">
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground">Leadership Assignment</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-sm font-semibold text-tatt-gray">Regional Director</label>
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
                                        <div className="space-y-4">
                                            <label className="text-sm font-semibold text-tatt-gray">Associate Regional Director</label>
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
                                </section>
                                {/* Section: Chapter Features */}
                                <section className="bg-surface  p-8 rounded-xl shadow-sm border border-border mt-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-tatt-lime/10 p-2 rounded-lg text-tatt-lime">
                                            <Settings className="h-5 w-5" />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground">Chapter Features</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Volunteers Program Toggle */}
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-background-light/50  border border-border gap-4">
                                            <div className="flex gap-4">
                                                <HeartHandshake className="text-tatt-gray h-5 w-5 shrink-0" />
                                                <div>
                                                    <p className="font-bold text-sm text-foreground">Volunteers Program</p>
                                                    <p className="text-xs text-tatt-gray">Enable local volunteer recruitment</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                                <input type="checkbox" className="sr-only peer" />
                                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-tatt-lime" />
                                            </label>
                                        </div>
                                        {/* Local Forum Toggle */}
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-background-light/50  border border-border gap-4">
                                            <div className="flex gap-4">
                                                <MessageSquare className="text-tatt-gray h-5 w-5 shrink-0" />
                                                <div>
                                                    <p className="font-bold text-sm text-foreground">Local Forum</p>
                                                    <p className="text-xs text-tatt-gray">Activate chapter discussion board</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                                <input type="checkbox" className="sr-only peer" />
                                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-tatt-lime" />
                                            </label>
                                        </div>
                                    </div>
                                </section>
                                {/* Form Actions */}
                                <div className="flex flex-col md:flex-row items-center justify-end gap-4 py-8 border-t border-border mt-6">
                                    <button
                                        type="button"
                                        className="w-full md:w-auto px-8 py-3 rounded-lg text-sm font-bold text-tatt-gray hover:bg-surface transition-colors"
                                        onClick={() => setIsCreateModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full md:w-auto bg-tatt-lime text-background-dark px-10 py-3 rounded-lg text-sm font-bold shadow-xl shadow-tatt-lime/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                        {selectedChapterId ? 'Update Regional Chapter' : 'Create Regional Chapter'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
