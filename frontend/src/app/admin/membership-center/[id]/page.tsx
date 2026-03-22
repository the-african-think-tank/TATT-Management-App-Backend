"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    ChevronRight, 
    Bell, 
    LayoutGrid, 
    Plus, 
    Trash2, 
    Ticket, 
    Percent, 
    Loader2
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function EditMembershipPlanPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const isNew = id === 'new';

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    
    const [pricingTab, setPricingTab] = useState<'monthly'|'annual'>('monthly');
    
    const [planData, setPlanData] = useState({
        name: "",
        tagline: "",
        monthlyPrice: "",
        features: [""],
        hasYearlyDiscount: false,
        yearlyDiscountPercent: "15",
        eventDiscountPercent: 25,
        accessControls: [
            { title: 'Free Vendor Tables', subtitle: 'Exhibition and sales opportunities', enabled: false },
            { title: 'Pitch Event Access', subtitle: 'Priority invitation to funding sessions', enabled: false },
            { title: 'Talent Access', subtitle: 'Recruitment and networking priority', enabled: false },
            { title: 'TATT Job Board', subtitle: 'Exclusive Talent Matchmaking', enabled: false },
            { title: 'Premium Resource Library', subtitle: 'Research, Reports & Whitepapers', enabled: true }
        ]
    });

    useEffect(() => {
        if (!isNew) {
            const fetchPlan = async () => {
                try {
                    const res = await api.get(`/membership-center/tiers`);
                    const plan = res.data.find((p: any) => p.id === id);
                    if (plan) {
                        setPlanData({
                            name: plan.name || "",
                            tagline: plan.tagline || "",
                            monthlyPrice: plan.monthlyPrice?.toString() || "",
                            features: plan.features?.length > 0 ? plan.features : [""],
                            hasYearlyDiscount: plan.hasYearlyDiscount || false,
                            yearlyDiscountPercent: plan.yearlyDiscountPercent?.toString() || "15",
                            eventDiscountPercent: plan.eventDiscountPercent || 25,
                            accessControls: plan.accessControls?.length > 0 ? plan.accessControls : [
                                { title: 'Free Vendor Tables', subtitle: 'Exhibition and sales opportunities', enabled: false },
                                { title: 'Pitch Event Access', subtitle: 'Priority invitation to funding sessions', enabled: false },
                                { title: 'Talent Access', subtitle: 'Recruitment and networking priority', enabled: false },
                                { title: 'TATT Job Board', subtitle: 'Exclusive Talent Matchmaking', enabled: false },
                                { title: 'Premium Resource Library', subtitle: 'Research, Reports & Whitepapers', enabled: true }
                            ]
                        });
                    } else {
                        toast.error("Plan not found");
                        router.push('/admin/membership-center');
                    }
                } catch (err: any) {
                    toast.error("Failed to load plan");
                } finally {
                    setLoading(false);
                }
            };
            fetchPlan();
        }
    }, [id, isNew, router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const parsedMonthly = parseFloat(planData.monthlyPrice) || 0;
            const parsedDiscount = parseFloat(planData.yearlyDiscountPercent) || 0;
            const payload = {
                ...planData,
                monthlyPrice: parsedMonthly,
                yearlyDiscountPercent: parsedDiscount,
                yearlyPrice: parsedMonthly * 12 * (1 - (parsedDiscount / 100)),
                eventDiscountPercent: planData.eventDiscountPercent,
                accessControls: planData.accessControls,
                tier: isNew ? planData.name.toUpperCase().replace(/\s+/g, '_') : undefined,
                features: planData.features.filter(f => f.trim() !== "")
            };

            if (isNew) {
                await api.post("/membership-center/tiers", payload);
                toast.success("Plan created successfully");
            } else {
                await api.patch(`/membership-center/tiers/${id}`, payload);
                toast.success("Plan updated successfully");
            }
            router.push('/admin/membership-center');
        } catch (err) {
            toast.error("Failed to save plan");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <Loader2 className="size-12 animate-spin text-tatt-lime" />
                <p className="text-tatt-gray font-black text-xs uppercase tracking-widest mt-4">Initializing Matrix...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Main Content */}
            <main className="p-4 md:p-8 max-w-5xl mx-auto w-full animate-in fade-in duration-700">
                <header className="mb-10 flex flex-col items-start gap-2">
                    <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black mb-2">
                        <span className="text-tatt-gray/60 cursor-pointer hover:text-foreground transition-all" onClick={() => router.push('/admin/membership-center')}>Admin Portal</span>
                        <ChevronRight size={14} className="text-tatt-gray/40" />
                        <span className="text-tatt-gray/60 cursor-pointer hover:text-foreground transition-all" onClick={() => router.push('/admin/membership-center')}>Membership Center</span>
                        <ChevronRight size={14} className="text-tatt-gray/40" />
                        <span className="text-tatt-lime">{isNew ? 'Create New Plan' : 'Edit Plan'}</span>
                    </nav>
                    <h2 className="text-3xl font-black tracking-tight text-foreground">{isNew ? 'Create Membership Plan' : 'Edit Membership Plan'}</h2>
                    <p className="text-tatt-gray text-xs font-bold uppercase tracking-widest">{isNew ? 'Configure a new tier for the TATT community ecosystem.' : 'Modify tier parameters for the TATT community ecosystem.'}</p>
                </header>

                <form onSubmit={handleSave} className="grid grid-cols-12 gap-8">
                    {/* Left Column: Identity & Pricing */}
                    <div className="col-span-12 lg:col-span-7 space-y-8">
                        {/* Plan Identity */}
                        <section className="bg-surface p-8 rounded-2xl border border-border shadow-sm group hover:border-border/80 transition-all">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-tatt-gray mb-6 block">Plan Identity</label>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="col-span-1 sm:col-span-2">
                                        <label className="block text-[10px] uppercase tracking-widest font-black mb-2 text-foreground">Plan Display Name</label>
                                        <input 
                                            required
                                            value={planData.name}
                                            onChange={(e) => setPlanData({ ...planData, name: e.target.value })}
                                            className="w-full bg-background border border-border rounded-xl p-4 text-sm font-black focus:ring-2 focus:ring-tatt-lime outline-none transition-all placeholder:text-tatt-gray/40" 
                                            placeholder="e.g., Ubuntu Executive" 
                                            type="text" 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest font-black mb-2 text-foreground">Short Description & Value Proposition</label>
                                    <textarea 
                                        value={planData.tagline}
                                        onChange={(e) => setPlanData({ ...planData, tagline: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl p-4 text-sm font-black focus:ring-2 focus:ring-tatt-lime outline-none transition-all custom-scrollbar placeholder:text-tatt-gray/40" 
                                        placeholder="Briefly describe the value proposition of this tier..." 
                                        rows={3}
                                    ></textarea>
                                </div>
                            </div>
                        </section>

                        {/* Pricing & Billing */}
                        <section className="bg-surface p-8 rounded-2xl border border-border shadow-sm group hover:border-border/80 transition-all">
                            <div className="flex justify-between items-center mb-6">
                                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-tatt-gray">Pricing & Billing</label>
                                <div className="flex items-center bg-background rounded-full p-1 border border-border">
                                    <button 
                                        onClick={() => setPricingTab('monthly')}
                                        className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${pricingTab === 'monthly' ? 'bg-surface text-foreground shadow-sm' : 'text-tatt-gray hover:text-foreground'}`} 
                                        type="button"
                                    >
                                        Monthly
                                    </button>
                                    <button 
                                        onClick={() => setPricingTab('annual')}
                                        className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${pricingTab === 'annual' ? 'bg-surface text-foreground shadow-sm' : 'text-tatt-gray hover:text-foreground'}`} 
                                        type="button"
                                    >
                                        Annual
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest font-black mb-2 text-foreground">Base Price (USD)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-tatt-lime font-black">$</span>
                                        <input 
                                            required
                                            value={planData.monthlyPrice}
                                            onChange={(e) => setPlanData({ ...planData, monthlyPrice: e.target.value })}
                                            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-4 text-xl font-black text-foreground focus:ring-2 focus:ring-tatt-lime outline-none transition-all placeholder:text-tatt-gray/40" 
                                            placeholder="0.00" 
                                            type="number" 
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                                <div className={pricingTab === 'monthly' ? 'opacity-50' : ''}>
                                    <label className="block text-[10px] uppercase tracking-widest font-black mb-2 text-foreground">Annual Discount (%)</label>
                                    <div className="relative">
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-tatt-gray font-black">%</span>
                                        <input 
                                            disabled={pricingTab === 'monthly'}
                                            value={planData.yearlyDiscountPercent}
                                            onChange={(e) => setPlanData({ ...planData, yearlyDiscountPercent: e.target.value })}
                                            className="w-full bg-background border border-border rounded-xl pr-10 pl-4 py-4 text-xl font-black text-foreground focus:ring-2 focus:ring-tatt-lime outline-none transition-all disabled:bg-surface" 
                                            placeholder="15" 
                                            type="number" 
                                        />
                                    </div>
                                    <p className="text-[9px] text-tatt-gray mt-2 font-bold uppercase tracking-widest italic">{pricingTab === 'monthly' ? 'Switch to annual to edit context' : 'Calculates yearly price'}</p>
                                </div>
                            </div>
                        </section>

                        {/* Perks Configuration */}
                        <section className="bg-surface p-8 rounded-2xl border border-border shadow-sm group hover:border-border/80 transition-all">
                            <div className="flex justify-between items-center mb-6">
                                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-tatt-gray">Perks Configuration</label>
                                <button 
                                    onClick={() => setPlanData({ ...planData, features: [...planData.features, ""] })}
                                    className="text-[10px] uppercase tracking-widest font-black text-tatt-black bg-tatt-lime px-3 py-1.5 rounded-lg flex items-center gap-1 hover:scale-105 active:scale-95 transition-all shadow-sm" 
                                    type="button"
                                >
                                    <Plus size={12} /> Add Perk
                                </button>
                            </div>
                            <div className="space-y-3">
                                {planData.features.map((perk, idx) => (
                                    <div key={idx} className="flex items-center gap-4 bg-background p-3 rounded-xl border border-border group/perk">
                                        <div className="size-10 bg-tatt-lime/10 rounded-lg flex items-center justify-center shrink-0">
                                            <Ticket className="text-tatt-lime size-5" />
                                        </div>
                                        <div className="flex-1">
                                            <input 
                                                value={perk}
                                                onChange={(e) => {
                                                    const newFeat = [...planData.features];
                                                    newFeat[idx] = e.target.value;
                                                    setPlanData({ ...planData, features: newFeat });
                                                }}
                                                className="w-full bg-transparent border-none p-0 text-sm font-black focus:ring-0 placeholder:text-tatt-gray/40 outline-none"
                                                placeholder="Define exclusive perk..."
                                            />
                                            <p className="text-[9px] uppercase tracking-widest text-tatt-gray font-bold mt-1">Access Perk</p>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                if(planData.features.length > 1) {
                                                    const newFeat = planData.features.filter((_, i) => i !== idx);
                                                    setPlanData({ ...planData, features: newFeat });
                                                }
                                            }}
                                            className="text-tatt-gray hover:text-red-500 transition-colors bg-surface p-2.5 rounded-lg border border-border hover:bg-red-50 hover:border-red-100 opacity-0 group-hover/perk:opacity-100" 
                                            type="button"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Access & Discounts */}
                    <div className="col-span-12 lg:col-span-5 space-y-8">
                        {/* Member Benefits */}
                        <section className="bg-surface p-8 rounded-2xl border border-border shadow-sm group hover:border-border/80 transition-all">
                            <div className="flex justify-between items-center mb-6">
                                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-tatt-gray">Member Benefits</label>
                                <button 
                                    onClick={() => setPlanData({ ...planData, accessControls: [...planData.accessControls, { title: '', subtitle: '', enabled: false }] })}
                                    className="text-[10px] uppercase tracking-widest font-black text-tatt-black bg-tatt-lime px-3 py-1.5 rounded-lg flex items-center gap-1 hover:scale-105 active:scale-95 transition-all shadow-sm" 
                                    type="button"
                                >
                                    <Plus size={12} /> Add Entry
                                </button>
                            </div>
                            <div className="space-y-3">
                                {planData.accessControls.map((control: any, i: number) => (
                                    <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${control.enabled ? 'bg-background border-tatt-lime/40' : 'bg-surface border-border'} group/ctrl`}>
                                        <input 
                                            checked={control.enabled} 
                                            onChange={(e) => {
                                                const newCtrls = [...planData.accessControls];
                                                newCtrls[i].enabled = e.target.checked;
                                                setPlanData({ ...planData, accessControls: newCtrls });
                                            }}
                                            className="mt-1 w-4 h-4 rounded border-border text-tatt-lime focus:ring-tatt-lime bg-surface accent-tatt-lime cursor-pointer" 
                                            type="checkbox" 
                                        />
                                        <div className="flex flex-col flex-1">
                                            <input 
                                                value={control.title}
                                                onChange={(e) => {
                                                    const newCtrls = [...planData.accessControls];
                                                    newCtrls[i].title = e.target.value;
                                                    setPlanData({ ...planData, accessControls: newCtrls });
                                                }}
                                                className="w-full bg-transparent border-none p-0 text-sm font-black text-foreground focus:ring-0 placeholder:text-tatt-gray/40 outline-none"
                                                placeholder="Control Title"
                                            />
                                            <input 
                                                value={control.subtitle}
                                                onChange={(e) => {
                                                    const newCtrls = [...planData.accessControls];
                                                    newCtrls[i].subtitle = e.target.value;
                                                    setPlanData({ ...planData, accessControls: newCtrls });
                                                }}
                                                className="w-full bg-transparent border-none p-0 text-[10px] uppercase tracking-widest text-tatt-gray font-bold mt-1 focus:ring-0 placeholder:text-tatt-gray/30 outline-none"
                                                placeholder="Target Description"
                                            />
                                        </div>
                                        <button 
                                            onClick={() => {
                                                if(planData.accessControls.length > 1) {
                                                    const newCtrls = planData.accessControls.filter((_: any, idx: number) => idx !== i);
                                                    setPlanData({ ...planData, accessControls: newCtrls });
                                                }
                                            }}
                                            className="text-tatt-gray hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50 opacity-0 group-hover/ctrl:opacity-100" 
                                            type="button"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[9px] font-black uppercase text-center mt-6 tracking-widest text-tatt-gray/60 italic">Dynamic System Configuration</p>
                        </section>

                        {/* Discount Control */}
                        <section className="bg-surface p-8 rounded-2xl border border-border shadow-sm group hover:border-border/80 transition-all">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-tatt-gray mb-6 block">Global Discount Control</label>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-black mb-3 text-foreground">Event Discount Percentage</label>
                                <div className="flex items-center gap-5">
                                    <input 
                                        value={planData.eventDiscountPercent} 
                                        onChange={(e) => setPlanData({ ...planData, eventDiscountPercent: parseInt(e.target.value) || 0 })}
                                        className="flex-1 accent-tatt-lime hover:accent-tatt-lime-vibrant transition-all cursor-pointer" 
                                        type="range" 
                                        min="0" 
                                        max="100"
                                    />
                                    <span className="text-sm font-black w-14 text-center bg-background py-2.5 rounded-xl border border-tatt-lime/40 text-tatt-lime">{planData.eventDiscountPercent}%</span>
                                </div>
                                <p className="text-[9px] text-tatt-gray mt-4 italic font-bold tracking-widest uppercase">Select the exact rate assigned to tier events.</p>
                            </div>
                        </section>

                        {/* Form Actions */}
                        <div className="flex flex-col gap-4 pt-4 sticky bottom-8">
                            <button 
                                disabled={saving}
                                className="w-full bg-tatt-lime text-tatt-black py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:shadow-xl hover:shadow-tatt-lime/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2" 
                                type="submit"
                            >
                                {saving ? <Loader2 className="animate-spin size-4" /> : null}
                                {isNew ? 'Create Plan' : 'Save'}
                            </button>
                            <button 
                                onClick={() => router.push('/admin/membership-center')}
                                className="w-full bg-background border border-border hover:bg-surface text-tatt-gray py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-[0.98]" 
                                type="button"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}
