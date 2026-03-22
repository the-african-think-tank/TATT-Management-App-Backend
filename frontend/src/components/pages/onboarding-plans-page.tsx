"use client";

import { CheckCircle, Lock, Ban } from "lucide-react";
import { Footer, Navbar } from "@/components/organisms";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { useAuth } from "@/context/auth-context";


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

export function OnboardingPlansPage() {
    const [isYearly, setIsYearly] = useState(false);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { updateUser } = useAuth();


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

    const handleSelectPlan = async (planId: string, price: number) => {
        if (planId === "FREE") {
            try {
                // Call subscribe for FREE plan to record onboarding completion
                const resp = await api.post("/billing/subscribe", {
                    communityTier: "FREE",
                    billingCycle: "MONTHLY"
                });
                if (resp.data.user) {
                    updateUser(resp.data.user);
                }
                router.push("/onboarding/success?plan=FREE");
            } catch (err: any) {
                console.error("Failed to join free tier", err);
                // If it's a 404, we might be in a dev env where the route isn't updated, 
                // but let's try to proceed to success anyway if the user is already partially logged in
                // The dashboard layout will handle re-kicking them if really needed
                router.push("/onboarding/success?plan=FREE");
            }
        } else {
            router.push(`/onboarding/payment?plan=${planId}&yearly=${isYearly}`);
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col bg-background text-tatt-black">
            {/* Decorative Background Pattern */}
            <div className="absolute inset-0 african-pattern pointer-events-none opacity-5"></div>

            {/* Navigation */}
            <Navbar />

            <main className="relative z-10 flex-1 flex flex-col items-center px-4 py-12 lg:py-20">
                {/* Hero Text */}
                <div className="max-w-3xl text-center mb-10 sm:mb-16">
                    <span className="inline-block px-4 py-1 rounded-full bg-tatt-lime/20 text-tatt-lime-dark text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-4">
                        Membership Onboarding
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-4 sm:mb-6 px-2">
                        Empowering the Diaspora through Education, Authority, and Capital.
                    </h2>
                    <p className="text-tatt-gray text-base sm:text-lg max-w-2xl mx-auto px-4">
                        Join a collective of visionaries building the infrastructure for African economic excellence. Select the plan that matches your current growth stage.
                    </p>


                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center mt-10 gap-4">
                        <span className={`text-sm font-bold ${!isYearly ? 'text-tatt-black' : 'opacity-60'}`}>Monthly</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={isYearly}
                                onChange={() => setIsYearly(!isYearly)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tatt-lime"></div>
                        </label>
                        <span className={`text-sm font-bold ${isYearly ? 'text-tatt-black' : 'opacity-60'}`}>
                            Yearly <span className="text-tatt-lime bg-tatt-lime/10 px-2 py-0.5 rounded ml-1">Unlocked Discounts</span>
                        </span>
                    </div>
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl xl:grid-cols-4">
                    {isLoading ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tatt-lime"></div>
                            <p className="mt-4 text-tatt-gray font-bold">Loading membership plans...</p>
                        </div>
                    ) : (
                        plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`flex flex-col border rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden group ${plan.isPopular ? 'border-2 border-tatt-lime bg-white sm:scale-105 z-20' : 'bg-white border-border'
                                    }`}
                            >

                                {plan.isPopular && (
                                    <div className="absolute top-0 right-0 bg-tatt-lime text-tatt-black text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-lg">
                                        Most Popular
                                    </div>
                                )}
                                {(plan.monthlyPrice > 0 && isYearly && plan.hasYearlyDiscount && plan.yearlyDiscountPercent) && (
                                    <div className={`absolute ${plan.isPopular ? 'top-6' : 'top-0'} right-0 bg-tatt-lime/30 text-tatt-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-lg`}>
                                        Save {plan.yearlyDiscountPercent}%
                                    </div>
                                )}
                                <div className="mb-8">
                                    <h3 className={`text-2xl font-black mb-2 ${plan.tier === 'FREE' ? 'text-gray-500' : ''}`}>{plan.name}</h3>
                                    <p className="text-tatt-gray text-sm leading-relaxed mb-6">{plan.tagline}</p>
                                    <div className="flex items-baseline gap-1">
                                        {plan.activeDiscount ? (
                                            <div className="flex flex-col">
                                                <div className="flex items-baseline gap-2">
                                                    <span className={`text-4xl font-black ${plan.tier === 'FREE' ? 'text-gray-400' : plan.isPopular ? 'text-tatt-lime' : ''}`}>
                                                        ${isYearly 
                                                            ? (plan.activeDiscount.type === 'percentage' ? plan.yearlyPrice * (1 - plan.activeDiscount.value / 100) : Math.max(0, plan.yearlyPrice - plan.activeDiscount.value / 100))
                                                            : (plan.activeDiscount.type === 'percentage' ? plan.monthlyPrice * (1 - plan.activeDiscount.value / 100) : Math.max(0, plan.monthlyPrice - plan.activeDiscount.value / 100))
                                                        }
                                                    </span>
                                                    <span className="text-sm font-black text-tatt-gray line-through decoration-red-500/50">${isYearly ? plan.yearlyPrice : plan.monthlyPrice}</span>
                                                </div>
                                                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1">
                                                    {plan.activeDiscount.name} Applied 
                                                    {plan.activeDiscount.validUntil && ` • Ends ${new Date(plan.activeDiscount.validUntil).toLocaleDateString()}`}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className={`text-4xl font-black ${plan.tier === 'FREE' ? 'text-gray-400' : plan.isPopular ? 'text-tatt-lime' : ''}`}>
                                                ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                                            </span>
                                        )}
                                        <span className="text-tatt-gray font-bold">/{isYearly ? 'yr' : 'mo'}</span>
                                    </div>
                                </div>
                                <ul className="flex-1 flex flex-col gap-4 mb-8">
                                    {plan.features.map((feature, idx) => (
                                        <li key={`feat-${idx}`} className="flex items-start gap-3 text-sm">
                                            <CheckCircle className={`${plan.tier === 'FREE' ? 'text-gray-400' : 'text-tatt-lime'} h-5 w-5 shrink-0`} />
                                            <span className={plan.isPopular ? 'font-semibold' : ''}>{feature}</span>
                                        </li>
                                    ))}
                                    {plan.accessControls?.filter(c => c.enabled).map((control, idx) => (
                                        <li key={`ctrl-${idx}`} className="flex items-start gap-3 text-sm">
                                            <CheckCircle className={`text-tatt-lime h-5 w-5 shrink-0`} />
                                            <span className={plan.isPopular ? 'font-semibold' : ''}>{control.title}</span>
                                        </li>
                                    ))}
                                    {plan.eventDiscountPercent !== undefined && plan.eventDiscountPercent > 0 && (
                                        <li className="flex items-start gap-3 text-sm">
                                            <CheckCircle className={`text-tatt-lime h-5 w-5 shrink-0`} />
                                            <span className={plan.isPopular ? 'font-semibold' : ''}>{plan.eventDiscountPercent}% off TATT Events</span>
                                        </li>
                                    )}
                                </ul>
                                <button
                                    onClick={() => handleSelectPlan(plan.tier, plan.monthlyPrice)}
                                    className={`w-full py-4 rounded-lg font-black text-sm uppercase tracking-wider transition-all ${plan.tier === 'FREE'
                                        ? 'bg-white border border-border text-gray-500 hover:bg-gray-100'
                                        : plan.isPopular
                                            ? 'bg-tatt-lime text-tatt-black hover:brightness-110 shadow-lg shadow-tatt-lime/20'
                                            : 'bg-gray-100 text-tatt-black group-hover:bg-tatt-lime'
                                        }`}
                                >
                                    {plan.tier === 'FREE' ? 'Join for Free' : `Choose ${plan.name}`}
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Trust Bar */}
                <div className="mt-20 flex flex-col items-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-tatt-gray mb-8">Trusted by Community Leaders Worldwide</p>
                    <div className="flex flex-wrap justify-center gap-10 opacity-30 grayscale contrast-125">
                        <div className="h-8 w-24 bg-gray-400 rounded"></div>
                        <div className="h-8 w-24 bg-gray-400 rounded"></div>
                        <div className="h-8 w-24 bg-gray-400 rounded"></div>
                        <div className="h-8 w-24 bg-gray-400 rounded"></div>
                    </div>
                </div>
            </main>

            <Footer />

            <style jsx>{`
        .african-pattern {
          background-image: radial-gradient(#9fcc00 0.5px, transparent 0.5px), radial-gradient(#9fcc00 0.5px, #f8f8f5 0.5px);
          background-size: 20px 20px;
          background-position: 0 0, 10px 10px;
        }
      `}</style>
        </div>
    );
}
