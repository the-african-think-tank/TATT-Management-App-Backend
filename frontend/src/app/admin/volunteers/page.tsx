"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
    Users, 
    Clock, 
    GraduationCap, 
    Filter, 
    Download, 
    MoreVertical, 
    TrendingUp, 
    TrendingDown,
    PlusCircle,
    BookOpen,
    Search,
    ChevronLeft,
    ChevronRight,
    Star,
    Loader2
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

interface VolunteerStat {
    rating: number;
    status: string;
    impactPoints: number;
    totalHours: number;
    grade: string;
}

interface Volunteer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
    chapter?: {
        name: string;
    };
    volunteerStat?: VolunteerStat;
    applications?: Array<{
        role?: {
            name: string;
        }
    }>;
}

interface Stats {
    totalVolunteers: number;
    pendingApplications: number;
    onboardingVolunteers: number;
    trainingCompletionRate: number;
}

export default function VolunteerCenterPage() {
    const router = useRouter();
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [totalItems, setTotalItems] = useState(0);
    const [activeTab, setActiveTab] = useState<'registry' | 'activities'>('registry');
    const [chapters, setChapters] = useState<any[]>([]);
    const [selectedChapter, setSelectedChapter] = useState<string>("all");
    const [activities, setActivities] = useState<any[]>([]);
    const [activitiesLoading, setActivitiesLoading] = useState(false);

    const fetchStats = async () => {
        try {
            const { data } = await api.get("/volunteers/admin/stats");
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch stats", error);
        }
    };

    const fetchVolunteers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/volunteers/admin/list`, {
                params: {
                    page,
                    limit: 10,
                    search: search || undefined
                }
            });
            setVolunteers(data.data);
            setTotalPages(data.totalPages);
            setTotalItems(data.total);
        } catch (error) {
            toast.error("Failed to load volunteers");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchChapters = async () => {
        try {
            const { data } = await api.get("/chapters");
            setChapters(data);
        } catch (error) {
            console.error("Failed to fetch chapters", error);
        }
    };

    const fetchAllActivities = async () => {
        setActivitiesLoading(true);
        try {
            // Since we don't have a global search activities yet, we can fetch all chapters first 
            // but for now, if 'all' is selected, we might just fetch the first few or we need a backend endpoint.
            // I'll assume there's a global one or I'll implement it if needed, 
            // but I'll try to fetch for the selected chapter if not 'all'.
            // For now, I'll fetch for the selected chapter.
            if (selectedChapter !== "all") {
                const { data } = await api.get(`/chapters/${selectedChapter}/activities`);
                setActivities(data.data);
            } else {
                // Fetch from a new global endpoint if it exists, or just clear for now
                // Actually, I'll add a global one.
                const { data } = await api.get(`/chapters/all-activities`);
                setActivities(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch activities", error);
        } finally {
            setActivitiesLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchChapters();
    }, []);

    useEffect(() => {
        if (activeTab === 'registry') {
            fetchVolunteers();
        } else {
            fetchAllActivities();
        }
    }, [page, search, activeTab, selectedChapter]);

    const getStatusStyles = (status?: string) => {
        switch (status?.toUpperCase()) {
            case "ACTIVE":
                return "bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-500";
            case "TRAINING":
                return "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500";
            case "SUSPENDED":
                return "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500";
            default:
                return "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400";
        }
    };

    const renderStars = (rating: number = 5) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        
        return (
            <div className="flex text-tatt-lime">
                {[...Array(5)].map((_, i) => (
                    <Star 
                        key={i} 
                        size={14} 
                        className={i < fullStars ? "fill-current" : i === fullStars && hasHalfStar ? "" : "opacity-30"} 
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-1">
                    <h3 className="text-3xl font-black tracking-tight text-foreground italic uppercase">Management Overview</h3>
                    <p className="text-tatt-gray font-medium">Monitor community performance and application pipelines.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 rounded-xl bg-surface border border-border text-foreground font-bold text-xs uppercase tracking-widest hover:bg-background transition-all flex items-center gap-2 transform active:scale-95">
                        <PlusCircle size={18} className="text-tatt-lime" />
                        Create Role
                    </button>
                    <button className="px-5 py-2.5 rounded-xl bg-tatt-lime text-tatt-black font-black text-xs uppercase tracking-widest hover:brightness-105 transition-all flex items-center gap-2 shadow-lg shadow-tatt-lime/20">
                        <BookOpen size={18} />
                        New Training
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <Link href="/admin/volunteers/active" className="block p-8 rounded-[2rem] bg-surface border border-border shadow-sm space-y-4 group hover:border-tatt-lime/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <div className="flex justify-between items-start">
                        <div className="size-14 rounded-2xl bg-tatt-lime/10 flex items-center justify-center text-tatt-lime">
                            <Users size={28} />
                        </div>
                        <span className="text-green-500 text-xs font-black flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded-full">
                            +12% <TrendingUp size={12} />
                        </span>
                    </div>
                    <div>
                        <p className="text-tatt-gray text-[10px] font-black uppercase tracking-widest text-nowrap">Total Active Volunteers</p>
                        <h4 className="text-4xl font-black italic tracking-tighter text-foreground">{stats?.totalVolunteers.toLocaleString() || "0"}</h4>
                    </div>
                    <div className="w-full h-1 bg-background rounded-full overflow-hidden">
                        <div className="h-full bg-tatt-lime transition-all duration-1000" style={{ width: "80%" }}></div>
                    </div>
                </Link>

                <Link href="/admin/volunteers/applications" className="block p-8 rounded-[2rem] bg-surface border border-border shadow-sm space-y-4 group hover:border-amber-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <div className="flex justify-between items-start">
                        <div className="size-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <Clock size={28} />
                        </div>
                        <span className="text-green-500 text-xs font-black flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded-full">
                            +5% <TrendingUp size={12} />
                        </span>
                    </div>
                    <div>
                        <p className="text-tatt-gray text-[10px] font-black uppercase tracking-widest text-nowrap">Pending Applications</p>
                        <h4 className="text-4xl font-black italic tracking-tighter text-foreground">{stats?.pendingApplications || "0"}</h4>
                    </div>
                    <div className="w-full h-1 bg-background rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: "35%" }}></div>
                    </div>
                </Link>

                <Link href="/admin/volunteers/onboarding" className="block p-8 rounded-[2rem] bg-surface border border-border shadow-sm space-y-4 group hover:border-tatt-lime/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <div className="flex justify-between items-start">
                        <div className="size-14 rounded-2xl bg-tatt-lime/10 flex items-center justify-center text-tatt-lime">
                            <PlusCircle size={28} />
                        </div>
                        <span className="text-green-500 text-xs font-black flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded-full">
                            NEW
                        </span>
                    </div>
                    <div>
                        <p className="text-tatt-gray text-[10px] font-black uppercase tracking-widest text-nowrap">Ongoing Onboarding</p>
                        <h4 className="text-4xl font-black italic tracking-tighter text-foreground">{stats?.onboardingVolunteers || "0"}</h4>
                    </div>
                    <div className="w-full h-1 bg-background rounded-full overflow-hidden">
                        <div className="h-full bg-tatt-lime transition-all duration-1000" style={{ width: "20%" }}></div>
                    </div>
                </Link>

                <Link href="/admin/volunteers/training-stats" className="block p-8 rounded-[2rem] bg-surface border border-border shadow-sm space-y-4 group hover:border-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <div className="flex justify-between items-start">
                        <div className="size-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <GraduationCap size={28} />
                        </div>
                        <span className="text-red-500 text-xs font-black flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded-full">
                            -2% <TrendingDown size={12} />
                        </span>
                    </div>
                    <div>
                        <p className="text-tatt-gray text-[10px] font-black uppercase tracking-widest text-nowrap">Training Completion Rate</p>
                        <h4 className="text-4xl font-black italic tracking-tighter text-foreground">{stats?.trainingCompletionRate || "0"}%</h4>
                    </div>
                    <div className="w-full h-1 bg-background rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${stats?.trainingCompletionRate || 0}%` }}></div>
                    </div>
                </Link>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-border gap-8">
                <button 
                    onClick={() => setActiveTab('registry')}
                    className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${
                        activeTab === 'registry' ? 'text-tatt-lime' : 'text-tatt-gray hover:text-foreground'
                    }`}
                >
                    Agent Registry
                    {activeTab === 'registry' && <div className="absolute bottom-0 left-0 w-full h-1 bg-tatt-lime rounded-full shadow-[0_0_10px_rgba(159,204,0,0.5)]"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('activities')}
                    className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${
                        activeTab === 'activities' ? 'text-tatt-lime' : 'text-tatt-gray hover:text-foreground'
                    }`}
                >
                    Chapter Activities
                    {activeTab === 'activities' && <div className="absolute bottom-0 left-0 w-full h-1 bg-tatt-lime rounded-full shadow-[0_0_10px_rgba(159,204,0,0.5)]"></div>}
                </button>
            </div>

            {activeTab === 'registry' ? (
                /* Table Section */
                <div className="bg-surface border border-border rounded-[2.5rem] shadow-xl shadow-black/5 overflow-hidden">
                <div className="p-8 border-b border-border flex flex-wrap gap-6 items-center justify-between bg-surface/50 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <h5 className="text-xl font-black uppercase italic tracking-tighter">Active Agent Registry</h5>
                        <div className="px-3 py-1 rounded-full bg-tatt-lime/10 text-tatt-lime text-[10px] font-black border border-tatt-lime/20 tracking-widest">SECURE DATA</div>
                    </div>
                    <div className="flex flex-1 max-w-md relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-tatt-gray size-4 group-focus-within:text-tatt-lime transition-colors" />
                        <input 
                            type="text"
                            placeholder="Search agents by name or chapter..."
                            className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-3 text-xs font-bold focus:ring-2 focus:ring-tatt-lime outline-none transition-all placeholder:text-tatt-gray/40"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-3 rounded-xl border border-border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-background transition-all">
                            <Filter size={14} className="text-tatt-lime" />
                            Filters
                        </button>
                        <button className="px-4 py-3 rounded-xl border border-border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-background transition-all">
                            <Download size={14} className="text-tatt-lime" />
                            Export CSV
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-background/20 text-tatt-gray text-[10px] font-black uppercase tracking-[0.2em] border-b border-border">
                                <th className="px-8 py-6">Identity</th>
                                <th className="px-8 py-6">Chapter Nexus</th>
                                <th className="px-8 py-6">Designated Role</th>
                                <th className="px-8 py-6">Performance</th>
                                <th className="px-8 py-6">Deployment</th>
                                <th className="px-8 py-6 text-right">Registry</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="animate-spin text-tatt-lime" size={40} />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-tatt-gray animate-pulse">Syncing Registry Node...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : volunteers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <p className="text-tatt-gray font-bold italic uppercase tracking-widest">No agents found in this sector</p>
                                    </td>
                                </tr>
                            ) : (
                                volunteers.map((agent) => (
                                    <tr 
                                        key={agent.id} 
                                        onClick={() => router.push(`/admin/volunteers/${agent.id}`)}
                                        className="hover:bg-tatt-lime/[0.02] transition-colors group cursor-pointer"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="size-11 rounded-2xl bg-tatt-lime/10 text-tatt-lime flex items-center justify-center font-black text-xs border border-tatt-lime/20 shadow-inner">
                                                    {agent.firstName.charAt(0)}{agent.lastName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm text-foreground uppercase tracking-tight group-hover:text-tatt-lime transition-colors">
                                                        {agent.firstName} {agent.lastName}
                                                    </p>
                                                    <p className="text-[9px] text-tatt-gray font-bold uppercase tracking-widest italic flex items-center gap-1.5 mt-0.5">
                                                        Joined {new Date(agent.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[11px] font-black uppercase tracking-widest text-foreground bg-background px-3 py-1.5 rounded-lg border border-border">
                                                {agent.chapter?.name || "Global Deployment"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-[11px] font-bold text-tatt-gray uppercase tracking-widest">
                                                {agent.applications?.[0]?.role?.name || "General Member"}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-2">
                                                {renderStars(agent.volunteerStat?.rating)}
                                                <p className="text-[9px] font-black text-tatt-gray/60 uppercase tracking-widest">
                                                    {agent.volunteerStat?.impactPoints || 0} Impact Points
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${getStatusStyles(agent.volunteerStat?.status)}`}>
                                                {agent.volunteerStat?.status || "PENDING"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2 text-tatt-gray hover:text-tatt-lime hover:bg-tatt-lime/10 rounded-lg transition-all">
                                                <MoreVertical size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-8 border-t border-border flex items-center justify-between bg-surface/30">
                    <p className="text-[10px] font-black text-tatt-gray uppercase tracking-widest">
                        Node Exposure: {volunteers.length} of {totalItems} Agents
                    </p>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="size-10 rounded-xl border border-border flex items-center justify-center hover:bg-background transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                        >
                            <ChevronLeft size={18} className="text-tatt-gray group-hover:text-tatt-lime transition-colors" />
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button 
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={`size-10 rounded-xl font-black text-xs uppercase transition-all ${
                                    page === i + 1 
                                    ? "bg-tatt-lime text-tatt-black shadow-lg shadow-tatt-lime/20" 
                                    : "border border-border text-tatt-gray hover:border-tatt-lime shadow-sm"
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button 
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="size-10 rounded-xl border border-border flex items-center justify-center hover:bg-background transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                        >
                            <ChevronRight size={18} className="text-tatt-gray group-hover:text-tatt-lime transition-colors" />
                        </button>
                    </div>
                </div>
            </div>
            ) : (
                /* Chapter Activities Section */
                <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex items-center gap-3 bg-surface border border-border px-4 py-2 rounded-2xl shadow-sm">
                            <Filter size={16} className="text-tatt-lime" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-tatt-gray">Select Chapter Nexus:</span>
                            <select 
                                value={selectedChapter} 
                                onChange={(e) => setSelectedChapter(e.target.value)}
                                className="bg-transparent border-none text-xs font-black uppercase tracking-widest outline-none focus:ring-0 cursor-pointer text-foreground"
                            >
                                <option value="all">Global (All Chapters)</option>
                                {chapters.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                             <div className="size-3 rounded-full bg-tatt-lime shadow-[0_0_8px_rgba(159,204,0,0.6)] animate-pulse" />
                             <span className="text-[10px] font-black uppercase tracking-widest text-tatt-gray">{activities.length} Active Initiatives Discovered</span>
                        </div>
                    </div>

                    {activitiesLoading ? (
                        <div className="py-40 flex flex-col items-center justify-center gap-6">
                            <Loader2 className="animate-spin text-tatt-lime" size={48} strokeWidth={3} />
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-tatt-gray animate-pulse">Scanning Transmission Frequencies...</p>
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="py-32 bg-surface/50 border-2 border-dashed border-border rounded-[3rem] text-center flex flex-col items-center gap-4">
                            <div className="size-20 bg-background rounded-full flex items-center justify-center text-tatt-gray/20">
                                <Search size={40} />
                            </div>
                            <h4 className="text-xl font-black italic uppercase tracking-tighter">No Active Signals</h4>
                            <p className="max-w-xs mx-auto text-sm text-tatt-gray font-medium">No chapters have posted activities or initiatives in this sector yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activities.map((activity) => (
                                <div key={activity.id} className="group bg-surface border border-border rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-tatt-lime/5 hover:border-tatt-lime/30 transition-all duration-500 flex flex-col justify-between relative overflow-hidden">
                                     {/* Background Glow */}
                                     <div className="absolute -right-20 -top-20 size-40 bg-tatt-lime opacity-0 group-hover:opacity-10 blur-[50px] transition-opacity" />
                                     
                                     <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <span className="px-3 py-1 rounded-full bg-tatt-lime/10 text-tatt-lime text-[9px] font-black tracking-widest uppercase border border-tatt-lime/20">
                                                {activity.type}
                                            </span>
                                            <span className="text-[10px] font-bold text-tatt-gray flex items-center gap-1.5 bg-background px-2.5 py-1 rounded-lg">
                                                <Clock size={12} />
                                                {new Date(activity.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <h4 className="text-lg font-black italic tracking-tighter text-foreground group-hover:text-tatt-lime transition-colors mb-3">
                                            {activity.title}
                                        </h4>
                                        
                                        <p className="text-sm text-tatt-gray font-medium leading-relaxed line-clamp-3 mb-6">
                                            {activity.content}
                                        </p>

                                        <div className="flex flex-col gap-3 py-4 border-y border-border/50 mb-6">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-tatt-gray uppercase tracking-widest">Target Personnel</span>
                                                <span className="text-xs font-black text-foreground">{activity.targetVolunteers || 0} Volunteers Needed</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-tatt-gray uppercase tracking-widest">Regional Hub</span>
                                                <span className="text-xs font-black text-tatt-lime-dark">{activity.chapter?.name || "Global Deployment"}</span>
                                            </div>
                                            {activity.eventDate && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-tatt-gray uppercase tracking-widest">Event Deployment</span>
                                                    <span className="text-xs font-black text-foreground">{new Date(activity.eventDate).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                     </div>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex -space-x-2">
                                            {[...Array(3)].map((_, i) => (
                                                <div key={i} className="size-8 rounded-full border-2 border-surface bg-background flex items-center justify-center text-[10px] font-black text-tatt-gray">
                                                    {String.fromCharCode(65 + i)}
                                                </div>
                                            ))}
                                            <div className="size-8 rounded-full border-2 border-surface bg-tatt-lime/20 flex items-center justify-center text-[10px] font-black text-tatt-lime-dark">
                                                +12
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-tatt-black text-tatt-lime rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-tatt-lime hover:text-tatt-black transition-all shadow-lg active:scale-95">
                                            Monitor Initiative
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
