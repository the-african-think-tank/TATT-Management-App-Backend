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
    const [isYearly, setIsYearly] = useState(true);

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
                setPlans(resp.data);
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

    // Format a price to at most 2 decimal places, dropping trailing zeros
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

                    {/* Current tier pill */}
                    <div className="mt-7 inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/50 text-xs font-bold uppercase tracking-widest px-5 py-2 rounded-full">
                        <Shield className="h-3.5 w-3.5" />
                        Current tier: {user.communityTier ?? "FREE"}
                    </div>

                    {/* Billing toggle */}
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
                                Save 20% + 1 Month Free
                            </span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Plans grid */}
            <div className="max-w-6xl mx-auto px-6 py-12">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <Loader2 className="h-10 w-10 text-tatt-lime animate-spin mb-4" />
                        <p className="text-tatt-gray font-bold">Loading membership plans...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
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
                                                ? "border-tatt-lime bg-surface scale-[1.02] shadow-lg z-10"
                                                : "border-border bg-surface hover:border-tatt-lime/40 hover:shadow-md"
                                            }
                                            ${isCurrentPlan ? "ring-2 ring-tatt-bronze/50" : ""}
                                        `}
                                    >
                                        {/* Top accent strip */}
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

                                        {/* Badges */}
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
                                        {isYearly && plan.hasYearlyDiscount && !plan.isPopular && (
                                            <div className="absolute top-0 right-0 bg-tatt-lime/20 border-b border-l border-tatt-lime/30 text-tatt-lime-dark text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">
                                                1 Month Free
                                            </div>
                                        )}
                                        {isYearly && plan.hasYearlyDiscount && plan.isPopular && (
                                            <div className="absolute top-7 right-0 bg-tatt-lime/20 border-b border-l border-tatt-lime/30 text-tatt-lime-dark text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">
                                                1 Month Free
                                            </div>
                                        )}

                                        <div className="p-6 flex-1 flex flex-col">
                                            {/* Plan name + tagline */}
                                            <div className="mb-5">
                                                <h2 className={`text-xl font-black tracking-tight ${isFree ? "text-tatt-gray" : "text-foreground"}`}>
                                                    {plan.name}
                                                </h2>
                                                <p className="text-tatt-gray text-sm mt-1 leading-relaxed">{plan.tagline}</p>
                                            </div>

                                            {/* Price */}
                                            <div className="mb-6">
                                                <div className="flex items-baseline gap-1">
                                                    {plan.activeDiscount ? (
                                                        <div className="flex flex-col">
                                                            <div className="flex items-baseline gap-2">
                                                                <span className={`text-4xl font-black ${isFree ? "text-tatt-gray" : plan.isPopular ? "text-tatt-lime" : "text-foreground"}`}>
                                                                    ${fmt(isYearly 
                                                                        ? (plan.activeDiscount.type === 'percentage' ? displayPrice * (1 - plan.activeDiscount.value / 100) : Math.max(0, displayPrice - plan.activeDiscount.value / 100))
                                                                        : (plan.activeDiscount.type === 'percentage' ? displayPrice * (1 - plan.activeDiscount.value / 100) : Math.max(0, displayPrice - plan.activeDiscount.value / 100))
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
                                                {!isFree && isYearly && plan.hasYearlyDiscount && !plan.activeDiscount && (
                                                    <p className="text-xs text-tatt-gray mt-1">
                                                        <span className="line-through">${fmt(plan.monthlyPrice * 12)}/yr</span>
                                                        {" → "}
                                                        <span className="font-black text-tatt-lime-dark">${fmt(plan.yearlyPrice)}/yr</span>
                                                    </p>
                                                )}
                                            </div>

                                            {/* Features */}
                                            <ul className="flex-1 space-y-3 mb-6">
                                                {plan.features.map((feature, idx) => (
                                                    <li key={idx} className="flex items-start gap-2.5 text-sm">
                                                        <CheckCircle className={`h-4 w-4 shrink-0 mt-0.5 ${isFree ? "text-tatt-gray/50" : "text-tatt-lime"}`} />
                                                        <span className={isFree ? "text-tatt-gray" : "text-foreground font-medium"}>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            {/* CTA */}
                                            {isCurrentPlan ? (
                                                <div className="flex items-center justify-center gap-2 py-3.5 bg-background border border-tatt-bronze/30 rounded-xl text-tatt-bronze text-xs font-black uppercase tracking-widest">
                                                    ✓ Your Current Plan
                                                </div>
                                            ) : isDowngrade ? (
                                                <div className="flex items-center justify-center py-3.5 bg-background border border-dashed border-border rounded-xl text-tatt-gray text-xs font-bold opacity-40 cursor-not-allowed">
                                                    Below your current tier
                                                </div>
                                            ) : isFree ? (
                                                <div className="flex items-center justify-center py-3.5 bg-background border border-dashed border-border rounded-xl text-tatt-gray text-xs font-bold opacity-40 cursor-not-allowed">
                                                    Free Tier
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleSelectPlan(plan)}
                                                    className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer
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
                                );
                            })}
                        </div>

                        {/* Trust row */}
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
