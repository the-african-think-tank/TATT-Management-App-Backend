"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [totalItems, setTotalItems] = useState(0);

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

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchVolunteers();
    }, [page, search]);

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

            {/* Table Section */}
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
                                    <tr key={agent.id} className="hover:bg-tatt-lime/[0.02] transition-colors group">
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
        </div>
    );
}
