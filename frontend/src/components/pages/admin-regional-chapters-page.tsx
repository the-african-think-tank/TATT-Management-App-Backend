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
    Calendar,
    Monitor,
    MoreVertical,
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
    ArrowUpRight,
    Trash2
} from "lucide-react";
import api from "@/services/api";
import { useAuth, User } from "@/context/auth-context";
import { format } from "date-fns";
import toast from "react-hot-toast";

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


type ActivityType = 'ANNOUNCEMENT' | 'EVENT' | 'INITIATIVE' | 'NEWS' | 'COMMUNITY_OUTREACH' | 'PROFESSIONAL_DEVELOPMENT' | 'FUNDRAISING' | 'RESEARCH_POLICY' | 'INTERNAL_WORKSHOP';
type LocationType = 'PHYSICAL' | 'VIRTUAL';
type ActivityVisibility = 'VOLUNTEERS_ONLY' | 'CHAPTER_WIDE';

interface ChapterActivity {
    id: string;
    title: string;
    content: string;
    type: ActivityType;
    eventDate?: string;
    endDate?: string;
    locationType?: LocationType;
    eventLocation?: string;
    visibility: ActivityVisibility;
    targetVolunteers?: number;
    volunteerManager?: User;
    rolesNeeded?: { title: string, description: string }[];
    author: User;
    createdAt: string;
    isPublished: boolean;
    chapter?: { id: string, name: string, code: string };
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

    const { user } = useAuth();
    const [activities, setActivities] = useState<ChapterActivity[]>([]);
    const [isCreateActivityModalOpen, setIsCreateActivityModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; chapter: Chapter | null; isDeleting: boolean }>({
        open: false,
        chapter: null,
        isDeleting: false,
    });
    const [activityForm, setActivityForm] = useState({
        chapterId: "",
        title: "",
        content: "",
        type: "ANNOUNCEMENT" as ActivityType,
        eventDate: "",
        endDate: "",
        locationType: "PHYSICAL" as LocationType,
        eventLocation: "",
        visibility: "CHAPTER_WIDE" as ActivityVisibility,
        targetVolunteers: 0
    });

