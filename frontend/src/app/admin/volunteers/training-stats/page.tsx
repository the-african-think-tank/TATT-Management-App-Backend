"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
    GraduationCap, 
    ArrowLeft,
    Loader2,
    TrendingUp,
    FileText,
    Video,
    Users,
    ChevronRight,
    Search
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

interface TrainingStat {
    id: string;
    title: string;
    completions: number;
    mediaCount: number;
}

export default function TrainingStatsPage() {
    const [stats, setStats] = useState<TrainingStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchStats = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/volunteers/admin/training-stats`);
            setStats(data);
        } catch (error) {
            toast.error("Failed to load training analytics");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const filteredStats = stats.filter(s => s.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-1">
                    <Link href="/admin/volunteers" className="text-tatt-lime flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:underline mb-2">
                        <ArrowLeft size={14} /> Back to Center
                    </Link>
                    <h3 className="text-3xl font-black tracking-tight text-foreground italic uppercase">Curriculum Analytics Hub</h3>
                    <p className="text-tatt-gray font-medium">Measuring engagement and completion rates across all educational resources.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tatt-gray size-4" />
                         <input 
                            type="text" 
                            placeholder="Find module..."
                            className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-tatt-lime"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                         />
                    </div>
                </div>
            </div>

            {/* Top Level Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface border border-border rounded-3xl p-6 space-y-2">
                    <p className="text-[10px] font-black text-tatt-gray uppercase tracking-widest">Global Completion Avg</p>
                    <div className="flex items-end gap-3">
                        <h4 className="text-4xl font-black italic text-foreground tracking-tighter">74%</h4>
                        <span className="text-green-500 text-xs font-black flex items-center gap-1 mb-1">
                            +8% <TrendingUp size={12} />
                        </span>
                    </div>
                </div>
                 <div className="bg-surface border border-border rounded-3xl p-6 space-y-2">
                    <p className="text-[10px] font-black text-tatt-gray uppercase tracking-widest">Active Learners</p>
                    <h4 className="text-4xl font-black italic text-foreground tracking-tighter">142</h4>
                </div>
                <div className="bg-surface border border-border rounded-3xl p-6 space-y-2">
                    <p className="text-[10px] font-black text-tatt-gray uppercase tracking-widest">Total Modules</p>
                    <h4 className="text-4xl font-black italic text-foreground tracking-tighter">{stats.length}</h4>
                </div>
            </div>

            {/* List Section */}
            <div className="bg-surface border border-border rounded-[2.5rem] p-4">
                {loading ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-tatt-lime" size={40} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-tatt-gray">Calculating Module Metrics...</p>
                    </div>
                ) : filteredStats.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-tatt-gray font-bold italic uppercase tracking-widest">No curriculum modules found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredStats.map((module) => (
                            <div key={module.id} className="p-6 rounded-3xl bg-background border border-border hover:border-tatt-lime/40 transition-all flex flex-wrap items-center justify-between gap-6 group">
                                <div className="flex items-center gap-4">
                                    <div className="size-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                                        {module.mediaCount > 0 ? <Video size={24} /> : <FileText size={24} />}
                                    </div>
                                    <div>
                                        <h5 className="font-black text-lg text-foreground uppercase italic tracking-tighter group-hover:text-tatt-lime transition-colors">
                                            {module.title}
                                        </h5>
                                        <div className="flex gap-4 mt-1">
                                            <span className="text-[10px] font-bold text-tatt-gray uppercase tracking-widest flex items-center gap-1.5">
                                                <Users size={12} className="text-tatt-lime" />
                                                {module.completions} Successfull Completions
                                            </span>
                                            <span className="text-[10px] font-bold text-tatt-gray uppercase tracking-widest flex items-center gap-1.5">
                                                <FileText size={12} />
                                                {module.mediaCount} Assets Attached
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="hidden lg:block text-right">
                                        <p className="text-[9px] font-black text-tatt-gray uppercase tracking-[0.2em] mb-1">Engagement</p>
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className={`h-3 w-1.5 rounded-full ${i < 4 ? 'bg-tatt-lime' : 'bg-border'}`}></div>
                                            ))}
                                        </div>
                                    </div>
                                    <button className="size-12 rounded-2xl bg-surface border border-border flex items-center justify-center text-tatt-gray hover:text-tatt-lime hover:border-tatt-lime transition-all">
                                        <ChevronRight size={24} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
