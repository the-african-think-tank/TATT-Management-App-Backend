"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
    ChevronLeft,
    Plus,
    Activity,
    Users,
    MapPin,
    Calendar,
    Search,
    Loader2,
    CheckCircle2,
    X,
    ClipboardList,
    Megaphone,
    HeartHandshake,
    Filter,
    MoreVertical,
    Star,
    ArrowRight,
    Edit3,
    Trash2,
    Monitor,
    Info
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
    regionalManager?: User;
    associateRegionalDirector?: User;
    createdAt: string;
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
}

interface VolunteerApplication {
    id: string;
    userId: string;
    user: User;
    role?: { name: string };
    interestsAndSkills: string[];
    hoursAvailablePerWeek: number;
    reasonForApplying: string;
    status: string;
    createdAt: string;
}

export function AdminChapterDetailsPage() {
    const { chapterId } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [activities, setActivities] = useState<ChapterActivity[]>([]);
    const [volunteers, setVolunteers] = useState<{ active: User[], pending: VolunteerApplication[] }>({ active: [], pending: [] });
    
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab");
    
    const [activeTab, setActiveTab] = useState(tabParam === "volunteers" ? "volunteers" : "activities");
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateActivityOpen, setIsCreateActivityOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [orgMembers, setOrgMembers] = useState<User[]>([]);
    
    // Form State for new activity
    const [activityForm, setActivityForm] = useState({
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

    useEffect(() => {
        if (chapterId) {
            fetchData();
        }
    }, [chapterId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // First fetch core chapter details
            const chapRes = await api.get(`/chapters/${chapterId}`);
            setChapter(chapRes.data);
            
            // Then fetch activities, volunteers, and org-members in parallel
            const [actResult, volResult, orgResult] = await Promise.allSettled([
                api.get(`/chapters/${chapterId}/activities`),
                api.get(`/chapters/${chapterId}/volunteers`),
                api.get("/users/org-members")
            ]);
            
            if (actResult.status === 'fulfilled') {
                setActivities(actResult.value.data.data);
            }
            
            if (volResult.status === 'fulfilled') {
                setVolunteers(volResult.value.data);
            }

            if (orgResult.status === 'fulfilled') {
                setOrgMembers(orgResult.value.data);
            }
        } catch (error: any) {
            console.error("Failed to fetch chapter data:", error);
            toast.error("Failed to load chapter context");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateActivity = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...activityForm,
                targetVolunteers: Number(activityForm.targetVolunteers) || undefined
            };
            await api.post(`/chapters/${chapterId}/activities`, payload);
            setIsCreateActivityOpen(false);
            setActivityForm({
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
            toast.success("Activity posted successfully");
            // Refresh activities
            const actRes = await api.get(`/chapters/${chapterId}/activities`);
            setActivities(actRes.data.data);
        } catch (error) {
            console.error("Failed to post activity:", error);
            toast.error("Failed to post activity");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-10 w-10 text-tatt-lime animate-spin" />
                <p className="text-tatt-gray font-bold uppercase tracking-widest text-xs">Syncing Chapter Records...</p>
            </div>
        );
    }

    if (!chapter) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold">Chapter not found</h2>
                <button 
                    onClick={() => router.push('/admin/regional-chapters')}
                    className="mt-4 text-tatt-lime font-bold hover:underline"
                >
                    Back to Chapters
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10 px-4 sm:px-0">
            {/* Breadcrumbs / Back */}
            <button 
                onClick={() => router.push('/admin/regional-chapters')}
                className="flex items-center gap-2 text-tatt-gray hover:text-foreground transition-colors font-bold text-sm"
            >
                <ChevronLeft className="h-4 w-4" />
                Regional Chapters Directory
            </button>

            {/* Chapter Header Card */}
            <div className="bg-surface rounded-[2.5rem] border border-border p-8 shadow-sm overflow-hidden relative group">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                    <MapPin size={240} strokeWidth={1} />
                </div>
                
                <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="bg-tatt-lime/10 text-tatt-lime text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-tatt-lime/20">
                                Chapter ID: {chapter.code}
                            </span>
                            <span className="text-tatt-gray text-[10px] font-black uppercase tracking-widest">
                                Est. {format(new Date(chapter.createdAt), 'MMMM yyyy')}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-none italic uppercase">
                            {chapter.name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-2 text-sm font-bold text-tatt-gray">
                                <MapPin className="h-4 w-4 text-tatt-lime" />
                                {chapter.country}, {chapter.stateRegion}
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-tatt-gray">
                                <Users className="h-4 w-4 text-tatt-lime" />
                                {volunteers.active.length} Active Volunteers
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="flex -space-x-3">
                            {[chapter.regionalManager, chapter.associateRegionalDirector].filter(Boolean).map((leader: any, idx) => (
                                <div key={idx} className="size-12 rounded-full border-4 border-surface overflow-hidden shadow-lg bg-background flex items-center justify-center font-bold text-xs ring-4 ring-tatt-lime/5">
                                    {leader.profilePicture ? (
                                        <img src={leader.profilePicture} alt="" className="size-full object-cover" />
                                    ) : (
                                        <span className="opacity-50">{leader.firstName[0]}{leader.lastName[0]}</span>
                                    )}
                                </div>
                            ))}
                            <div className="size-12 rounded-full border-4 border-surface bg-tatt-lime flex items-center justify-center text-tatt-black font-black text-sm shadow-xl shadow-tatt-lime/20 ring-4 ring-tatt-lime/5 cursor-pointer hover:scale-110 transition-transform">
                                <Plus size={20} />
                            </div>
                        </div>
                        <div className="flex flex-col justify-center">
                            <p className="text-[10px] font-black text-tatt-gray uppercase tracking-widest">Leadership Team</p>
                            <p className="text-sm font-bold text-foreground">{chapter.regionalManager?.firstName || 'TBD'} & {chapter.associateRegionalDirector?.firstName || 'Team'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-border">
                <div className="flex gap-8">
                    {['activities', 'volunteers'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-sm font-black uppercase tracking-[0.2em] transition-all relative ${
                                activeTab === tab ? 'text-foreground' : 'text-tatt-gray hover:text-foreground'
                            }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-tatt-lime rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
                
                {activeTab === 'activities' && (
                    <button 
                        onClick={() => setIsCreateActivityOpen(true)}
                        className="mb-4 bg-tatt-lime hover:brightness-105 text-tatt-black font-black px-6 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-tatt-lime/20 transition-all text-[10px] uppercase tracking-widest"
                    >
                        <Plus size={16} /> Add Local Activity
                    </button>
                )}
            </div>

            {/* Content Area */}
            {activeTab === 'activities' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activities.length === 0 ? (
                        <div className="col-span-full py-20 bg-surface rounded-[2rem] border border-border border-dashed text-center">
                            <ClipboardList className="h-10 w-10 mx-auto text-tatt-gray/40 mb-4" />
                            <h3 className="font-bold text-lg">No activities recorded yet</h3>
                            <p className="text-sm text-tatt-gray max-w-xs mx-auto mt-2">Start documenting chapter initiatives, events and local hub announcements.</p>
                            <button 
                                onClick={() => setIsCreateActivityOpen(true)}
                                className="mt-6 text-tatt-lime font-bold text-sm hover:underline"
                            >
                                Post First Activity
                            </button>
                        </div>
                    ) : (
                        activities.map((activity) => (
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
                                            {activity.visibility === 'VOLUNTEERS_ONLY' && (
                                                <span className="text-[8px] font-black bg-tatt-bronze/10 text-tatt-bronze border border-tatt-bronze/20 px-2 py-0.5 rounded-full uppercase tracking-[0.2em]">
                                                    Volunteers
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
                                                    {format(new Date(activity.eventDate), 'MMM d, h:mm a')}
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

                                    {activity.volunteerManager && (
                                        <div className="p-3 bg-background rounded-2xl border border-border flex items-center gap-3">
                                            <div className="size-6 rounded-full bg-surface border border-border flex items-center justify-center text-[8px] font-black overflow-hidden">
                                                {activity.volunteerManager.profilePicture ? (
                                                    <img src={activity.volunteerManager.profilePicture} className="size-full object-cover" />
                                                ) : (
                                                    <span>{activity.volunteerManager.firstName[0]}{activity.volunteerManager.lastName[0]}</span>
                                                )}
                                            </div>
                                            <div className="text-[9px] font-bold uppercase tracking-widest">
                                                <p className="text-tatt-gray">Manager</p>
                                                <p className="text-foreground">{activity.volunteerManager.firstName} {activity.volunteerManager.lastName}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mt-8 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="size-8 rounded-full bg-background border border-border flex items-center justify-center text-[10px] font-black">
                                            {activity.author.profilePicture ? (
                                                <img src={activity.author.profilePicture} alt="" className="size-full rounded-full object-cover" />
                                            ) : (
                                                <span>{activity.author.firstName[0]}{activity.author.lastName[0]}</span>
                                            )}
                                        </div>
                                        <div className="text-[10px] leading-tight">
                                            <p className="font-black text-foreground uppercase tracking-wider">{activity.author.firstName}</p>
                                            <p className="text-tatt-gray font-bold">Post Author</p>
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
            ) : (
                <div className="space-y-12">
                    {/* Existing Volunteers Section */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-black italic flex items-center gap-3">
                            <HeartHandshake className="h-5 w-5 text-tatt-lime" />
                            Active Volunteers
                            <span className="text-tatt-gray text-[10px] font-black non-italic tracking-widest ml-2 uppercase">
                                {volunteers.active.length} Team Members
                            </span>
                        </h3>
                        
                        <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-background-light/50 border-b border-border">
                                        <th className="px-8 py-5 text-[10px] font-black text-tatt-gray uppercase tracking-[0.2em] w-1/3">Volunteer</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-tatt-gray uppercase tracking-[0.2em]">Department/Role</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-tatt-gray uppercase tracking-[0.2em]">Contact</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-tatt-gray uppercase tracking-[0.2em] text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {volunteers.active.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-12 text-center text-tatt-gray font-bold italic">No active volunteers found.</td>
                                        </tr>
                                    ) : (
                                        volunteers.active.map((vol: any) => (
                                            <tr key={vol.id} className="hover:bg-background/30 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-10 rounded-xl bg-background border border-border flex items-center justify-center overflow-hidden font-black text-[10px]">
                                                            {vol.profilePicture ? (
                                                                <img src={vol.profilePicture} alt="" className="size-full object-cover" />
                                                            ) : (
                                                                <span>{vol.firstName[0]}{vol.lastName[0]}</span>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-foreground uppercase tracking-tight">{vol.firstName} {vol.lastName}</span>
                                                            <span className="text-[10px] text-tatt-gray font-bold uppercase tracking-widest">Since {format(new Date(), 'MMM yyyy')}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="text-xs font-bold text-foreground">Community Moderator</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="text-xs font-bold text-tatt-gray">{vol.email}</span>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <button className="p-2 text-tatt-gray hover:text-tatt-lime hover:bg-tatt-lime/10 rounded-xl transition-all">
                                                        <Edit3 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Activity Modal */}
            {isCreateActivityOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-tatt-black/80 backdrop-blur-md p-4 animate-in fade-in">
                    <div className="bg-surface rounded-[2.5rem] border border-border w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-8 border-b border-border flex justify-between items-center bg-background/50">
                            <div>
                                <h3 className="text-2xl font-black italic text-foreground uppercase tracking-tight">Post Hub Activity</h3>
                                <p className="text-xs text-tatt-gray mt-1 font-bold uppercase tracking-widest">Broadcasting to the {chapter?.name} chapter feed at {chapter?.code}.</p>
                            </div>
                            <button onClick={() => setIsCreateActivityOpen(false)} className="bg-background hover:bg-surface h-10 w-10 flex items-center justify-center rounded-2xl border border-border text-tatt-gray hover:text-foreground transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateActivity}>
                            <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                                {/* Section: General Info */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-tatt-lime/10 flex items-center justify-center text-tatt-lime">
                                            <Info size={16} />
                                        </div>
                                        <h4 className="font-black text-xs uppercase tracking-[0.2em] text-foreground">General Information</h4>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-2 md:col-span-2">
                                            <label className="text-[10px] font-black text-tatt-gray uppercase tracking-[0.2em]">Activity Headline</label>
                                            <input
                                                required
                                                type="text"
                                                className="rounded-2xl border border-border focus:border-tatt-lime focus:ring-4 focus:ring-tatt-lime/5 bg-background h-14 px-6 text-sm font-bold outline-none transition-all"
                                                placeholder="e.g., Q3 Pan-African Leadership Summit"
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
                                                placeholder="Detail the objectives and agenda for this activity..."
                                                value={activityForm.content}
                                                onChange={(e) => setActivityForm({ ...activityForm, content: e.target.value })}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-tatt-gray uppercase tracking-[0.2em]">Activity Type</label>
                                            <select
                                                className="rounded-2xl border border-border focus:border-tatt-lime focus:ring-4 focus:ring-tatt-lime/5 bg-background h-14 px-6 text-sm font-bold outline-none appearance-none transition-all cursor-pointer"
                                                value={activityForm.type}
                                                onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value as ActivityType })}
                                            >
                                                <option value="ANNOUNCEMENT">Announcement</option>
                                                <option value="EVENT">Live Event</option>
                                                <option value="COMMUNITY_OUTREACH">Community Outreach</option>
                                                <option value="PROFESSIONAL_DEVELOPMENT">Professional Development</option>
                                                <option value="FUNDRAISING">Fundraising</option>
                                                <option value="RESEARCH_POLICY">Research & Policy</option>
                                                <option value="INTERNAL_WORKSHOP">Internal Workshop</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Logistics */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                                        <div className="size-8 rounded-full bg-tatt-lime/10 flex items-center justify-center text-tatt-lime">
                                            <Calendar size={16} />
                                        </div>
                                        <h4 className="font-black text-xs uppercase tracking-[0.2em] text-foreground">Logistics & Timing</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-tatt-gray uppercase tracking-[0.2em]">Target Volunteer Count</label>
                                            <input
                                                type="number"
                                                className="rounded-2xl border border-border focus:border-tatt-lime focus:ring-4 focus:ring-tatt-lime/5 bg-background h-14 px-6 text-sm font-bold outline-none transition-all"
                                                placeholder="e.g., 50"
                                                value={activityForm.targetVolunteers}
                                                onChange={(e) => setActivityForm({ ...activityForm, targetVolunteers: parseInt(e.target.value) || 0 })}
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
                                </div>

                            </div>

                            {/* Footer Actions */}
                            <div className="p-8 bg-background/50 border-t border-border flex items-center justify-end gap-4">
                                <button
                                    type="button"
                                    className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-tatt-gray hover:bg-surface transition-all"
                                    onClick={() => setIsCreateActivityOpen(false)}
                                >
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-tatt-lime text-background-dark px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-tatt-lime/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />}
                                    Create Activity
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