    const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        country: "",
        stateRegion: "",
        cities: "",
        regionalManagerId: "",
        associateRegionalDirectorId: ""
    });
    const [volunteerCount, setVolunteerCount] = useState<number>(0);

    const fetchActivities = async () => {
        try {
            const response = await api.get("/chapters/all-activities");
            setActivities(response.data.data);
        } catch (error) {
            console.error("Failed to fetch activities:", error);
        }
    };

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
            // Fetch potential leaders (admins/staff/regional admins)
            const response = await api.get("/users/org-members");
            setOrgMembers(response.data);
        } catch (error) {
            console.error("Failed to fetch org members:", error);
        }
    };

    const fetchVolunteerStats = async () => {
        try {
            const response = await api.get("/volunteers/admin/stats");
            setVolunteerCount(response.data?.totalVolunteers || response.data?.total || 0);
        } catch (error) {
            console.error("Failed to fetch volunteer stats:", error);
        }
    };

    useEffect(() => {
        fetchChapters();
        fetchOrgMembers();
        fetchActivities();
        fetchVolunteerStats();
    }, []);

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
                regionalManagerId: formData.regionalManagerId || null,
                associateRegionalDirectorId: formData.associateRegionalDirectorId || null
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

    const handleDeleteChapter = async (id: string, name: string) => {
        const chapter = chapters.find(c => c.id === id);
        if (!chapter) return;
        setDeleteModal({ open: true, chapter, isDeleting: false });
    };

    const confirmDeleteChapter = async () => {
        if (!deleteModal.chapter) return;
        setDeleteModal(prev => ({ ...prev, isDeleting: true }));
        try {
            await api.delete(`/chapters/${deleteModal.chapter!.id}`);
            toast.success(`"${deleteModal.chapter!.name}" has been permanently deleted.`);
            setDeleteModal({ open: false, chapter: null, isDeleting: false });
            fetchChapters();
        } catch (error: any) {
            const msg = error.response?.data?.message || "Failed to remove chapter";
            setDeleteModal(prev => ({ ...prev, isDeleting: false }));
            // Show as a styled warning (not error) since it's a user-readable guard message
            toast(
                (t) => (
                    <div className="flex items-start gap-3">
                        <div className="size-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 mt-0.5">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        </div>
                        <div>
                            <p className="font-black text-sm text-foreground">Cannot Delete Chapter</p>
                            <p className="text-xs text-tatt-gray mt-0.5 leading-relaxed">{msg}</p>
                        </div>
                    </div>
                ),
                { duration: 6000, style: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '1rem', padding: '1rem' } }
            );
        }
    };

    const handleCreateActivity = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const isAnnouncement = activityForm.type === 'ANNOUNCEMENT';
            const payload: Record<string, any> = {
                type: activityForm.type,
                title: activityForm.title,
                content: activityForm.content,
                visibility: activityForm.visibility,
            };

            // Date/location fields only apply to non-announcement activity types
            if (!isAnnouncement) {
                if (activityForm.eventDate) payload.eventDate = new Date(activityForm.eventDate).toISOString();
                if (activityForm.endDate) payload.endDate = new Date(activityForm.endDate).toISOString();
                payload.locationType = activityForm.locationType;
                if (activityForm.eventLocation) payload.eventLocation = activityForm.eventLocation;
                if (activityForm.targetVolunteers) payload.targetVolunteers = Number(activityForm.targetVolunteers);
            }

            const chapId = activityForm.chapterId;
            await api.post(`/chapters/${chapId}/activities`, payload);
            setIsCreateActivityModalOpen(false);
            setActivityForm({
                chapterId: "",
                title: "",
                content: "",
                type: activeTab === 'announcements' ? "ANNOUNCEMENT" : "EVENT",
                eventDate: "",
                endDate: "",
                locationType: "PHYSICAL" as LocationType,
                eventLocation: "",
                visibility: "CHAPTER_WIDE" as ActivityVisibility,
                targetVolunteers: 0
            });
            toast.success("Activity posted successfully");
            fetchActivities();
        } catch (error: any) {
            console.error("Failed to post activity:", error);
            toast.error(error.response?.data?.message || "Failed to post activity");
        } finally {
            setIsSubmitting(false);
        }
    };

    const availableChapters = (user?.systemRole === 'REGIONAL_ADMIN') 
        ? chapters.filter(c => c.regionalManagerId === user?.id || c.associateRegionalDirectorId === user?.id)
        : chapters;

    const filteredActivities = activities.filter(a => activeTab === 'announcements' ? a.type === 'ANNOUNCEMENT' : a.type !== 'ANNOUNCEMENT');

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
                
                {activeTab === 'directory' ? (
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-tatt-lime hover:brightness-105 text-tatt-black font-bold px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all text-sm shrink-0"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Create New Chapter
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            setActivityForm(prev => ({ 
                                ...prev, 
                                type: activeTab === 'announcements' ? 'ANNOUNCEMENT' : 'EVENT',
                                eventDate: "",
                                endDate: ""
                            }));
                            setIsCreateActivityModalOpen(true);
                        }}
                        className="bg-tatt-lime hover:brightness-105 text-tatt-black font-bold px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all text-sm shrink-0"
                    >
                        <Megaphone className="h-4 w-4" />
                        Post {activeTab === 'announcements' ? 'Announcement' : 'Activity'}
                    </button>
                )}

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
                <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
                    <p className="text-sm text-tatt-gray font-medium">Global Volunteers</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-3xl font-black text-foreground">{volunteerCount}</span>
                    </div>
                </div>
                <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
                    <p className="text-sm text-tatt-gray font-medium">Recent Activities</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-3xl font-black text-foreground">{activities.length}</span>
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
                                                        {user?.systemRole === "SUPERADMIN" && (
                                                            <button 
                                                                className="p-2 text-tatt-gray hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors group" 
                                                                title="Delete Chapter"
                                                                onClick={() => handleDeleteChapter(chapter.id, chapter.name)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        )}
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
                        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
                                    <Activity className="h-5 w-5 text-tatt-lime" />
                                    Recent Activities
                                </h3>
                                <button className="text-[10px] font-black text-tatt-lime uppercase tracking-widest hover:underline" onClick={() => setActiveTab('activities')}>View All</button>
                            </div>
                            {activities.filter(a => a.type !== 'ANNOUNCEMENT').slice(0, 3).length === 0 ? (
                                <p className="text-xs text-tatt-gray italic py-6 text-center">No activities recorded yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {activities.filter(a => a.type !== 'ANNOUNCEMENT').slice(0, 3).map(activity => (
                                        <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl bg-background border border-border hover:border-tatt-lime/30 transition-all cursor-pointer" onClick={() => setActiveTab('activities')}>
                                            <div className="mt-0.5 size-7 rounded-lg bg-tatt-lime/10 text-tatt-lime flex items-center justify-center shrink-0">
                                                <Activity className="h-3.5 w-3.5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-foreground truncate">{activity.title}</p>
                                                <p className="text-[10px] text-tatt-gray uppercase tracking-widest mt-0.5">{activity.type?.replace(/_/g, ' ')} · {activity.chapter?.name || 'Global'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Regional Announcements Mini View */}
                        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
                                    <Megaphone className="h-5 w-5 text-tatt-lime" />
                                    Regional Announcements
                                </h3>
                                <button className="text-[10px] font-black text-tatt-lime uppercase tracking-widest hover:underline" onClick={() => setActiveTab('announcements')}>View All</button>
                            </div>
                            {activities.filter(a => a.type === 'ANNOUNCEMENT').slice(0, 3).length === 0 ? (
                                <p className="text-xs text-tatt-gray italic py-6 text-center">No announcements posted yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {activities.filter(a => a.type === 'ANNOUNCEMENT').slice(0, 3).map(activity => (
                                        <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl bg-background border border-border hover:border-tatt-lime/30 transition-all cursor-pointer" onClick={() => setActiveTab('announcements')}>
                                            <div className="mt-0.5 size-7 rounded-lg bg-tatt-lime/10 text-tatt-lime flex items-center justify-center shrink-0">
                                                <Megaphone className="h-3.5 w-3.5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-foreground truncate">{activity.title}</p>
                                                <p className="text-[10px] text-tatt-gray uppercase tracking-widest mt-0.5">{activity.chapter?.name || 'Global'} · {activity.author?.firstName} {activity.author?.lastName}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            
            {(activeTab === 'activities' || activeTab === 'announcements') && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredActivities.length === 0 ? (
                        <div className="col-span-full py-20 bg-surface rounded-[2rem] border border-border border-dashed text-center">
                            <ClipboardList className="h-10 w-10 mx-auto text-tatt-gray/40 mb-4" />
                            <h3 className="font-bold text-lg">No {activeTab === 'announcements' ? 'announcements' : 'activities'} recorded yet</h3>
                            <p className="text-sm text-tatt-gray max-w-xs mx-auto mt-2">Start documenting regional updates.</p>
                        </div>
                    ) : (
                        filteredActivities.map((activity) => (
                            <div key={activity.id} className="bg-surface rounded-3xl border border-border p-6 shadow-sm hover:ring-2 hover:ring-tatt-lime/20 transition-all group flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${
                                                activity.type === 'EVENT' ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20' :
                                                activity.type === 'COMMUNITY_OUTREACH' ? 'bg-tatt-lime/10 text-tatt-lime border border-tatt-lime/20' :
                                                activity.type === 'PROFESSIONAL_DEVELOPMENT' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' :
                                                activity.type === 'FUNDRAISING' ? 'bg-tatt-bronze/10 text-tatt-bronze border border-tatt-bronze/20' :
                                                activity.type === 'RESEARCH_POLICY' ? 'bg-tatt-green-deep/10 text-tatt-green-deep border border-tatt-green-deep/20' :
                                                activity.type === 'INTERNAL_WORKSHOP' ? 'bg-tatt-yellow/10 text-tatt-yellow-mustard border border-tatt-yellow/20' :
                                                activity.type === 'NEWS' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' :
                                                activity.type === 'INITIATIVE' ? 'bg-tatt-lime/10 text-tatt-green border border-tatt-lime/20' :
                                                'bg-slate-500/10 text-slate-600 border border-slate-500/20'
                                            }`}>
                                                {activity.type?.replace('_', ' ')}
                                            </span>
                                            {activity.chapter && (
                                                <span 
                                                    onClick={() => router.push(`/admin/regional-chapters/${activity.chapter?.id}`)} 
                                                    className="cursor-pointer hover:underline text-[8px] font-black bg-surface text-foreground border border-border px-2 py-0.5 rounded-full uppercase tracking-[0.2em]"
                                                >
                                                    {activity.chapter.name}
                                                </span>
                                            )}
                                        </div>
                                        <button className="text-tatt-gray hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground leading-tight group-hover:text-tatt-lime transition-colors">
                                        {activity.title}
                                    </h3>
                                    <p className="text-sm text-tatt-gray line-clamp-3 leading-relaxed">
                                        {activity.content}
                                    </p>
                                    
                                    {(activity.eventDate || activity.eventLocation) && (
                                        <div className="pt-4 space-y-2 border-t border-border">
                                            {activity.eventDate && (
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-tatt-gray uppercase tracking-widest">
                                                    <Calendar className="h-3.5 w-3.5 text-tatt-lime" />
                                                    {format(new Date(activity.eventDate), 'MMM d, yyyy · h:mm a')}
                                                    {activity.endDate && ` - ${format(new Date(activity.endDate), 'h:mm a')}`}
                                                </div>
                                            )}
                                            {activity.eventLocation && (
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-tatt-gray uppercase tracking-widest">
                                                    {activity.locationType === 'VIRTUAL' ? <Monitor size={14} className="text-tatt-lime" /> : <MapPin className="h-3.5 w-3.5 text-tatt-lime" />}
                                                    {activity.eventLocation}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-8 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="size-8 rounded-full bg-background border border-border flex items-center justify-center text-[10px] font-black">
                                            {activity.author?.profilePicture ? (
                                                <img src={activity.author.profilePicture} alt="" className="size-full rounded-full object-cover" />
                                            ) : (
                                                <span>{activity.author?.firstName?.[0] || 'A'}{activity.author?.lastName?.[0] || 'A'}</span>
                                            )}
                                        </div>
                                        <div className="text-[10px] leading-tight">
                                            <p className="font-black text-foreground uppercase tracking-wider">{activity.author?.firstName || 'Admin'}</p>
                                            <p className="text-tatt-gray font-bold">Author</p>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-bold text-tatt-gray italic">
                                        {format(new Date(activity.createdAt), 'MMM d')}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}


            
            {/* Create Activity Modal */}
            {isCreateActivityModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-tatt-black/80 backdrop-blur-md p-4 animate-in fade-in">
                    <div className="bg-surface rounded-[2.5rem] border border-border w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-border flex justify-between items-center bg-background/50">
                            <div>
                                <h3 className="text-2xl font-black italic text-foreground uppercase tracking-tight">Post {activeTab === 'announcements' ? 'Regional Announcement' : 'Chapter Activity'}</h3>
                                <p className="text-xs text-tatt-gray mt-1 font-bold uppercase tracking-widest">Broadcast selectively to assigned chapter regions.</p>
                            </div>
                            <button onClick={() => setIsCreateActivityModalOpen(false)} className="bg-background hover:bg-surface h-10 w-10 flex items-center justify-center rounded-2xl border border-border text-tatt-gray hover:text-foreground transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateActivity}>
                            <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                                <div className="space-y-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-tatt-gray uppercase tracking-[0.2em]">Target Chapter</label>
                                        <select
                                            required
                                            className="rounded-2xl border border-border focus:border-tatt-lime focus:ring-4 focus:ring-tatt-lime/5 bg-background h-14 px-6 text-sm font-bold outline-none appearance-none transition-all cursor-pointer"
                                            value={activityForm.chapterId}
                                            onChange={(e) => setActivityForm({ ...activityForm, chapterId: e.target.value })}
                                        >
                                            <option value="">Select Chapter...</option>
                                            {availableChapters.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-2 md:col-span-2">
                                            <label className="text-[10px] font-black text-tatt-gray uppercase tracking-[0.2em]">Headline</label>
                                            <input
                                                required
                                                type="text"
                                                className="rounded-2xl border border-border focus:border-tatt-lime focus:ring-4 focus:ring-tatt-lime/5 bg-background h-14 px-6 text-sm font-bold outline-none transition-all"
                                                placeholder="Activity or Event Title"
                                                value={activityForm.title}
                                                onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                                            />
                                        </div>
                                        
                                        <div className="flex flex-col gap-2 md:col-span-2">
                                            <label className="text-[10px] font-black text-tatt-gray uppercase tracking-[0.2em]">Detailed Narratives</label>
                                            <textarea
                                                required
                                                rows={4}
                                                className="rounded-2xl border border-border focus:border-tatt-lime focus:ring-4 focus:ring-tatt-lime/5 bg-background p-6 text-sm font-bold outline-none transition-all resize-none"
                                                placeholder="Detail the objectives and agenda..."
                                                value={activityForm.content}
                                                onChange={(e) => setActivityForm({ ...activityForm, content: e.target.value })}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-tatt-gray uppercase tracking-[0.2em]">Type</label>
                                            <select
                                                required
                                                className="rounded-2xl border border-border focus:border-tatt-lime focus:ring-4 focus:ring-tatt-lime/5 bg-background h-14 px-6 text-sm font-bold outline-none appearance-none transition-all cursor-pointer"
                                                value={activityForm.type}
                                                onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value as ActivityType })}
                                            >
                                                {activeTab === 'announcements' ? (
                                                    <option value="ANNOUNCEMENT">Announcement</option>
                                                ) : (
                                                    <>
                                                        <option value="EVENT">Live Event</option>
                                                        <option value="COMMUNITY_OUTREACH">Community Outreach</option>
                                                        <option value="PROFESSIONAL_DEVELOPMENT">Professional Development</option>
                                                        <option value="FUNDRAISING">Fundraising</option>
                                                        <option value="RESEARCH_POLICY">Research & Policy</option>
                                                        <option value="INTERNAL_WORKSHOP">Internal Workshop</option>
                                                    </>
                                                )}
                                            </select>
                                        </div>
                                        
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-tatt-gray uppercase tracking-[0.2em]">Activity Visibility</label>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setActivityForm({ ...activityForm, visibility: 'CHAPTER_WIDE' })}
                                                    className={`flex-1 h-14 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                                                        activityForm.visibility === 'CHAPTER_WIDE' 
                                                        ? 'bg-tatt-lime text-background-dark border-tatt-lime' 
                                                        : 'border-border text-tatt-gray'
                                                    }`}
                                                >
                                                    Chapter Wide
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setActivityForm({ ...activityForm, visibility: 'VOLUNTEERS_ONLY' })}
                                                    className={`flex-1 h-14 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                                                        activityForm.visibility === 'VOLUNTEERS_ONLY' 
                                                        ? 'bg-tatt-lime text-background-dark border-tatt-lime' 
                                                        : 'border-border text-tatt-gray'
                                                    }`}
                                                >
                                                    Volunteers Only
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {activeTab === 'activities' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black text-tatt-gray uppercase tracking-[0.2em]">Start Date & Time</label>
                                                <input
                                                    type="datetime-local"
                                                    className="rounded-2xl border border-border focus:border-tatt-lime focus:ring-4 focus:ring-tatt-lime/5 bg-background h-14 px-6 text-sm font-bold outline-none transition-all"
                                                    value={activityForm.eventDate}
                                                    onChange={(e) => setActivityForm({ ...activityForm, eventDate: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black text-tatt-gray uppercase tracking-[0.2em]">End Date & Time</label>
                                                <input
                                                    type="datetime-local"
                                                    className="rounded-2xl border border-border focus:border-tatt-lime focus:ring-4 focus:ring-tatt-lime/5 bg-background h-14 px-6 text-sm font-bold outline-none transition-all"
                                                    value={activityForm.endDate}
                                                    onChange={(e) => setActivityForm({ ...activityForm, endDate: e.target.value })}
                                                />
                                            </div>
                                            
                                            <div className="flex flex-col gap-2 md:col-span-2">
                                                <label className="text-[10px] font-black text-tatt-gray uppercase tracking-[0.2em]">Location</label>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => setActivityForm({ ...activityForm, locationType: 'PHYSICAL' })}
                                                        className={`h-14 rounded-2xl border flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                                                            activityForm.locationType === 'PHYSICAL' 
                                                            ? 'bg-tatt-lime/10 text-tatt-lime border-tatt-lime' 
                                                            : 'border-border text-tatt-gray'
                                                        }`}
                                                    >
                                                        <MapPin size={14} /> Physical
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setActivityForm({ ...activityForm, locationType: 'VIRTUAL' })}
                                                        className={`h-14 rounded-2xl border flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                                                            activityForm.locationType === 'VIRTUAL' 
                                                            ? 'bg-tatt-lime/10 text-tatt-lime border-tatt-lime' 
                                                            : 'border-border text-tatt-gray'
                                                        }`}
                                                    >
                                                        <Monitor size={14} /> Virtual
                                                    </button>
                                                </div>
                                                <input
                                                    type="text"
                                                    className="mt-2 rounded-2xl border border-border focus:border-tatt-lime focus:ring-4 focus:ring-tatt-lime/5 bg-background h-14 px-6 text-sm font-bold outline-none transition-all"
                                                    placeholder={activityForm.locationType === 'PHYSICAL' ? "Enter physical address" : "Enter virtual meeting link"}
                                                    value={activityForm.eventLocation}
                                                    onChange={(e) => setActivityForm({ ...activityForm, eventLocation: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-8 bg-background/50 border-t border-border flex items-center justify-end gap-4">
                                <button
                                    type="button"
                                    className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-tatt-gray hover:bg-surface transition-all"
                                    onClick={() => setIsCreateActivityModalOpen(false)}
                                >
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-tatt-lime text-background-dark px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-tatt-lime/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />}
                                    Create Post
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ────── Delete Chapter Confirmation Modal ────── */}
            {deleteModal.open && deleteModal.chapter && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-tatt-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-surface rounded-[2rem] border border-border w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-8 pb-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="size-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                                    <Trash2 className="h-6 w-6 text-red-500" />
                                </div>
                                <button
                                    onClick={() => setDeleteModal({ open: false, chapter: null, isDeleting: false })}
                                    className="size-9 bg-background hover:bg-border rounded-xl border border-border text-tatt-gray hover:text-foreground flex items-center justify-center transition-all shrink-0"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="mt-5">
                                <h3 className="text-xl font-black text-foreground tracking-tight">Delete Regional Chapter</h3>
                                <p className="text-xs text-tatt-gray font-bold uppercase tracking-widest mt-1">This action is permanent and irreversible</p>
                            </div>
                        </div>

                        {/* Chapter Info */}
                        <div className="mx-8 mb-6 bg-background rounded-2xl border border-border p-5 flex items-center gap-4">
                            <div className="size-11 rounded-xl bg-tatt-lime/10 border border-tatt-lime/20 flex items-center justify-center shrink-0">
                                <Globe className="h-5 w-5 text-tatt-lime" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-black text-foreground text-base truncate">{deleteModal.chapter.name}</p>
                                <p className="text-[10px] text-tatt-gray font-bold uppercase tracking-widest mt-0.5">
                                    {deleteModal.chapter.country} · Code {deleteModal.chapter.code} · {Number(deleteModal.chapter.memberCount) || 0} member(s)
                                </p>
                            </div>
                        </div>

                        {/* Warning Text */}
                        <div className="mx-8 mb-8 flex items-start gap-3 bg-red-500/5 border border-red-500/15 rounded-2xl p-4">
                            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-red-500/90 leading-relaxed font-medium">
                                Deleting this chapter will permanently remove all its configuration and leadership assignments. If the chapter has active members or volunteers, deletion will be blocked and you will be notified.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="px-8 pb-8 flex gap-3">
                            <button
                                onClick={() => setDeleteModal({ open: false, chapter: null, isDeleting: false })}
                                disabled={deleteModal.isDeleting}
                                className="flex-1 h-12 rounded-xl border border-border bg-background text-foreground font-bold text-sm hover:bg-surface transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteChapter}
                                disabled={deleteModal.isDeleting}
                                className="flex-1 h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-sm transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 active:scale-95"
                            >
                                {deleteModal.isDeleting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4" />
                                        <span>Delete Chapter</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
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
                                    {orgMembers.length === 0 && (
                                        <div className="mb-4 flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                                            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                            <p className="text-xs text-amber-600 leading-relaxed">
                                                No team members available to assign.{" "}
                                                <a href="/admin/org-management/add" className="font-bold underline hover:text-amber-700">
                                                    Add a team member first
                                                </a>{" "}
                                                before assigning leadership roles.
                                            </p>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-sm font-semibold text-tatt-gray">Regional Director</label>
                                            <select
                                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-tatt-lime outline-none text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                                                value={formData.regionalManagerId}
                                                onChange={(e) => setFormData({ ...formData, regionalManagerId: e.target.value })}
                                                disabled={orgMembers.length === 0}
                                            >
                                                <option value="">{orgMembers.length === 0 ? "No team members yet" : "Select Director..."}</option>
                                                {orgMembers.map(member => (
                                                    <option key={member.id} value={member.id}>{member.firstName} {member.lastName} ({member.email})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-sm font-semibold text-tatt-gray">Associate Regional Director</label>
                                            <select
                                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-tatt-lime outline-none text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                                                value={formData.associateRegionalDirectorId}
                                                onChange={(e) => setFormData({ ...formData, associateRegionalDirectorId: e.target.value })}
                                                disabled={orgMembers.length === 0}
                                            >
                                                <option value="">{orgMembers.length === 0 ? "No team members yet" : "Select Associate..."}</option>
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
