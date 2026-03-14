"use client";

import React, { useState, useEffect } from "react";
import {
    IdCard,
    Users,
    Tag,
    Plus,
    Filter,
    Search,
    Edit2,
    Check,
    X,
    Loader2,
    Calendar,
    ArrowUpRight,
    Download,
    Bell,
    CheckCircle2,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    ChevronDown
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

const StrategicSelect = ({ value, onChange, options, placeholder, icon: Icon }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((opt: any) => opt.value === value);

    return (
        <div className="relative inline-block text-left" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all text-[11px] font-black uppercase tracking-widest min-w-[180px] justify-between ${
                    isOpen ? 'border-tatt-lime bg-tatt-lime/5 ring-4 ring-tatt-lime/5' : 'border-border bg-background hover:border-tatt-lime/50'
                }`}
            >
                <div className="flex items-center gap-2">
                    {Icon && <Icon size={14} className="text-tatt-gray" />}
                    <span>{selectedOption ? selectedOption.label : placeholder}</span>
                </div>
                <ChevronDown size={14} className={`text-tatt-gray transition-transform duration-300 ${isOpen ? 'rotate-180 text-tatt-lime' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-[300px] overflow-y-auto py-2 backdrop-blur-xl bg-surface/80">
                        {options.map((opt: any) => (
                            <button
                                key={opt.value}
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-tatt-lime hover:text-tatt-black transition-all ${
                                    value === opt.value ? 'bg-tatt-lime/10 text-tatt-lime' : 'text-tatt-gray'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function MembershipCenterPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>({
        tiers: [],
        subscribers: [],
        discounts: [],
        analytics: { labels: [], tierGrowth: {}, totalGrowthRate: "0%" },
        chapters: []
    });
    const [filters, setFilters] = useState({
        tier: "",
        chapterId: "",
        billingCycle: "",
        search: "",
        page: 1,
        limit: 10
    });
    const [promoForm, setPromoForm] = useState({
        name: "",
        value: "",
        validUntil: "",
        applicablePlans: ["KIONGOZI"]
    });
    const [editingPlan, setEditingPlan] = useState<any>(null);
    const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
    const [isCreatingPromo, setIsCreatingPromo] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams(filters as any).toString();
            const [tiersRes, subscribersRes, discountsRes, analyticsRes, chaptersRes] = await Promise.all([
                api.get("/billing/plans"),
                api.get(`/membership-center/subscribers?${query}`),
                api.get("/membership-center/discounts"),
                api.get("/membership-center/analytics"),
                api.get("/membership-center/chapters")
            ]);

            setData({
                tiers: tiersRes.data,
                subscribers: subscribersRes.data.members || [],
                pagination: {
                    total: subscribersRes.data.total || 0,
                    page: subscribersRes.data.page || 1,
                    totalPages: subscribersRes.data.totalPages || 1
                },
                discounts: discountsRes.data,
                analytics: analyticsRes.data,
                chapters: chaptersRes.data
            });
        } catch (err: any) {
            toast.error("Failed to sync membership data");
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = async (key: string, value: any) => {
        const newFilters = { ...filters, [key]: value };
        if (key !== 'page') newFilters.page = 1; // Reset to page 1 on filter change
        setFilters(newFilters);

        // Instant refetch for subscribers when filters change
        try {
            const query = new URLSearchParams(newFilters as any).toString();
            const res = await api.get(`/membership-center/subscribers?${query}`);
            setData((prev: any) => ({ 
                ...prev, 
                subscribers: res.data.members || [],
                pagination: {
                    total: res.data.total || 0,
                    page: res.data.page || 1,
                    totalPages: res.data.totalPages || 1
                }
            }));
        } catch (err) {
            toast.error("Filter update failed");
        }
    };

    const handleUpdatePlan = async () => {
        if (!editingPlan) return;
        setIsUpdatingPlan(true);
        try {
            if (editingPlan.id) {
                await api.patch(`/membership-center/tiers/${editingPlan.id}`, editingPlan);
                toast.success(`${editingPlan.name} updated successfully`);
            } else {
                const payload = { ...editingPlan };
                if (payload.tier === 'NEW') payload.tier = payload.name.toUpperCase().replace(/\s+/g, '_');
                await api.post("/membership-center/tiers", payload);
                toast.success(`${editingPlan.name} created successfully`);
            }
            setEditingPlan(null);
            fetchAllData();
        } catch (err) {
            toast.error("Failed to save plan");
        } finally {
            setIsUpdatingPlan(false);
        }
    };

    const handleApplyCampaign = async () => {
        if (!promoForm.name || !promoForm.value || !promoForm.validUntil) {
            toast.error("Missing campaign details");
            return;
        }
        setIsCreatingPromo(true);
        try {
            const payload = {
                ...promoForm,
                code: promoForm.name.toUpperCase().replace(/\s+/g, '_') + '_' + Date.now().toString().slice(-4),
                discountType: 'percentage',
                duration: 'once',
                value: parseInt(promoForm.value)
            };
            await api.post("/membership-center/discounts", payload);
            toast.success("Campaign Applied! Members notified.");
            setPromoForm({ name: "", value: "", validUntil: "", applicablePlans: ["KIONGOZI"] });
            fetchAllData();
        } catch (err) {
            toast.error("Failed to apply campaign");
        } finally {
            setIsCreatingPromo(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Loader2 className="size-12 animate-spin text-tatt-lime" />
                <p className="text-tatt-gray font-black text-xs uppercase tracking-widest animate-pulse">Establishing Secure Connection...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-700">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-foreground tracking-tight underline decoration-tatt-lime/30 underline-offset-8">Membership Center (V2-ACTIVE)</h2>
                    <p className="text-tatt-gray mt-2 font-medium">Oversee subscription growth, plans, and active promotions.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tatt-gray size-4 group-focus-within:text-tatt-lime transition-colors" />
                        <input
                            className="pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-tatt-lime outline-none transition-all w-64"
                            placeholder="Find member..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange("search", e.target.value)}
                        />
                    </div>
                    <button className="p-2.5 rounded-xl bg-surface border border-border text-tatt-gray relative hover:border-tatt-lime transition-all">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 size-2.5 bg-red-500 rounded-full ring-2 ring-surface animate-bounce"></span>
                    </button>
                </div>
            </header>

            {/* Growth Statistics */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-surface p-8 rounded-[2.5rem] border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-black text-xl text-foreground italic">Subscription Performance</h3>
                            <p className="text-[10px] text-tatt-gray font-bold uppercase tracking-widest mt-1">Real-time Tier Velocity</p>
                        </div>
                        <select className="bg-background border border-border rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:border-tatt-lime transition-all">
                            <option>Last 6 Months</option>
                            <option>Year to Date</option>
                        </select>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-4 px-4">
                        {data.analytics.labels.map((label: string, idx: number) => {
                            const ubuntu = data.analytics.tierGrowth['UBUNTU']?.[idx] || 0;
                            const imani = data.analytics.tierGrowth['IMANI']?.[idx] || 0;
                            const kiongozi = data.analytics.tierGrowth['KIONGOZI']?.[idx] || 0;
                            
                            // Simple normalization: find max across all data points
                            const allValues = Object.values(data.analytics.tierGrowth).flat() as number[];
                            const maxVal = Math.max(...allValues, 10); // Minimum max of 10 for scale
                            
                            return (
                                <div key={idx} className="flex-1 flex flex-col justify-end items-center group h-full space-y-1">
                                    <div className="w-full flex justify-center items-end gap-1.5 h-[80%]">
                                        {/* Ubuntu Bar */}
                                        <div
                                            className="w-1.5 md:w-3 bg-tatt-lime/20 rounded-full transition-all duration-500 group-hover:bg-tatt-lime/40"
                                            style={{ height: `${(ubuntu / maxVal) * 100}%` }}
                                        ></div>
                                        {/* Imani Bar */}
                                        <div
                                            className="w-1.5 md:w-3 bg-tatt-lime/50 rounded-full transition-all duration-500 group-hover:bg-tatt-lime/70"
                                            style={{ height: `${(imani / maxVal) * 100}%` }}
                                        ></div>
                                        {/* Kiongozi Bar */}
                                        <div
                                            className="w-1.5 md:w-3 bg-tatt-lime rounded-full transition-all duration-500 shadow-lg shadow-tatt-lime/20"
                                            style={{ height: `${(kiongozi / maxVal) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-[10px] font-black text-tatt-gray tracking-tighter">{label}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex flex-wrap gap-6 mt-8 pt-6 border-t border-border">
                        <div className="flex items-center gap-2.5">
                            <div className="size-3 rounded-full bg-tatt-lime shadow-sm shadow-tatt-lime/50"></div>
                            <span className="text-[10px] font-black text-tatt-gray uppercase tracking-widest">Kiongozi</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="size-3 rounded-full bg-tatt-lime/50"></div>
                            <span className="text-[10px] font-black text-tatt-gray uppercase tracking-widest">Imani</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="size-3 rounded-full bg-tatt-lime/20"></div>
                            <span className="text-[10px] font-black text-tatt-gray uppercase tracking-widest">Ubuntu</span>
                        </div>
                    </div>
                </div>

                <div className="bg-tatt-lime p-8 rounded-[2.5rem] border border-tatt-lime text-tatt-black flex flex-col justify-between shadow-2xl shadow-tatt-lime/20 group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                        <ArrowUpRight size={120} strokeWidth={3} />
                    </div>
                    <div>
                        <p className="text-tatt-black/60 text-xs font-black uppercase tracking-[0.2em]">Total Growth Rate</p>
                        <h4 className="text-6xl font-black mt-3 leading-tight tracking-tighter">{data.analytics.totalGrowthRate}</h4>
                        <p className="mt-6 text-tatt-black/80 text-sm font-bold leading-relaxed">
                            Membership acquisition is trending at {data.analytics.totalGrowthRate} this month. Keep up the strategic momentum!
                        </p>
                    </div>
                </div>
            </section>

            {/* Plans and Discounts */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Plans Management */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black text-foreground italic flex items-center gap-3">
                            <IdCard className="text-tatt-lime" /> Active Membership Plans
                        </h3>
                        <button 
                            onClick={() => setEditingPlan({ name: "", monthlyPrice: "", tier: "NEW", features: [""] })}
                            className="text-tatt-lime hover:text-white transition-colors text-xs font-black uppercase tracking-widest flex items-center gap-2 bg-tatt-lime/10 px-4 py-2 rounded-xl group"
                        >
                            <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Add new plan
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {data.tiers.map((tier: any) => (
                            <div
                                key={tier.id}
                                className={`bg-surface p-6 rounded-[2rem] border transition-all h-full flex flex-col justify-between group cursor-pointer ${tier.tier === 'IMANI' ? 'border-tatt-lime ring-4 ring-tatt-lime/5 scale-[1.02]' : 'border-border hover:border-tatt-lime/50'
                                    }`}
                            >
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${tier.tier === 'IMANI' ? 'bg-tatt-lime text-tatt-black' : 'bg-background text-tatt-gray'
                                            }`}>
                                            {tier.tier === 'IMANI' ? 'Popular' : 'Active'}
                                        </span>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingPlan({...tier});
                                            }}
                                            className="text-tatt-gray hover:text-tatt-lime transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-foreground">{tier.name}</h4>
                                        <div className="flex items-baseline gap-1 mt-1">
                                            {tier.activeDiscount ? (
                                                <div className="flex flex-col">
                                                    <div className="flex items-baseline gap-2">
                                                        <p className="text-3xl font-black text-tatt-lime">
                                                            ${tier.activeDiscount.type === 'percentage' 
                                                                ? (tier.monthlyPrice * (1 - tier.activeDiscount.value / 100)).toFixed(0)
                                                                : (Math.max(0, tier.monthlyPrice - tier.activeDiscount.value / 100)).toFixed(0)}
                                                        </p>
                                                        <p className="text-sm font-black text-tatt-gray line-through decoration-red-500/50">${Number(tier.monthlyPrice).toFixed(0)}</p>
                                                    </div>
                                                    <span className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-1">
                                                        PROMO: {tier.activeDiscount.name} ({tier.activeDiscount.type === 'percentage' ? `${tier.activeDiscount.value}% OFF` : `$${(tier.activeDiscount.value/100).toFixed(2)} OFF`}) 
                                                        {tier.activeDiscount.validUntil && ` • VALID UNTIL ${new Date(tier.activeDiscount.validUntil).toLocaleDateString()}`}
                                                    </span>
                                                </div>
                                            ) : (
                                                <p className="text-3xl font-black text-tatt-lime">${Number(tier.monthlyPrice).toFixed(0)}</p>
                                            )}
                                            <span className="text-[10px] font-black text-tatt-gray uppercase tracking-widest">/mo</span>
                                        </div>
                                    </div>
                                    <ul className="space-y-3 pt-4 border-t border-border">
                                        {(tier.features || []).slice(0, 3).map((perk: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-[11px] font-bold text-tatt-gray leading-tight">
                                                <CheckCircle2 size={14} className="text-tatt-lime shrink-0 mt-0.5" />
                                                {perk}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <button 
                                    onClick={() => setEditingPlan({...tier})}
                                    className="mt-6 w-full py-3 rounded-xl border border-border group-hover:border-tatt-lime transition-all text-[10px] font-black uppercase tracking-widest group-hover:bg-tatt-lime group-hover:text-tatt-black"
                                >
                                    Manage Perks
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Create Promo */}
                <div className="xl:col-span-1 space-y-6">
                    <h3 className="text-2xl font-black text-foreground italic flex items-center gap-3">
                        <Tag className="text-tatt-lime" /> Create Promotion
                    </h3>
                    <div className="bg-surface border border-border p-8 rounded-[2.5rem] shadow-sm space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-tatt-gray ml-1">Strategy Name</label>
                            <input
                                className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-tatt-lime outline-none transition-all"
                                placeholder="Summer Growth Drive"
                                type="text"
                                value={promoForm.name}
                                onChange={(e) => setPromoForm({ ...promoForm, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-tatt-gray ml-1">Benefit (%)</label>
                                <input
                                    className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-sm font-black text-tatt-lime focus:ring-2 focus:ring-tatt-lime outline-none transition-all"
                                    placeholder="20"
                                    type="number"
                                    value={promoForm.value}
                                    onChange={(e) => setPromoForm({ ...promoForm, value: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-tatt-gray ml-1">Valid Until</label>
                                <input
                                    className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-tatt-lime outline-none transition-all"
                                    type="date"
                                    value={promoForm.validUntil}
                                    onChange={(e) => setPromoForm({ ...promoForm, validUntil: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-tatt-gray ml-1">Applicable Tiers</label>
                            <div className="grid grid-cols-1 gap-3">
                                {['UBUNTU', 'IMANI', 'KIONGOZI'].map((tier) => (
                                    <label key={tier} className="flex items-center justify-between p-4 bg-background border border-border rounded-2xl cursor-pointer hover:border-tatt-lime transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className={`size-5 rounded-lg border-2 flex items-center justify-center transition-all ${promoForm.applicablePlans.includes(tier) ? 'bg-tatt-lime border-tatt-lime' : 'border-tatt-gray/30'
                                                }`}>
                                                {promoForm.applicablePlans.includes(tier) && <Check size={14} className="text-tatt-black stroke-[4px]" />}
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-widest">{tier}</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={promoForm.applicablePlans.includes(tier)}
                                            onChange={() => {
                                                const current = promoForm.applicablePlans;
                                                const next = current.includes(tier) ? current.filter(t => t !== tier) : [...current, tier];
                                                setPromoForm({ ...promoForm, applicablePlans: next });
                                            }}
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>
                        <button 
                            onClick={handleApplyCampaign}
                            disabled={isCreatingPromo}
                            className="w-full bg-tatt-lime text-tatt-black py-4 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:scale-[1.02] shadow-xl shadow-tatt-lime/20 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                        >
                            {isCreatingPromo ? <Loader2 className="animate-spin" size={16} /> : "Apply Campaign"} <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Member Directory */}
            <section className="bg-surface border border-border rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col">
                <div className="p-8 border-b border-border">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <h3 className="text-2xl font-black text-foreground italic flex items-center gap-3">
                            <Users className="text-tatt-lime" /> Member Directory
                        </h3>
                        <div className="flex flex-wrap gap-4">
                            <StrategicSelect 
                                value={filters.tier}
                                onChange={(val: string) => handleFilterChange("tier", val)}
                                placeholder="Filter Plan"
                                icon={IdCard}
                                options={[
                                    { value: "", label: "Plan: All" },
                                    { value: "FREE", label: "Free" },
                                    { value: "UBUNTU", label: "Ubuntu" },
                                    { value: "IMANI", label: "Imani" },
                                    { value: "KIONGOZI", label: "Kiongozi" },
                                ]}
                            />
                            <StrategicSelect 
                                value={filters.chapterId}
                                onChange={(val: string) => handleFilterChange("chapterId", val)}
                                placeholder="Filter Chapter"
                                icon={Users}
                                options={[
                                    { value: "", label: "Chapter: All" },
                                    ...data.chapters.map((c: any) => ({ value: c.id, label: c.name }))
                                ]}
                            />
                            <button className="flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-black/5">
                                <Filter size={14} /> Advanced Filter
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto overflow-y-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-background/50 border-b border-border">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-tatt-gray">Member Entity</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-tatt-gray">Current Tier</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-tatt-gray">Chapter</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-tatt-gray">Billing</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-tatt-gray">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-tatt-gray text-right">Scope</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {data.subscribers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-30">
                                            <Users size={48} />
                                            <p className="text-sm font-black uppercase tracking-widest italic">No active subscriptions detected</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : data.subscribers.map((sub: any) => (
                                <tr key={sub.id} className="hover:bg-tatt-lime/[0.02] transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="size-11 rounded-2xl bg-tatt-lime/10 flex items-center justify-center font-black text-xs text-tatt-lime border border-tatt-lime/20 group-hover:scale-110 transition-transform">
                                                {(sub.firstName?.[0] || '')}{(sub.lastName?.[0] || '') || '??'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-foreground">{sub.firstName || 'Anonymous'} {sub.lastName || 'Member'}</p>
                                                <p className="text-[10px] text-tatt-gray font-bold lowercase">{sub.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${sub.communityTier === 'KIONGOZI' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                            sub.communityTier === 'IMANI' ? 'bg-tatt-lime/10 text-tatt-lime border-tatt-lime/20' :
                                                'bg-tatt-gray/10 text-tatt-gray border-tatt-gray/20'
                                            }`}>
                                            {sub.communityTier}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-xs font-black text-tatt-gray uppercase tracking-tighter truncate max-w-[150px]">
                                        {sub.chapter?.name || 'Unassigned'}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-foreground leading-none">{sub.billingCycle}</span>
                                                {sub.hasAutoPayEnabled ? (
                                                    <span className="bg-green-500/10 text-green-500 text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">Autopay</span>
                                                ) : (
                                                    <span className="bg-tatt-gray/10 text-tatt-gray text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">Manual</span>
                                                )}
                                            </div>
                                            <span className="text-[9px] font-bold text-tatt-gray flex items-center gap-1 uppercase">
                                                <Calendar size={10} /> {sub.subscriptionExpiresAt ? new Date(sub.subscriptionExpiresAt).toLocaleDateString() : 'Active'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-green-500 uppercase tracking-widest italic leading-none">
                                            <div className="size-1.5 rounded-full bg-green-500 animate-pulse"></div> Active Flow
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="p-2 text-tatt-gray hover:text-tatt-lime transition-all rounded-lg hover:bg-tatt-lime/10">
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {(data.pagination?.totalPages || 1) > 1 && (
                    <div className="p-8 bg-background/50 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-[10px] font-black text-tatt-gray uppercase tracking-widest italic">
                            Viewing {(filters.page - 1) * filters.limit + 1} - {Math.min(filters.page * filters.limit, data.pagination.total)} of {data.pagination.total} Global Membership Entities
                        </p>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => handleFilterChange("page", filters.page - 1)}
                                className="p-2 rounded-xl border border-border hover:bg-surface disabled:opacity-30 transition-all font-black uppercase text-[10px]" 
                                disabled={filters.page === 1}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div className="flex gap-1.5 mx-2">
                                {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((p) => (
                                    <button 
                                        key={p}
                                        onClick={() => handleFilterChange("page", p)}
                                        className={`size-8 rounded-xl font-black text-xs transition-all ${
                                            filters.page === p 
                                                ? "bg-tatt-lime text-tatt-black shadow-lg shadow-tatt-lime/20" 
                                                : "border border-border hover:border-tatt-lime text-tatt-gray"
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={() => handleFilterChange("page", filters.page + 1)}
                                className="p-2 rounded-xl border border-border hover:bg-surface disabled:opacity-30 transition-all font-black uppercase text-[10px]"
                                disabled={filters.page === data.pagination.totalPages}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {/* Plan Edit Modal */}
            {editingPlan && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-tatt-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-surface w-full max-w-2xl rounded-[2.5rem] border border-border shadow-2xl p-8 space-y-8 animate-in slide-in-from-bottom-8 duration-500 overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between">
                            <h3 className="text-3xl font-black italic text-foreground tracking-tight">
                                {editingPlan.id ? `Edit ${editingPlan.name} membership` : 'Create new membership plan'}
                            </h3>
                            <button onClick={() => setEditingPlan(null)} className="p-2 hover:bg-background rounded-full transition-colors text-tatt-gray hover:text-foreground">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-tatt-gray ml-1">Plan Display Name</label>
                                <input 
                                    className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-tatt-lime outline-none"
                                    value={editingPlan.name}
                                    onChange={(e) => setEditingPlan({...editingPlan, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-tatt-gray ml-1">Monthly Price ($)</label>
                                <input 
                                    className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-xl font-black text-tatt-lime focus:ring-2 focus:ring-tatt-lime outline-none"
                                    type="number"
                                    value={editingPlan.monthlyPrice}
                                    onChange={(e) => setEditingPlan({...editingPlan, monthlyPrice: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase tracking-widest text-tatt-gray ml-1">Membership Perks</label>
                                <button 
                                    onClick={() => setEditingPlan({...editingPlan, features: [...(editingPlan.features || []), '']})}
                                    className="text-[10px] font-black text-tatt-lime hover:underline uppercase tracking-widest"
                                >
                                    + Add New Perk
                                </button>
                            </div>
                            <div className="space-y-3">
                                {(editingPlan.features || []).map((perk: string, idx: number) => (
                                    <div key={idx} className="flex gap-2">
                                        <input 
                                            className="flex-1 bg-background border border-border rounded-2xl px-5 py-3 text-sm font-medium focus:ring-2 focus:ring-tatt-lime outline-none"
                                            value={perk}
                                            onChange={(e) => {
                                                const newFeatures = [...editingPlan.features];
                                                newFeatures[idx] = e.target.value;
                                                setEditingPlan({...editingPlan, features: newFeatures});
                                            }}
                                        />
                                        <button 
                                            onClick={() => {
                                                const newFeatures = editingPlan.features.filter((_: any, i: number) => i !== idx);
                                                setEditingPlan({...editingPlan, features: newFeatures});
                                            }}
                                            className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <button 
                                onClick={handleUpdatePlan}
                                disabled={isUpdatingPlan}
                                className="flex-1 bg-tatt-lime text-tatt-black py-4 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-tatt-lime/20 flex items-center justify-center gap-2"
                            >
                                {isUpdatingPlan ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} 
                                Save
                            </button>
                            <button 
                                onClick={() => setEditingPlan(null)}
                                className="flex-1 bg-background text-tatt-gray py-4 rounded-2xl font-black text-xs uppercase tracking-[0.3em] border border-border hover:bg-surface transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
