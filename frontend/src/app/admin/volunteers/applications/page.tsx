"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
    Clock, 
    ArrowLeft,
    Search,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Briefcase,
    Calendar,
    MessageCircle,
    CheckCircle2,
    XCircle,
    MoreHorizontal,
    X,
    Info,
    CalendarDays
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

interface Application {
    id: string;
    userId: string;
    reasonForApplying: string;
    interestsAndSkills: string[];
    hoursAvailablePerWeek: number;
    weeklyAvailability: any;
    questionsForAdmin?: string;
    adminNotes?: string;
    status: string;
    createdAt: string;
    user: {
        firstName: string;
        lastName: string;
        email: string;
        professionTitle?: string;
        industry?: string;
    };
    role?: {
        name: string;
    };
}

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [totalItems, setTotalItems] = useState(0);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/volunteers/admin/applications`, {
                params: {
                    page,
                    limit: 10,
                    search: search || undefined,
                    status: 'PENDING'
                }
            });
            setApplications(data.data);
            setTotalPages(data.totalPages);
            setTotalItems(data.total);
        } catch (error) {
            toast.error("Failed to load applications");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, [page, search]);

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        const loadingToast = toast.loading(`${action === 'approve' ? 'Approving' : 'Rejecting'} application...`);
        try {
            const status = action === 'approve' ? 'APPROVED' : 'REJECTED';
            await api.patch(`/volunteers/applications/${id}/status`, { status });
            toast.success(`Application ${action}d successfully`, { id: loadingToast });
            fetchApplications();
        } catch (error: any) {
            toast.error(error.response?.data?.message || `Failed to ${action} application`, { id: loadingToast });
            console.error(error);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-1">
                    <Link href="/admin/volunteers" className="text-tatt-lime flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:underline mb-2">
                        <ArrowLeft size={14} /> Back to Center
                    </Link>
                    <h3 className="text-3xl font-black tracking-tight text-foreground italic uppercase">Pending Recruitment Pipeline</h3>
                    <p className="text-tatt-gray font-medium">Review and process new candidate applications for the community force.</p>
                </div>
            </div>

            {/* Application Cards / Grid */}
            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="py-20 flex flex-col items-center gap-4 bg-surface rounded-[2.5rem] border border-border">
                        <Loader2 className="animate-spin text-tatt-lime" size={48} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-tatt-gray">Scanning Application Nodes...</p>
                    </div>
                ) : applications.length === 0 ? (
                    <div className="py-20 text-center bg-surface rounded-[2.5rem] border border-border">
                        <p className="text-tatt-gray font-bold italic uppercase tracking-widest">Pipeline Clear: No Pending Applications</p>
                    </div>
                ) : (
                    applications.map((app) => (
                        <div key={app.id} className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-xl shadow-black/5 hover:border-tatt-lime/30 transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8">
                                <span className="bg-amber-500/10 text-amber-500 text-[10px] font-black px-4 py-1.5 rounded-full border border-amber-500/20 uppercase tracking-[0.2em]">
                                    Awaiting Review
                                </span>
                            </div>

                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* Profiling */}
                                <div className="lg:w-1/3 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="size-16 rounded-2xl bg-tatt-lime/10 text-tatt-lime flex items-center justify-center font-black text-xl border border-tatt-lime/20 shadow-inner">
                                            {app.user.firstName.charAt(0)}{app.user.lastName.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-2xl text-foreground italic uppercase tracking-tight leading-none group-hover:text-tatt-lime transition-colors">
                                                {app.user.firstName} {app.user.lastName}
                                            </h4>
                                            <div className="flex flex-col gap-1 mt-2">
                                                <p className="text-xs font-bold text-tatt-gray uppercase tracking-widest">
                                                    {app.user.email}
                                                </p>
                                                {app.user.professionTitle && (
                                                    <p className="text-[10px] font-black text-tatt-lime uppercase tracking-widest flex items-center gap-1.5">
                                                        <Briefcase size={12} />
                                                        {app.user.professionTitle} {app.user.industry && `• ${app.user.industry}`}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-border/50">
                                        <div className="flex items-center gap-3 text-foreground">
                                            <Briefcase size={18} className="text-tatt-lime" />
                                            <span className="text-sm font-black uppercase tracking-tight">
                                                Target Role: <span className="text-tatt-lime font-black italic">{app.role?.name || "General Deployment"}</span>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-tatt-gray">
                                            <Clock size={18} />
                                            <span className="text-xs font-bold uppercase tracking-widest">
                                                {app.hoursAvailablePerWeek} Hours / Week Commitment
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-tatt-gray">
                                            <Calendar size={18} />
                                            <span className="text-xs font-bold uppercase tracking-widest">
                                                Applied {new Date(app.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-4">
                                        {app.interestsAndSkills.map((skill, i) => (
                                            <span key={i} className="px-3 py-1 bg-background border border-border rounded-lg text-[9px] font-black uppercase tracking-widest text-tatt-gray">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Deep Dive & Actions */}
                                <div className="lg:w-2/3 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-tatt-gray mb-2">
                                            <MessageCircle size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Candidate Rationale</span>
                                        </div>
                                        <div className="bg-background/50 border border-border p-6 rounded-3xl italic text-tatt-gray font-medium text-sm leading-relaxed border-l-4 border-l-tatt-lime">
                                            "{app.reasonForApplying}"
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-end gap-4 mt-8 pt-6 border-t border-border/50">
                                        <button 
                                            onClick={() => setSelectedApp(app)}
                                            className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-border border-dashed text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-background transition-all"
                                        >
                                            <MoreHorizontal size={18} />
                                            View Details
                                        </button>
                                        <button 
                                            onClick={() => handleAction(app.id, 'reject')}
                                            className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"
                                        >
                                            <XCircle size={18} />
                                            Reject Candidate
                                        </button>
                                        <button 
                                            onClick={() => handleAction(app.id, 'approve')}
                                            className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-tatt-lime text-tatt-black text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-105 transition-all shadow-xl shadow-tatt-lime/20"
                                        >
                                            <CheckCircle2 size={18} />
                                            Approve Agent
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination for apps */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-4">
                    <button 
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="p-3 bg-surface border border-border rounded-xl text-tatt-gray disabled:opacity-30"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-xs font-black uppercase tracking-widest">
                        Node Sector {page} of {totalPages}
                    </span>
                    <button 
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                        className="p-3 bg-surface border border-border rounded-xl text-tatt-gray disabled:opacity-30"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}

            {/* Application Detail Modal */}
            {selectedApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div 
                        className="absolute inset-0"
                        onClick={() => setSelectedApp(null)}
                    ></div>
                    <div className="relative w-full max-w-4xl bg-surface border border-border rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-border bg-background/50 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="size-14 rounded-2xl bg-tatt-lime/10 text-tatt-lime flex items-center justify-center font-black text-xl border border-tatt-lime/20">
                                    {selectedApp.user.firstName.charAt(0)}{selectedApp.user.lastName.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">Application ID: {selectedApp.id.slice(0, 8)}...</h2>
                                    <p className="text-[10px] font-black text-tatt-gray uppercase tracking-widest">Full Candidate Dossier Review</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedApp(null)}
                                className="size-10 rounded-full bg-background border border-border flex items-center justify-center text-tatt-gray hover:text-red-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <section>
                                        <h4 className="text-xs font-black uppercase tracking-widest text-tatt-lime mb-4 flex items-center gap-2">
                                            <Info size={14} /> Personal Identity
                                        </h4>
                                        <div className="space-y-3">
                                            <p className="text-sm font-bold text-foreground">Name: <span className="font-medium text-tatt-gray">{selectedApp.user.firstName} {selectedApp.user.lastName}</span></p>
                                            <p className="text-sm font-bold text-foreground">Email: <span className="font-medium text-tatt-gray">{selectedApp.user.email}</span></p>
                                            <p className="text-sm font-bold text-foreground">Profession: <span className="font-medium text-tatt-gray">{selectedApp.user.professionTitle || "Not Specified"}</span></p>
                                            <p className="text-sm font-bold text-foreground">Sector: <span className="font-medium text-tatt-gray">{selectedApp.user.industry || "General"}</span></p>
                                        </div>
                                    </section>

                                    <section>
                                        <h4 className="text-xs font-black uppercase tracking-widest text-tatt-lime mb-4 flex items-center gap-2">
                                            <CalendarDays size={14} /> Operational Availability
                                        </h4>
                                        <div className="bg-background/30 rounded-2xl border border-border p-4">
                                            {selectedApp.weeklyAvailability && typeof selectedApp.weeklyAvailability === 'object' ? (
                                                <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase tracking-widest">
                                                    {Object.entries(selectedApp.weeklyAvailability).map(([day, slots]) => (
                                                        <div key={day} className="flex justify-between items-center p-2 border-b border-border last:border-0">
                                                            <span className="text-tatt-lime">{day}</span>
                                                            <span className="text-tatt-gray">{Array.isArray(slots) ? slots.join(', ') : String(slots)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-tatt-gray font-medium">No specific availability slots provided.</p>
                                            )}
                                        </div>
                                    </section>
                                </div>

                                <div className="space-y-6">
                                    <section>
                                        <h4 className="text-xs font-black uppercase tracking-widest text-tatt-lime mb-4 flex items-center gap-2">
                                            <Briefcase size={14} /> Interests & Expertise
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedApp.interestsAndSkills.map((interest, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-tatt-lime/10 border border-tatt-lime/20 rounded-lg text-[10px] font-black uppercase tracking-widest text-tatt-lime">
                                                    {interest}
                                                </span>
                                            ))}
                                        </div>
                                    </section>

                                    <section>
                                        <h4 className="text-xs font-black uppercase tracking-widest text-tatt-lime mb-4 flex items-center gap-2">
                                            <MessageCircle size={14} /> Remarks & Queries
                                        </h4>
                                        <div className="space-y-4">
                                            <div className="p-4 bg-background/50 rounded-2xl border border-l-4 border-l-tatt-lime italic">
                                                <p className="text-[10px] font-black text-tatt-gray uppercase tracking-widest mb-2 opacity-50">Rationale</p>
                                                <p className="text-sm font-medium text-foreground">"{selectedApp.reasonForApplying}"</p>
                                            </div>
                                            {selectedApp.questionsForAdmin && (
                                                <div className="p-4 bg-amber-500/5 rounded-2xl border border-l-4 border-l-amber-500">
                                                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2 opacity-50">Candidate Question</p>
                                                    <p className="text-sm font-medium text-foreground">"{selectedApp.questionsForAdmin}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 bg-background/50 border-t border-border flex justify-end gap-4">
                            <button 
                                onClick={() => {
                                    handleAction(selectedApp.id, 'reject');
                                    setSelectedApp(null);
                                }}
                                className="px-8 py-3 rounded-2xl border border-red-500/30 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/10 transition-all"
                            >
                                Reject Application
                            </button>
                            <button 
                                onClick={() => {
                                    handleAction(selectedApp.id, 'approve');
                                    setSelectedApp(null);
                                }}
                                className="px-8 py-3 rounded-2xl bg-tatt-lime text-tatt-black font-black text-[10px] uppercase tracking-widest hover:brightness-105 transition-all shadow-xl shadow-tatt-lime/20"
                            >
                                Approve Enrollment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
