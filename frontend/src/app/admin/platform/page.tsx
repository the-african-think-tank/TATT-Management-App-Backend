"use client";

import React, { useState, useEffect } from "react";
import { 
    Send, 
    Megaphone, 
    Clock, 
    PlusCircle, 
    SquarePen, 
    Globe, 
    Building2, 
    Search, 
    MoreVertical, 
    ChevronLeft, 
    ChevronRight,
    Loader2,
    Settings,
    Trash2,
    Edit2,
    Hash,
    Filter
} from "lucide-react";
import api from "@/services/api";
import { toast } from "react-hot-toast";

interface Broadcast {
    id: string;
    title: string;
    message: string;
    audienceType: 'ALL' | 'ORG_MEMBERS' | 'TIER_SPECIFIC';
    targetTier?: string;
    status: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'CANCELLED';
    scheduledAt?: string;
    sentAt?: string;
    createdAt: string;
}

interface Interest {
    id: string;
    name: string;
}

const Tiers = ["FREE", "UBUNTU", "IMANI", "KIONGOZI"];

export default function PlatformManagement() {
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
    const [interests, setInterests] = useState<Interest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isScheduling, setIsScheduling] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form States
    const [title, setTitle] = useState("");
    const [audience, setAudience] = useState<'ALL' | 'ORG_MEMBERS' | 'TIER_SPECIFIC'>('ALL');
    const [targetTier, setTargetTier] = useState("UBUNTU");
    const [message, setMessage] = useState("");
    const [scheduledAt, setScheduledAt] = useState("");
    
    // Interests & Search States
    const [searchTerm, setSearchTerm] = useState("");
    const [interestSearch, setInterestSearch] = useState("");
    const [newInterest, setNewInterest] = useState("");
    const [editingInterest, setEditingInterest] = useState<Interest | null>(null);

    const filteredBroadcasts = broadcasts.filter(b => 
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        b.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredInterests = interests.filter(i => 
        i.name.toLowerCase().includes(interestSearch.toLowerCase())
    );

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bRes, iRes] = await Promise.all([
                api.get("/admin/broadcasts"),
                api.get("/interests")
            ]);
            setBroadcasts(bRes.data);
            setInterests(iRes.data);
        } catch (error) {
            toast.error("Failed to load platform data");
        } finally {
            setLoading(false);
        }
    };

    const handleBroadcastSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const payload = {
                title,
                audienceType: audience,
                targetTier: audience === 'TIER_SPECIFIC' ? targetTier : null,
                message,
                scheduledAt: isScheduling ? scheduledAt : null,
                status: isScheduling ? 'SCHEDULED' : 'SENT'
            };
            await api.post("/admin/broadcasts", payload);
            toast.success(isScheduling ? "Announcement Scheduled" : "Announcement Broadcasted");
            setTitle("");
            setMessage("");
            setScheduledAt("");
            setIsScheduling(false);
            fetchData();
        } catch (error) {
            toast.error("Failed to send broadcast");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateInterest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newInterest) return;
        try {
            if (editingInterest) {
                await api.patch(`/interests/${editingInterest.id}`, { name: newInterest });
                toast.success("Interest updated");
            } else {
                await api.post("/interests", { name: newInterest });
                toast.success("New interest added");
            }
            setNewInterest("");
            setEditingInterest(null);
            fetchData();
        } catch (error) {
            toast.error("Process failed");
        }
    };

    const deleteInterest = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/interests/${id}`);
            toast.success("Interest removed");
            fetchData();
        } catch (error) {
            toast.error("Deletion failed");
        }
    };

    const stats = {
        totalSent: broadcasts.filter(b => b.status === 'SENT').length,
        active: broadcasts.filter(b => b.status === 'SENT' && b.sentAt && (new Date().getTime() - new Date(b.sentAt).getTime() < 86400000)).length,
        pending: broadcasts.filter(b => b.status === 'SCHEDULED').length
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-1">
                    <h3 className="text-3xl font-black tracking-tight text-foreground italic uppercase">Platform Management</h3>
                    <p className="text-tatt-gray font-medium">Manage platform settings and communications</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-surface p-6 rounded-[2rem] border border-border shadow-sm flex flex-col justify-between">
                    <p className="text-[10px] tracking-widest uppercase font-black text-tatt-gray mb-4">Total Broadcasts Sent</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-4xl font-black text-foreground italic">{stats.totalSent}</h3>
                        <div className="size-12 rounded-2xl bg-tatt-lime/10 flex items-center justify-center text-tatt-lime">
                            <Send size={24} />
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-[2rem] border border-border shadow-sm flex flex-col justify-between">
                    <p className="text-[10px] tracking-widest uppercase font-black text-tatt-gray mb-4">Currently Live</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-4xl font-black text-foreground italic">{stats.active}</h3>
                        <div className="size-12 rounded-2xl bg-tatt-lime/10 flex items-center justify-center text-tatt-lime">
                            <Megaphone size={24} />
                        </div>
                    </div>
                </div>
                <div className="bg-surface p-6 rounded-[2rem] border border-border shadow-sm flex flex-col justify-between">
                    <p className="text-[10px] tracking-widest uppercase font-black text-tatt-gray mb-4">Pending Schedules</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-4xl font-black text-foreground italic">{stats.pending}</h3>
                        <div className="size-12 rounded-2xl bg-tatt-lime/10 flex items-center justify-center text-tatt-lime">
                            <Clock size={24} />
                        </div>
                    </div>
                </div>
                <div className="bg-tatt-black p-6 rounded-[2rem] flex flex-col justify-between shadow-xl shadow-tatt-lime/10">
                    <p className="text-[10px] tracking-widest uppercase font-black text-white/40">Platform Status</p>
                    <div className="flex items-center gap-3">
                        <div className="size-3 rounded-full bg-tatt-lime animate-pulse shadow-[0_0_10px_#9fcc00]" />
                        <span className="text-xs font-black uppercase tracking-widest text-white">Archives Online</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Notification Composer */}
                <div className="col-span-12 lg:col-span-12 xl:col-span-5 space-y-8">
                    <div className="bg-surface border border-border rounded-[2.5rem] shadow-xl shadow-black/5 overflow-hidden">
                        <div className="p-8 border-b border-border bg-surface/50">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-tatt-lime/10 flex items-center justify-center text-tatt-lime">
                                    <SquarePen size={24} />
                                </div>
                                <h5 className="text-xl font-black uppercase italic tracking-tighter">Create Announcements</h5>
                            </div>
                        </div>

                        <form onSubmit={handleBroadcastSubmit} className="p-8 space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-tatt-gray ml-2">Announcement Title</label>
                                <input 
                                    className="w-full h-14 bg-background border border-border rounded-2xl px-6 text-sm font-bold focus:ring-2 focus:ring-tatt-lime/20 outline-none transition-all"
                                    placeholder="e.g. Quarterly Town Hall Meeting"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-tatt-gray ml-2">Audience Targeting</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                                    {[
                                        { id: 'ALL', label: 'All Members', icon: Globe },
                                        { id: 'ORG_MEMBERS', label: 'Org Members', icon: Building2 }
                                    ].map((opt) => (
                                        <label 
                                            key={opt.id}
                                            className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all cursor-pointer ${
                                                audience === opt.id ? 'border-tatt-lime bg-tatt-lime/5' : 'border-border bg-background hover:border-tatt-lime/30'
                                            }`}
                                        >
                                            <input 
                                                type="radio" 
                                                className="hidden" 
                                                name="audience" 
                                                checked={audience === opt.id}
                                                onChange={() => setAudience(opt.id as any)}
                                            />
                                            <opt.icon size={20} className={audience === opt.id ? 'text-tatt-lime' : 'text-tatt-gray'} />
                                            <span className="text-xs font-black uppercase tracking-widest">{opt.label}</span>
                                        </label>
                                    ))}
                                </div>

                                <div className="p-6 bg-background rounded-[2rem] border border-border">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-[9px] font-black text-tatt-gray uppercase tracking-[0.2em]">Filter by Tier (Optional)</p>
                                        <div className="size-2 rounded-full bg-tatt-lime" />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {Tiers.map(tier => (
                                            <button 
                                                key={tier}
                                                type="button"
                                                onClick={() => {
                                                    setAudience('TIER_SPECIFIC');
                                                    setTargetTier(tier);
                                                }}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                    audience === 'TIER_SPECIFIC' && targetTier === tier 
                                                    ? 'bg-tatt-black text-tatt-lime shadow-lg' 
                                                    : 'border border-border text-tatt-gray hover:border-tatt-lime'
                                                }`}
                                            >
                                                {tier}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-tatt-gray ml-2">Message Content</label>
                                <textarea 
                                    className="w-full bg-background border border-border rounded-[2rem] p-6 text-sm font-bold min-h-[160px] focus:ring-2 focus:ring-tatt-lime/20 outline-none transition-all resize-none"
                                    placeholder="Compose your message here..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-6 pt-6 border-t border-border">
                                <div className="flex items-center gap-4 bg-background px-4 py-2 rounded-2xl border border-border w-full sm:w-auto">
                                    <input 
                                        type="checkbox" 
                                        checked={isScheduling}
                                        onChange={(e) => setIsScheduling(e.target.checked)}
                                        className="size-5 rounded-lg accent-tatt-lime cursor-pointer"
                                    />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-tatt-gray whitespace-nowrap">Schedule Logic</span>
                                </div>
                                
                                {isScheduling && (
                                    <input 
                                        type="datetime-local" 
                                        className="bg-background border border-border rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest flex-1 outline-none"
                                        value={scheduledAt}
                                        onChange={(e) => setScheduledAt(e.target.value)}
                                        required
                                    />
                                ) || <div className="flex-1" />}

                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full sm:w-auto bg-tatt-lime text-tatt-black px-8 h-14 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-tatt-lime/20 hover:scale-[1.02] transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (isScheduling ? <Clock size={18} /> : <Send size={18} />)}
                                    {isSubmitting ? 'Transmitting...' : (isScheduling ? 'Engage Timer' : 'Broadcast Now')}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Interest Taxonomy Governance */}
                    <div className="bg-surface border border-border rounded-[2.5rem] shadow-xl shadow-black/5 overflow-hidden">
                        <div className="p-8 border-b border-border bg-surface/50 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-tatt-lime/10 flex items-center justify-center text-tatt-lime">
                                    <Hash size={24} />
                                </div>
                                <h5 className="text-xl font-black uppercase italic tracking-tighter">Platform Community Interests</h5>
                            </div>
                        </div>
                        
                        <div className="p-8 space-y-6">
                            <form onSubmit={handleCreateInterest} className="flex gap-3">
                                <input 
                                    className="flex-1 h-12 bg-background border border-border rounded-xl px-4 text-xs font-bold outline-none border focus:border-tatt-lime transition-colors"
                                    placeholder="Add new community interest..."
                                    value={newInterest}
                                    onChange={(e) => setNewInterest(e.target.value)}
                                />
                                <button className="h-12 px-6 bg-tatt-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <PlusCircle size={16} className="text-tatt-lime" />
                                    {editingInterest ? 'Update' : 'Commit'}
                                </button>
                            </form>

                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tatt-gray/40 transition-colors group-focus-within:text-tatt-lime" size={16} />
                                <input 
                                    className="w-full h-12 bg-background border border-border rounded-xl pl-10 pr-4 text-xs font-bold outline-none focus:border-tatt-lime transition-colors"
                                    placeholder="Filter interests..."
                                    value={interestSearch}
                                    onChange={(e) => setInterestSearch(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {filteredInterests.map(interest => (
                                    <div key={interest.id} className="group bg-background border border-border px-3 py-2 rounded-xl flex items-center gap-3 hover:border-tatt-lime transition-all">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-tatt-gray">{interest.name}</span>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setEditingInterest(interest); setNewInterest(interest.name); }} className="text-tatt-gray hover:text-tatt-lime">
                                                <Edit2 size={12} />
                                            </button>
                                            <button onClick={() => deleteInterest(interest.id)} className="text-tatt-gray hover:text-red-500">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Communication Archive */}
                <div className="col-span-12 lg:col-span-12 xl:col-span-7">
                    <div className="bg-surface border border-border rounded-[2.5rem] shadow-xl shadow-black/5 overflow-hidden h-full flex flex-col">
                        <div className="p-8 border-b border-border flex flex-wrap gap-6 items-center justify-between bg-surface/50 backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-tatt-lime/10 flex items-center justify-center text-tatt-lime">
                                    <Megaphone size={24} />
                                </div>
                                <h5 className="text-xl font-black uppercase italic tracking-tighter">Active Communications</h5>
                            </div>
                            <div className="flex gap-4">
                                 <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-tatt-gray" size={16} />
                                    <input 
                                        className="bg-background border border-border rounded-xl px-10 h-10 text-[10px] uppercase font-black tracking-widest outline-none w-48 focus:border-tatt-lime transition-colors"
                                        placeholder="Scan Logs..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                 </div>
                                 <button className="size-10 rounded-xl border border-border flex items-center justify-center bg-background">
                                    <Filter size={16} className="text-tatt-gray" />
                                 </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-x-auto">
                             <table className="w-full text-left">
                                <thead className="bg-background/50 border-b border-border">
                                    <tr>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-tatt-gray">Subject & Context</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-tatt-gray">Sector</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-tatt-gray">Status</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-tatt-gray">Deployment</th>
                                        <th className="px-8 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredBroadcasts.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan={5} className="py-32 text-center">
                                                <div className="flex flex-col items-center gap-3 opacity-20">
                                                    <Loader2 size={48} className="animate-spin" />
                                                    <p className="text-xs font-black uppercase tracking-widest">Awaiting Transmissions...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {filteredBroadcasts.map(broadcast => (
                                        <tr key={broadcast.id} className="group hover:bg-background/30 transition-all duration-300">
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-black text-foreground mb-1 italic tracking-tighter">{broadcast.title}</p>
                                                <p className="text-[10px] text-tatt-gray font-bold line-clamp-1">{broadcast.message}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    {broadcast.audienceType === 'ALL' && <Globe size={14} className="text-tatt-lime" />}
                                                    {broadcast.audienceType === 'ORG_MEMBERS' && <Building2 size={14} className="text-tatt-lime" />}
                                                    {broadcast.audienceType === 'TIER_SPECIFIC' && <div className="size-3.5 rounded-full bg-tatt-black" />}
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{broadcast.targetTier || broadcast.audienceType}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                    broadcast.status === 'SENT' 
                                                    ? 'bg-tatt-lime/10 border-tatt-lime/20 text-tatt-lime' 
                                                    : broadcast.status === 'SCHEDULED' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' 
                                                    : 'bg-tatt-gray/10 border-tatt-gray/20 text-tatt-gray'
                                                }`}>
                                                    {broadcast.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-[10px] font-black text-tatt-gray uppercase tracking-widest">
                                                    {broadcast.sentAt || broadcast.scheduledAt ? new Date(broadcast.sentAt || broadcast.scheduledAt!).toLocaleDateString() : 'DRAFT'}
                                                </p>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="p-2 text-tatt-gray hover:text-tatt-lime hover:bg-tatt-lime/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                                    <MoreVertical size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                             </table>
                        </div>

                        <div className="p-8 border-t border-border flex items-center justify-between bg-surface/30">
                            <p className="text-[10px] font-black text-tatt-gray uppercase tracking-widest">Data Stream Volume: {filteredBroadcasts.length} Units</p>
                            <div className="flex items-center gap-2">
                                <button className="size-10 rounded-xl border border-border flex items-center justify-center hover:bg-background transition-all group">
                                    <ChevronLeft size={18} className="text-tatt-gray group-hover:text-tatt-lime" />
                                </button>
                                <button className="size-10 rounded-xl border border-border flex items-center justify-center hover:bg-background transition-all group">
                                    <ChevronRight size={18} className="text-tatt-gray group-hover:text-tatt-lime" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
