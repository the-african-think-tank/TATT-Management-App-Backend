"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    CreditCard,
    MapPin,
    Lock,
    ArrowLeft,
    ShieldCheck,
    CheckCircle,
    Calendar,
    User
} from "lucide-react";
import { Footer, Navbar } from "@/components/organisms";
import api from "@/services/api";

export function OnboardingPaymentPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const planId = searchParams.get("plan") || "IMANI";
    const isYearly = searchParams.get("yearly") === "true";

    const [plans, setPlans] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    const planDetails = useMemo(() => {
        const plan = plans.find(p => p.tier === planId);
        if (!plan) return { name: planId, price: 0, period: isYearly ? "year" : "mo" };
        return {
            name: plan.name,
            price: isYearly ? plan.yearlyPrice : plan.monthlyPrice,
            period: isYearly ? "year" : "mo"
        };
    }, [plans, planId, isYearly]);

    const handleCompletePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/billing/subscribe", {
                communityTier: planId,
                billingCycle: isYearly ? "YEARLY" : "MONTHLY",
                paymentMethodId: "pm_card_visa", // MOCK - In production, use Stripe Elements
            });
            router.push(`/onboarding/success?plan=${planId}`);
        } catch (err) {
            console.error("Payment failed", err);
            // Handle error (e.g., show toast)
        }
    };

    return (
        <div className="bg-background text-tatt-black min-h-screen flex flex-col">
            {/* Header Navigation */}
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow">
                {/* Progress Steps */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-tatt-lime">Step 2 of 3</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-tatt-lime">66% Complete</span>
                    </div>
                    <div className="w-full bg-tatt-lime/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-tatt-lime h-full w-2/3 transition-all duration-500"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Checkout Forms */}
                    <div className="lg:col-span-7 space-y-10">
                        <section>
                            <button
                                onClick={() => router.push('/onboarding/plans')}
                                className="text-xs font-bold text-tatt-gray hover:text-tatt-lime transition-colors flex items-center gap-1 mb-6 uppercase tracking-widest group"
                            >
                                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                Back to Plans
                            </button>
                            <h1 className="text-4xl font-black mb-2">Checkout</h1>
                            <p className="text-tatt-gray">Complete your TATT {planDetails.name} subscription and unlock premium access.</p>
                        </section>

                        <form onSubmit={handleCompletePayment} className="space-y-10">
                            {/* Payment Method Section */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-tatt-lime bg-tatt-lime/10 p-2 rounded-lg">
                                        <CreditCard className="h-6 w-6" />
                                    </span>
                                    <h2 className="text-xl font-bold">Payment Method</h2>
                                </div>

                                <div className="space-y-4 p-6 border-2 border-tatt-lime rounded-xl bg-tatt-lime/5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-bold">Credit or Debit Card</label>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="relative">
                                            <input
                                                className="w-full p-3 pl-10 border border-border rounded-lg focus:ring-2 focus:ring-tatt-lime focus:border-transparent outline-none transition-all"
                                                placeholder="Card number"
                                                type="text"
                                                required
                                            />
                                            <CreditCard className="absolute left-3 top-3.5 text-tatt-gray h-4 w-4" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="relative">
                                                <input
                                                    className="w-full p-3 pl-10 border border-border rounded-lg focus:ring-2 focus:ring-tatt-lime focus:border-transparent outline-none"
                                                    placeholder="MM / YY"
                                                    type="text"
                                                    required
                                                />
                                                <Calendar className="absolute left-3 top-3.5 text-tatt-gray h-4 w-4" />
                                            </div>
                                            <div className="relative">
                                                <input
                                                    className="w-full p-3 pl-10 border border-border rounded-lg focus:ring-2 focus:ring-tatt-lime focus:border-transparent outline-none"
                                                    placeholder="CVC"
                                                    type="text"
                                                    required
                                                />
                                                <Lock className="absolute left-3 top-3.5 text-tatt-gray h-4 w-4" />
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <input
                                                className="w-full p-3 pl-10 border border-border rounded-lg focus:ring-2 focus:ring-tatt-lime focus:border-transparent outline-none"
                                                placeholder="Name on card"
                                                type="text"
                                                required
                                            />
                                            <User className="absolute left-3 top-3.5 text-tatt-gray h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Billing Address Section */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-tatt-lime bg-tatt-lime/10 p-2 rounded-lg">
                                        <MapPin className="h-6 w-6" />
                                    </span>
                                    <h2 className="text-xl font-bold">Billing Address</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <input className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-tatt-lime focus:border-transparent outline-none" placeholder="Street address" type="text" required />
                                    </div>
                                    <input className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-tatt-lime focus:border-transparent outline-none" placeholder="City" type="text" required />
                                    <input className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-tatt-lime focus:border-transparent outline-none" placeholder="State / Province" type="text" required />
                                    <input className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-tatt-lime focus:border-transparent outline-none" placeholder="Postal code" type="text" required />
                                    <select className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-tatt-lime focus:border-transparent outline-none bg-white">
                                        <option>United States</option>
                                        <option>Canada</option>
                                        <option>United Kingdom</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <input defaultChecked className="w-5 h-5 rounded text-tatt-lime border-border focus:ring-tatt-lime" type="checkbox" id="same-billing" />
                                    <label htmlFor="same-billing" className="text-sm font-medium text-tatt-gray">Billing address is same as shipping</label>
                                </div>
                            </section>

                            {/* CTA */}
                            <div className="pt-6">
                                <button type="submit" className="w-full bg-tatt-lime hover:brightness-105 text-tatt-black font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-tatt-lime/20 flex items-center justify-center gap-3 group">
                                    <ShieldCheck className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                    Pay and Complete Onboarding
                                </button>
                                <p className="text-center text-xs text-tatt-gray mt-4 flex items-center justify-center gap-1">
                                    <Lock className="h-3 w-3" />
                                    Secure SSL Encrypted Payment Process
                                </p>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Sidebar Summary */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-border overflow-hidden relative">
                                {/* Decorative element */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-tatt-lime/5 rounded-full -mr-16 -mt-16"></div>

                                <div className="relative z-10">
                                    <h3 className="text-lg font-bold mb-4">Order Summary</h3>
                                    <div className="flex items-start gap-4 mb-6 p-4 bg-tatt-lime/5 rounded-xl">
                                        <div className="w-20 h-20 rounded-lg bg-tatt-lime/20 flex items-center justify-center shrink-0">
                                            <CheckCircle className="h-10 w-10 text-tatt-lime" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-lg">TATT {planDetails.name} Access</p>
                                            <p className="text-tatt-lime font-bold">${planDetails.price}.00 <span className="text-tatt-gray text-xs font-normal">/ {planDetails.period}</span></p>
                                            <button
                                                onClick={() => router.push('/onboarding/plans')}
                                                className="text-xs font-bold text-tatt-gray hover:text-tatt-lime mt-1 underline decoration-tatt-lime/30 underline-offset-4"
                                            >
                                                Change plan
                                            </button>
                                        </div>
                                    </div>

                                    <ul className="space-y-3 mb-8 border-b border-border pb-6">
                                        {plans.find(p => p.tier === planId)?.features.map((feature: string, idx: number) => (
                                            <li key={idx} className="flex items-center gap-2 text-sm text-tatt-gray">
                                                <CheckCircle className="text-tatt-lime h-5 w-5" />
                                                {feature}
                                            </li>
                                        )) || (
                                                <>
                                                    <li className="flex items-center gap-2 text-sm text-tatt-gray">
                                                        <CheckCircle className="text-tatt-lime h-5 w-5" />
                                                        Unlimited access to all premium assets
                                                    </li>
                                                    <li className="flex items-center gap-2 text-sm text-tatt-gray">
                                                        <CheckCircle className="text-tatt-lime h-5 w-5" />
                                                        Priority support & monthly workshops
                                                    </li>
                                                </>
                                            )}
                                    </ul>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-tatt-gray">Subtotal</span>
                                            <span className="font-medium">${planDetails.price}.00</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-tatt-gray">Tax (0%)</span>
                                            <span className="font-medium">$0.00</span>
                                        </div>
                                        <div className="flex justify-between text-xl font-black pt-3 border-t border-border">
                                            <span>Total Due</span>
                                            <span>${planDetails.price}.00</span>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-gray-50 rounded-lg border border-dashed border-border text-[10px] text-tatt-gray leading-relaxed uppercase tracking-tighter">
                                        <span className="font-bold text-tatt-black">Subscription Notice:</span>
                                        Your membership will automatically renew at the same price. You can cancel anytime in your account settings.
                                    </div>
                                </div>
                            </div>

                            {/* Trust Signals */}
                            <div className="flex items-center justify-between px-4 grayscale opacity-50 contrast-125">
                                {/* Trust logos would go here */}
                                <div className="h-6 w-12 bg-gray-400 rounded"></div>
                                <div className="h-6 w-12 bg-gray-400 rounded"></div>
                                <div className="h-6 w-12 bg-gray-400 rounded"></div>
                                <div className="h-6 w-12 bg-gray-400 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
