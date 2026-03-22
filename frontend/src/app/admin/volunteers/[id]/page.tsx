"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    ChevronLeft, Mail, Edit, PlusCircle, TrendingUp, Star, 
    Calendar, Phone, Globe, CheckCircle, MapPin, 
    ChevronRight, Loader2, Save, Send
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function VolunteerProfilePage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [savingNote, setSavingNote] = useState(false);
    
    // Data state
    const [profile, setProfile] = useState<any>(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [startingChat, setStartingChat] = useState(false);

    // Load Data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/volunteers/admin/profile/${id}`);
                setProfile(res.data);
                setAdminNotes(res.data.stats?.adminNotes || "");
            } catch (err: any) {
                toast.error("Failed to load volunteer profile");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    const handleSaveNote = async () => {
        setSavingNote(true);
        try {
            await api.patch(`/volunteers/admin/profile/${id}/stats`, {
                adminNotes
            });
            toast.success("Admin notes updated");
            setProfile({
                ...profile,
                stats: {
                    ...profile.stats,
                    adminNotes
                }
            });
        } catch (err) {
            toast.error("Failed to save notes");
        } finally {
            setSavingNote(false);
        }
    };

    const handleMessageVolunteer = async () => {
        if (!user?.id) return;
        setStartingChat(true);
        try {
            const res = await api.post(`/messages/admin/initiate/${user.id}`);
            router.push(`/admin/messages?connectionId=${res.data.connectionId}`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to start message");
            setStartingChat(false); // Only set false if failed, otherwise we are redirecting
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <Loader2 className="size-12 animate-spin text-tatt-lime" />
                <p className="text-tatt-gray font-black text-xs uppercase tracking-widest mt-4">Loading Profile...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <p className="text-tatt-gray font-black text-lg">Volunteer not found</p>
                <button onClick={() => router.push('/admin/volunteers')} className="mt-4 text-tatt-lime hover:underline font-bold">Go Back</button>
            </div>
        );
    }

    const { user, stats, applications, recentActivities, feedback } = profile;

    // Computed values
    const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const attendanceRate = stats?.attendanceRate != null ? Number(stats.attendanceRate) : 100;

    return (
        <div className="min-h-screen bg-background text-foreground animate-in fade-in duration-700">
            {/* Header */}
            <header className="mb-8 flex flex-col items-start gap-2">
                <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black mb-2">
                    <span className="text-tatt-gray/60 cursor-pointer hover:text-foreground transition-all" onClick={() => router.push('/admin/volunteers')}>Volunteer Center</span>
                    <ChevronRight size={14} className="text-tatt-gray/40" />
                    <span className="text-tatt-lime">Volunteer Details</span>
                </nav>
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-tatt-gray hover:text-tatt-lime transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <h2 className="text-3xl font-black tracking-tight text-foreground">Volunteer Profile</h2>
                </div>
            </header>

            <div className="max-w-6xl mx-auto w-full space-y-8">
                {/* Profile Section */}
                <div className="flex flex-col md:flex-row gap-8 items-start justify-between bg-surface p-8 rounded-2xl border border-border shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                        <div className="relative">
                            <div className="size-32 rounded-full overflow-hidden border-4 border-tatt-lime/20 bg-background">
                                {user.profileImage ? (
                                    <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-tatt-lime bg-tatt-lime/10">
                                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            {stats?.status === 'ACTIVE' && (
                                <span className="absolute bottom-2 right-2 size-4 bg-green-500 rounded-full border-2 border-surface"></span>
                            )}
                        </div>
                        <div className="space-y-2 mt-2">
                            <h3 className="text-3xl font-black tracking-tight">{user.firstName} {user.lastName}</h3>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                                {user.chapterId && (
                                    <span className="flex items-center gap-1 text-tatt-gray text-sm font-bold">
                                        <MapPin size={16} />
                                        Chapter ID: {user.chapterId}
                                    </span>
                                )}
                                <span className="bg-tatt-lime/20 text-tatt-lime-dark px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {stats?.grade || 'Member'}
                                </span>
                            </div>
                            <p className="text-tatt-gray text-sm font-bold">Active member since {memberSince} • {stats?.eventsCompleted || 0} events completed</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:flex gap-3 w-full md:w-auto">
                        <button 
                            onClick={handleMessageVolunteer}
                            disabled={startingChat}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-background hover:bg-surface border border-border rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm disabled:opacity-50"
                        >
                            {startingChat ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            Message
                        </button>
                        <button className="flex items-center justify-center gap-2 px-4 py-3 bg-background hover:bg-surface border border-border rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm">
                            <Edit size={16} />
                            Edit Role
                        </button>
                        <button className="col-span-2 flex items-center justify-center gap-2 px-6 py-3 bg-tatt-lime text-tatt-black hover:bg-tatt-lime-vibrant rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md hover:shadow-tatt-lime/20 hover:scale-[1.02] active:scale-[0.98]">
                            <PlusCircle size={16} />
                            Assign Activity
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm group hover:border-border/80 transition-all">
                        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-tatt-gray">Total Hours</p>
                        <p className="text-3xl font-black mt-2 text-foreground">{stats?.totalHours || 0} <span className="text-sm text-tatt-gray">hrs</span></p>
                        <p className="text-[10px] font-bold text-green-600 mt-3 flex items-center gap-1 uppercase tracking-widest">
                            <TrendingUp size={14} /> +0% from last month
                        </p>
                    </div>
                    <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm group hover:border-border/80 transition-all">
                        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-tatt-gray">Attendance Rate</p>
                        <p className="text-3xl font-black mt-2 text-foreground">{attendanceRate}%</p>
                        <div className="w-full bg-background rounded-full h-1.5 mt-4 overflow-hidden">
                            <div className="bg-tatt-lime h-full rounded-full transition-all duration-1000" style={{ width: `${attendanceRate}%` }}></div>
                        </div>
                    </div>
                    <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm group hover:border-border/80 transition-all">
                        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-tatt-gray">Chapter Rank</p>
                        <p className="text-3xl font-black mt-2 text-foreground">
                            {stats?.chapterRank ? `#${stats.chapterRank}` : '-'} <span className="text-sm text-tatt-gray">of {stats?.chapterTotal || '-'}</span>
                        </p>
                        <p className="text-[10px] text-tatt-lime-dark font-black mt-3 uppercase tracking-widest">
                            {stats?.impactPoints || 0} Impact Points
                        </p>
                    </div>
                    <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm group hover:border-border/80 transition-all">
                        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-tatt-gray">Avg Rating</p>
                        <p className="text-3xl font-black mt-2 text-foreground flex items-center gap-2">
                            {stats?.rating ? Number(stats.rating).toFixed(1) : '0.0'}
                            <Star size={24} className="text-tatt-yellow fill-tatt-yellow" />
                        </p>
                        <p className="text-[10px] font-bold text-tatt-gray mt-3 uppercase tracking-widest">Based on {stats?.ratingCount || 0} reviews</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Experience */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Roles History */}
                        <section className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                            <div className="px-8 py-5 border-b border-border flex justify-between items-center bg-background/50">
                                <h4 className="text-xs uppercase tracking-[0.2em] font-black text-tatt-gray">Roles & Activity</h4>
                                <button className="text-tatt-lime-dark text-[10px] font-black uppercase tracking-widest hover:underline">View All</button>
                            </div>
                            <div className="p-8 space-y-6">
                                {recentActivities && recentActivities.length > 0 ? recentActivities.map((activity: any, idx: number) => (
                                    <div key={idx} className="flex gap-4 group">
                                        <div className="size-12 rounded-xl bg-background border border-border flex items-center justify-center shrink-0 group-hover:bg-tatt-lime/10 group-hover:border-tatt-lime/30 transition-all text-tatt-gray group-hover:text-tatt-lime">
                                            <Calendar size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <p className="font-black text-foreground">{activity.title}</p>
                                                <span className="text-[10px] font-bold text-tatt-gray uppercase tracking-widest bg-background px-2 py-1 rounded-md">
                                                    {new Date(activity.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-tatt-gray mt-2">{activity.description}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm font-bold text-tatt-gray text-center italic">No recent activities on record.</p>
                                )}
                            </div>
                        </section>

                        {/* Ratings & Feedback */}
                        <section className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                            <div className="px-8 py-5 border-b border-border flex justify-between items-center bg-background/50">
                                <h4 className="text-xs uppercase tracking-[0.2em] font-black text-tatt-gray">Ratings & Feedback</h4>
                                <button className="bg-tatt-lime/10 text-tatt-lime-dark border border-tatt-lime/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-tatt-lime/20 transition-colors">Add Review</button>
                            </div>
                            <div className="divide-y divide-border">
                                {feedback && feedback.length > 0 ? feedback.map((review: any, idx: number) => (
                                    <div key={idx} className="p-8 space-y-4 hover:bg-background/30 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full overflow-hidden bg-background border border-border">
                                                    {review.reviewer?.profileImage ? (
                                                        <img src={review.reviewer.profileImage} alt="Manager" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-tatt-gray font-bold text-xs">
                                                            {review.reviewer?.firstName?.charAt(0)}{review.reviewer?.lastName?.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-foreground">{review.reviewer?.firstName} {review.reviewer?.lastName}</p>
                                                    <p className="text-[9px] text-tatt-gray uppercase font-black tracking-[0.1em]">Reviewer</p>
                                                </div>
                                            </div>
                                            <div className="flex text-tatt-yellow gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={14} className={i < review.rating ? "fill-tatt-yellow" : "text-tatt-gray/30"} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-sm font-medium text-foreground italic leading-relaxed">"{review.comment}"</p>
                                        <p className="text-[10px] font-bold text-tatt-gray uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()} {review.eventLabel ? `• ${review.eventLabel}` : ''}</p>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center text-sm font-bold text-tatt-gray italic">No feedback entries found.</div>
                                )}
                            </div>
                            {feedback && feedback.length > 0 && (
                                <div className="p-4 bg-background border-t border-border text-center">
                                    <button className="text-[10px] font-black uppercase tracking-widest text-tatt-gray hover:text-tatt-lime transition-colors">Load More Reviews</button>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Column: Sidebar Info */}
                    <div className="space-y-8">
                        {/* Contact Info */}
                        <section className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
                            <div className="px-8 py-5 border-b border-border bg-background/50">
                                <h4 className="text-xs uppercase tracking-[0.2em] font-black text-tatt-gray">Contact Information</h4>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-sm font-bold text-foreground">
                                        <div className="size-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                                            <Mail size={14} className="text-tatt-gray" />
                                        </div>
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm font-bold text-foreground">
                                        <div className="size-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                                            <Phone size={14} className="text-tatt-gray" />
                                        </div>
                                        <span>{stats?.phone || 'Not provided'}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm font-bold text-foreground">
                                        <div className="size-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                                            <Globe size={14} className="text-tatt-gray" />
                                        </div>
                                        <span>{stats?.languages || 'English'}</span>
                                    </div>
                                </div>
                                <hr className="border-border" />
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-tatt-gray uppercase tracking-widest">Emergency Contact</p>
                                    <div>
                                        <p className="text-sm font-black text-foreground">{stats?.emergencyContactName || 'Not designated'}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-tatt-gray mt-1">
                                            {stats?.emergencyContactRelation ? `${stats.emergencyContactRelation}` : ''} {stats?.emergencyContactPhone ? `• ${stats.emergencyContactPhone}` : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Certifications */}
                        <section className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
                            <div className="px-8 py-5 border-b border-border bg-background/50">
                                <h4 className="text-xs uppercase tracking-[0.2em] font-black text-tatt-gray">Certifications</h4>
                            </div>
                            <div className="p-8 space-y-4">
                                {stats?.certifications && stats.certifications.length > 0 ? stats.certifications.map((cert: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <CheckCircle size={18} className={cert.status === 'VERIFIED' ? "text-green-500" : "text-tatt-gray/40"} />
                                        <div>
                                            <p className="text-sm font-bold text-foreground">{cert.name}</p>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-tatt-gray">{cert.status}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm font-bold text-tatt-gray italic">No certifications listed.</p>
                                )}
                            </div>
                        </section>

                        {/* Admin Notes */}
                        <section className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
                            <div className="px-8 py-5 border-b border-border bg-background/50">
                                <h4 className="text-xs uppercase tracking-[0.2em] font-black text-tatt-gray">Admin Internal Notes</h4>
                            </div>
                            <div className="p-8 space-y-4">
                                <textarea 
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl p-4 text-sm font-bold text-foreground focus:ring-2 focus:ring-tatt-lime outline-none transition-all placeholder:text-tatt-gray/40 min-h-[120px] custom-scrollbar" 
                                    placeholder="Add a private note about this volunteer..."
                                />
                                <button 
                                    onClick={handleSaveNote}
                                    disabled={savingNote || adminNotes === (profile.stats?.adminNotes || "")}
                                    className="w-full py-3 bg-tatt-lime hover:bg-tatt-lime-vibrant text-tatt-black rounded-xl text-xs font-black uppercase tracking-[0.1em] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {savingNote ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Save Note
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
