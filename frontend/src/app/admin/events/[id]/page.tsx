"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    Calendar, 
    MapPin, 
    Users, 
    DollarSign, 
    ChevronLeft, 
    Building2, 
    Globe, 
    ShieldCheck, 
    TrendingUp, 
    ArrowLeft,
    Clock,
    MoreVertical,
    FileText,
    CreditCard,
    Briefcase
} from "lucide-react";
import Image from "next/image";
import api from "@/services/api";
import { toast, Toaster } from "react-hot-toast";
import { format } from "date-fns";

export default function EventDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [event, setEvent] = useState<any>(null);
    const [attendees, setAttendees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const [eventRes, attendeesRes] = await Promise.all([
                    api.get(`/events/${id}`),
                    api.get(`/events/${id}/attendees`)
                ]);
                setEvent(eventRes.data);
                setAttendees(attendeesRes.data || []);
            } catch (err) {
                toast.error("Failed to load event details");
                router.push("/admin/events");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDetails();
    }, [id, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 border-4 border-tatt-lime/20 border-t-tatt-lime rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-tatt-gray">Fetching Secure Event Logs...</p>
                </div>
            </div>
        );
    }

    if (!event) return null;

    const totalRevenue = attendees.reduce((sum, reg) => sum + (Number(reg.amountPaid) || 0), 0);

    return (
        <div className="min-h-screen bg-background p-6 lg:p-12 animate-in fade-in duration-700">
            <Toaster position="top-right" />
            
            {/* Redesigned Premium Header/Banner */}
            <div className="mb-12">
                <button 
                    onClick={() => router.push("/admin/events")}
                    className="flex items-center gap-2 text-tatt-gray hover:text-tatt-lime transition-colors group mb-8"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Directory</span>
                </button>

                <div className="relative rounded-[48px] overflow-hidden bg-surface border border-border shadow-2xl min-h-[340px] flex flex-col justify-end p-10 lg:p-16">
                    {/* Background Visual Attribute */}
                    {event.imageUrl ? (
                        <Image src={event.imageUrl} alt={event.title} fill className="object-cover opacity-60 mix-blend-luminosity hover:mix-blend-normal transition-all duration-1000" />
                    ) : (
                        <div className="absolute inset-0 bg-tatt-lime/5 opacity-40">
                             <div className="absolute top-0 right-0 p-20 opacity-10"><Globe size={300} /></div>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent"></div>
                    
                    <div className="relative z-10 space-y-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="px-4 py-1.5 bg-tatt-lime text-tatt-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-tatt-lime/20">
                                Event Type: {event.type}
                            </span>
                            <span className="px-4 py-1.5 bg-background/50 backdrop-blur-md border border-border text-tatt-gray text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                                SID: {event.id.slice(0, 8)}
                            </span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black text-foreground tracking-tighter uppercase italic leading-[0.9]">{event.title}</h1>
                        
                        <div className="flex flex-wrap items-center gap-8 pt-4">
                            <div className="flex items-center gap-3">
                                <div className="size-10 bg-tatt-lime/10 rounded-xl flex items-center justify-center text-tatt-lime">
                                    <Calendar size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-tatt-gray uppercase tracking-widest opacity-60">Timeline</span>
                                    <span className="text-xs font-bold">{format(new Date(event.dateTime), "MMMM do, yyyy")}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="size-10 bg-tatt-lime/10 rounded-xl flex items-center justify-center text-tatt-lime">
                                    <Clock size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-tatt-gray uppercase tracking-widest opacity-60">Execution</span>
                                    <span className="text-xs font-bold">{format(new Date(event.dateTime), "HH:mm")} (Local)</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="size-10 bg-tatt-lime/10 rounded-xl flex items-center justify-center text-tatt-lime">
                                    <MapPin size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-tatt-gray uppercase tracking-widest opacity-60">Base Hub</span>
                                    <span className="text-xs font-bold">{event.locations?.[0]?.chapter?.name || "Global Network"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Left: General Analysis */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    <div className="bg-surface border border-border rounded-[40px] p-10 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <FileText size={120} />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-tatt-lime-dark mb-6">Briefing Summary</h4>
                        <p className="text-lg font-medium text-tatt-gray leading-relaxed max-w-3xl">
                            {event.description}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 border-t border-border pt-10">
                            <div>
                                <h5 className="font-black uppercase tracking-widest text-[10px] text-tatt-gray mb-4">Venue Logistics</h5>
                                <div className="space-y-4">
                                    {event.locations?.map((loc: any, i: number) => (
                                        <div key={i} className="flex items-center gap-4 group">
                                            <div className="size-12 bg-background border border-border rounded-2xl flex items-center justify-center text-tatt-lime group-hover:border-tatt-lime transition-colors">
                                                <Building2 size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{loc.chapter?.name}</p>
                                                <p className="text-xs text-tatt-gray font-medium">{loc.address}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!event.locations || event.locations.length === 0) && (
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 bg-background border border-border rounded-2xl flex items-center justify-center text-tatt-lime">
                                                <Globe size={20} />
                                            </div>
                                            <p className="font-bold text-sm">Global Community Event</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h5 className="font-black uppercase tracking-widest text-[10px] text-tatt-gray mb-4">Network Governance</h5>
                                <div className="flex items-center gap-4">
                                    <div className="size-12 bg-background border border-border rounded-2xl flex items-center justify-center text-tatt-lime">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{event.isForAllMembers ? "Public Protocol" : "Tier-Restricted"}</p>
                                        <p className="text-xs text-tatt-gray font-medium leading-relaxed">
                                            {event.isForAllMembers ? "Access granted to entire TATT community." : `Available to: ${event.targetMembershipTiers?.join(", ") || "Specific Tiers"}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Revenue & Attendance */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    {/* Financial Snapshot - NO LONGER FULL BLACK */}
                    <div className="bg-surface border border-tatt-lime/20 rounded-[40px] p-8 relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-tatt-lime/5 rounded-full blur-3xl -translate-y-12 translate-x-12"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-tatt-gray">Revenue Distribution</h3>
                                <TrendingUp className="text-tatt-lime" size={16} />
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[3.5rem] font-black leading-none text-foreground tracking-tighter italic">
                                        <span className="text-tatt-lime">$</span>{totalRevenue.toLocaleString()}
                                    </p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-tatt-gray mt-2 ml-1 flex items-center gap-2">
                                        <CreditCard size={12} className="text-tatt-lime" /> Verified Check-in Revenue
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 border-t border-border pt-6">
                                    <div>
                                        <p className="text-xl font-bold">${event.basePrice}</p>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-tatt-gray opacity-60">Base MSRP</p>
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold">{attendees.length}</p>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-tatt-gray opacity-60">Verified Bookings</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attendance Ledger */}
                    <div className="bg-surface border border-border rounded-[40px] flex flex-col h-[500px] shadow-sm relative overflow-hidden">
                        <div className="p-8 border-b border-border bg-surface/50 backdrop-blur-md">
                            <h3 className="text-sm font-black uppercase tracking-tight flex items-center justify-between">
                                Attendance Ledger
                                <div className="flex items-center gap-1.5">
                                    <div className="size-1.5 bg-tatt-lime rounded-full animate-pulse shadow-[0_0_8px_rgba(157,255,0,0.5)]"></div>
                                    <span className="text-[10px] font-black text-tatt-lime uppercase italic">Live Feed</span>
                                </div>
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {attendees.length === 0 ? (
                                <div className="size-full flex flex-col items-center justify-center text-tatt-gray opacity-30 mt-20">
                                    <Users size={48} className="mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Awaiting First Entry</p>
                                </div>
                            ) : (
                                attendees.map((reg) => (
                                    <div key={reg.id} className="p-5 bg-background/50 border border-border rounded-3xl flex items-center gap-4 hover:border-tatt-lime/30 transition-all group">
                                        <div className="relative size-12 rounded-2xl overflow-hidden border border-border shadow-sm">
                                            {reg.user.profilePicture ? (
                                                <Image src={reg.user.profilePicture} alt={reg.user.firstName} fill className="object-cover" />
                                            ) : (
                                                <div className="size-full bg-tatt-lime-light flex items-center justify-center text-tatt-black font-black text-[10px]">
                                                    {reg.user.firstName?.charAt(0)}{reg.user.lastName?.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-sm text-foreground truncate">{reg.user.firstName} {reg.user.lastName}</p>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <span className="text-[8px] font-black uppercase tracking-widest bg-tatt-lime text-tatt-black px-1.5 py-0.5 rounded">
                                                    {reg.user.communityTier}
                                                </span>
                                                <span className="text-[9px] text-tatt-gray font-bold truncate opacity-40 italic">Member</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-foreground">${Number(reg.amountPaid).toFixed(2)}</p>
                                            <p className="text-[8px] font-black text-tatt-gray uppercase tracking-widest opacity-40 italic">{reg.isBusinessRegistration ? "Biz" : "Ind"}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
