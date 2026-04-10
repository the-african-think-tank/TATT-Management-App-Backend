"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    CheckCircle,
    Zap,
    Shield,
    Loader2,
} from "lucide-react";
import api from "@/services/api";

interface Plan {
    id: string;
    tier: string;
    name: string;
    tagline: string;
    monthlyPrice: number;
    yearlyPrice: number;
    features: string[];
    isPopular: boolean;
    hasYearlyDiscount: boolean;
    yearlyDiscountPercent?: number;
    eventDiscountPercent?: number;
    accessControls?: { title: string; subtitle: string; enabled: boolean }[];
    activeDiscount?: {
        code: string;
        name: string;
        value: number;
        type: 'percentage' | 'fixed';
        validUntil?: string;
    };
}

const TIER_RANK: Record<string, number> = {
    FREE: 0,
    UBUNTU: 1,
    IMANI: 2,
    KIONGOZI: 3,
};

export default function UpgradePage() {
    const { user } = useAuth();
    const router = useRouter();

    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isYearly, setIsYearly] = useState(false);

    // Kiongozi members have nothing to upgrade to — send them away
    useEffect(() => {
        if (user?.communityTier === "KIONGOZI") {
            router.replace("/dashboard");
        }
    }, [user, router]);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const resp = await api.get("/billing/plans");
                // Force Imani to be the 'Most Popular' plan
                const processed = resp.data.map((p: Plan) => ({
                    ...p,
                    isPopular: p.tier === "IMANI"
                }));
                setPlans(processed);
            } catch (err) {
                console.error("Failed to fetch plans", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlans();
    }, []);

    if (!user || user.communityTier === "KIONGOZI") return null;

    const currentRank = TIER_RANK[user.communityTier ?? "FREE"] ?? 0;

    const handleSelectPlan = (plan: Plan) => {
        if (plan.monthlyPrice === 0) return; // FREE — no action
        router.push(`/dashboard/upgrade/payment?plan=${plan.tier}&yearly=${isYearly}`);
    };

    const fmt = (n: number) => {
        const rounded = Math.round(n * 100) / 100;
        return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(2);
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero banner */}
            <div className="bg-tatt-black relative overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            "radial-gradient(var(--tatt-lime) 0.5px, transparent 0.5px), radial-gradient(var(--tatt-lime) 0.5px, transparent 0.5px)",
                        backgroundSize: "20px 20px",
                        backgroundPosition: "0 0, 10px 10px",
                    }}
                />
                <div className="relative z-10 max-w-4xl mx-auto px-6 py-14 text-center">
                    <div className="inline-flex items-center gap-2 bg-tatt-lime/10 border border-tatt-lime/20 text-tatt-lime text-[11px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-5">
                        <Zap className="h-3 w-3" />
                        Membership Upgrade
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                        Unlock Your Full <span className="text-tatt-lime">TATT Potential</span>
                    </h1>
                    <p className="text-white/60 text-base font-medium max-w-xl mx-auto">
                        Join thousands of African diaspora leaders who use TATT's paid tiers to connect, collaborate, and drive measurable impact.
                    </p>

                    <div className="mt-7 inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/50 text-xs font-bold uppercase tracking-widest px-5 py-2 rounded-full">
                        <Shield className="h-3.5 w-3.5" />
                        Current tier: {user.communityTier ?? "FREE"}
                    </div>

                    <div className="flex items-center justify-center mt-8 gap-4">
                        <span className={`text-sm font-bold transition-colors ${!isYearly ? "text-white" : "text-white/40"}`}>Monthly</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={isYearly}
                                onChange={() => setIsYearly(!isYearly)}
                            />
                            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tatt-lime" />
                        </label>
                        <span className={`text-sm font-bold transition-colors ${isYearly ? "text-white" : "text-white/40"}`}>
                            Yearly{" "}
                            <span className="text-tatt-lime bg-tatt-lime/10 border border-tatt-lime/20 px-2 py-0.5 rounded-full text-xs ml-1">
                                Unlocked Discounts
                            </span>
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <Loader2 className="h-10 w-10 text-tatt-lime animate-spin mb-4" />
                        <p className="text-tatt-gray font-bold">Loading membership plans...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
                            {plans.map((plan) => {
                                const planRank = TIER_RANK[plan.tier] ?? 0;
                                const isCurrentPlan = user.communityTier === plan.tier;
                                const isDowngrade = planRank < currentRank;
                                const isFree = plan.monthlyPrice === 0;
                                const displayPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
                                const period = isYearly ? "yr" : "mo";

                                return (
                                    <div
                                        key={plan.id}
                                        className={`relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 shadow-sm
                                            ${plan.isPopular
                                                ? "border-tatt-lime bg-surface shadow-lg z-10 ring-1 ring-tatt-lime"
                                                : "border-border bg-surface hover:border-tatt-lime/40 hover:shadow-md"
                                            }
                                            ${isCurrentPlan ? "ring-2 ring-tatt-bronze/50" : ""}
                                        `}
                                    >
                                        <div
                                            className={`h-1 w-full ${
                                                isFree
                                                    ? "bg-tatt-gray/30"
                                                    : plan.isPopular
                                                    ? "bg-tatt-lime"
                                                    : plan.tier === "KIONGOZI"
                                                    ? "bg-tatt-yellow"
                                                    : "bg-tatt-bronze"
                                            }`}
                                        />

                                        {plan.isPopular && (
                                            <div className="absolute top-0 right-0 bg-tatt-lime text-tatt-black text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">
                                                Most Popular
                                            </div>
                                        )}
                                        {isCurrentPlan && (
                                            <div className="absolute top-0 left-0 bg-tatt-bronze text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-br-xl">
                                                Current Plan
                                            </div>
                                        )}
                                        {isYearly && plan.hasYearlyDiscount && plan.yearlyDiscountPercent && (
                                            <div className={`absolute right-0 bg-tatt-lime/40 border-b border-l border-tatt-lime text-tatt-lime-dark text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl ${plan.isPopular ? "top-7" : "top-0"}`}>
                                                Save {plan.yearlyDiscountPercent}%
                                            </div>
                                        )}

                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="mb-5 min-h-[84px]">
                                                <h2 className={`text-xl font-black tracking-tight ${isFree ? "text-tatt-gray" : "text-foreground"}`}>
                                                    {plan.name}
                                                </h2>
                                                <p className="text-tatt-gray text-[13px] font-medium mt-1 leading-snug">{plan.tagline}</p>
                                            </div>
                                            
                                            <div className="mb-8 min-h-[100px]">
                                                <div className="flex items-baseline gap-1">
                                                    {plan.activeDiscount ? (
                                                        <div className="flex flex-col">
                                                            <div className="flex items-baseline gap-2">
                                                                <span className={`text-4xl font-black ${isFree ? "text-tatt-gray" : plan.isPopular ? "text-tatt-lime" : "text-foreground"}`}>
                                                                    ${fmt(isYearly 
                                                                        ? (plan.activeDiscount.type === 'percentage' ? displayPrice * (1 - plan.activeDiscount.value / 100) : Math.max(0, displayPrice - plan.activeDiscount.value))
                                                                        : (plan.activeDiscount.type === 'percentage' ? displayPrice * (1 - plan.activeDiscount.value / 100) : Math.max(0, displayPrice - plan.activeDiscount.value))
                                                                    )}
                                                                </span>
                                                                <span className="text-sm font-black text-tatt-gray line-through decoration-red-500/50">${fmt(displayPrice)}</span>
                                                            </div>
                                                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1">
                                                                {plan.activeDiscount.name} Applied 
                                                                {plan.activeDiscount.validUntil && ` • Ends ${new Date(plan.activeDiscount.validUntil).toLocaleDateString()}`}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className={`text-4xl font-black ${isFree ? "text-tatt-gray" : plan.isPopular ? "text-tatt-lime" : "text-foreground"}`}>
                                                            ${fmt(displayPrice)}
                                                        </span>
                                                    )}
                                                    <span className="text-tatt-gray font-bold text-sm">/{period}</span>
                                                </div>
                                            </div>

                                            <div className="flex-1 mb-8 overflow-hidden">
                                                <ul className="h-64 overflow-y-auto space-y-3.5 pr-2 custom-scrollbar">
                                                    {plan.features.map((feature, idx) => (
                                                        <li key={`feat-${idx}`} className="flex items-start gap-2.5 text-[13px]">
                                                            <CheckCircle className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${isFree ? "text-tatt-gray/50" : "text-tatt-lime"}`} />
                                                            <span className={isFree ? "text-tatt-gray" : "text-foreground font-semibold"}>{feature}</span>
                                                        </li>
                                                    ))}
                                                    {plan.accessControls?.filter(c => c.enabled).map((control, idx) => (
                                                        <li key={`ctrl-${idx}`} className="flex items-start gap-2.5 text-[13px]">
                                                            <CheckCircle className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${isFree ? "text-tatt-gray/50" : "text-tatt-lime"}`} />
                                                            <span className={isFree ? "text-tatt-gray" : "text-foreground font-semibold"}>{control.title}</span>
                                                        </li>
                                                    ))}
                                                    {plan.eventDiscountPercent !== undefined && plan.eventDiscountPercent > 0 && (
                                                        <li className="flex items-start gap-2.5 text-[13px]">
                                                            <CheckCircle className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${isFree ? "text-tatt-gray/50" : "text-tatt-lime"}`} />
                                                            <span className={isFree ? "text-tatt-gray" : "text-foreground font-semibold"}>{plan.eventDiscountPercent}% off TATT Events</span>
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>

                                            {/* CTA */}
                                            <div className="mt-auto h-[54px] flex items-stretch">
                                                {isCurrentPlan ? (
                                                    <div className="w-full flex items-center justify-center gap-2 bg-background border border-tatt-bronze/30 rounded-xl text-tatt-bronze text-[10px] font-black uppercase tracking-widest">
                                                        ✓ Your Current Plan
                                                    </div>
                                                ) : isDowngrade ? (
                                                    <div className="w-full flex items-center justify-center px-4 bg-background border border-dashed border-border rounded-xl text-tatt-gray text-[10px] font-bold opacity-40 cursor-not-allowed">
                                                        Below your tier
                                                    </div>
                                                ) : isFree ? (
                                                    <div className="w-full flex items-center justify-center bg-background border border-dashed border-border rounded-xl text-tatt-gray text-[10px] font-bold opacity-40 cursor-not-allowed text-center">
                                                        Free Tier
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleSelectPlan(plan)}
                                                        className={`w-full rounded-xl font-black text-[11px] uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer
                                                            ${plan.isPopular
                                                                ? "bg-tatt-lime text-tatt-black hover:brightness-105 shadow-md"
                                                                : plan.tier === "KIONGOZI"
                                                                ? "bg-tatt-yellow text-tatt-black hover:brightness-105"
                                                                : "bg-tatt-black text-white hover:bg-foreground"
                                                            }
                                                        `}
                                                    >
                                                        Upgrade to {plan.name}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { icon: Shield, title: "Secure Payments", desc: "Powered by Stripe — PCI DSS compliant" },
                                { icon: Zap, title: "Instant Activation", desc: "Your tier upgrades immediately on payment" },
                                { icon: CheckCircle, title: "Cancel Anytime", desc: "No lock-ins. Manage your plan from Settings" },
                            ].map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.title} className="bg-surface rounded-2xl border border-border p-5 flex items-center gap-4">
                                        <div className="size-10 rounded-full bg-tatt-lime/10 flex items-center justify-center shrink-0">
                                            <Icon className="h-5 w-5 text-tatt-lime-dark" />
                                        </div>
                                        <div>
                                            <p className="font-black text-sm text-foreground">{item.title}</p>
                                            <p className="text-xs text-tatt-gray font-medium">{item.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
