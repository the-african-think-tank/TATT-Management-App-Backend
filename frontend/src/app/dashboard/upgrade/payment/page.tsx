"use client";

import React, { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    CreditCard,
    MapPin,
    Lock,
    ArrowLeft,
    ShieldCheck,
    CheckCircle,
    Calendar,
    User,
    Loader2,
} from "lucide-react";
import api from "@/services/api";

// Format price cleanly — no floating-point artifacts
const fmt = (n: number) => {
    const rounded = Math.round(n * 100) / 100;
    return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(2);
};

function DashboardPaymentContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const planId = searchParams.get("plan") || "IMANI";
    const isYearly = searchParams.get("yearly") === "true";

    const [plans, setPlans] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

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
        const plan = plans.find((p) => p.tier === planId);
        if (!plan) return { name: planId, price: 0, period: isYearly ? "year" : "mo", features: [] };
        return {
            name: plan.name,
            price: isYearly ? plan.yearlyPrice : plan.monthlyPrice,
            period: isYearly ? "year" : "mo",
            features: plan.features ?? [],
        };
    }, [plans, planId, isYearly]);

    const handleCompletePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            await api.post("/billing/subscribe", {
                communityTier: planId,
                billingCycle: isYearly ? "YEARLY" : "MONTHLY",
                paymentMethodId: "pm_card_visa", // MOCK — replace with Stripe Elements
            });
            router.push(`/onboarding/success?plan=${planId}`);
        } catch (err: any) {
            console.error("Payment failed", err);
            setSubmitError(err?.response?.data?.message || "Payment failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-10 w-10 text-tatt-lime animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-8 max-w-5xl mx-auto animate-in fade-in duration-300">
            {/* Back button */}
            <button
                onClick={() => router.push("/dashboard/upgrade")}
                className="flex items-center gap-2 text-tatt-gray hover:text-tatt-lime transition-colors text-xs font-bold uppercase tracking-widest mb-8 group"
            >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Plans
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* ── Left: Forms ── */}
                <div className="lg:col-span-7 space-y-8">
                    <div>
                        <h1 className="text-3xl font-black text-foreground mb-1">Checkout</h1>
                        <p className="text-tatt-gray text-sm">
                            Complete your TATT <strong>{planDetails.name}</strong> subscription and unlock premium access.
                        </p>
                    </div>

                    <form onSubmit={handleCompletePayment} className="space-y-8">
                        {/* Payment Method */}
                        <section className="space-y-5">
                            <div className="flex items-center gap-3">
                                <span className="text-tatt-lime bg-tatt-lime/10 p-2 rounded-lg">
                                    <CreditCard className="h-5 w-5" />
                                </span>
                                <h2 className="text-lg font-bold text-foreground">Payment Method</h2>
                            </div>

                            <div className="space-y-4 p-5 border-2 border-tatt-lime rounded-2xl bg-tatt-lime/5">
                                <label className="text-sm font-bold text-foreground">Credit or Debit Card</label>

                                <div className="space-y-3">
                                    <div className="relative">
                                        <input
                                            className="w-full p-3 pl-10 border border-border rounded-xl focus:ring-2 focus:ring-tatt-lime focus:border-transparent outline-none transition-all bg-background text-foreground placeholder:text-tatt-gray"
                                            placeholder="Card number"
                                            type="text"
                                            required
                                        />
                                        <CreditCard className="absolute left-3 top-3.5 text-tatt-gray h-4 w-4" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="relative">
                                            <input
                                                className="w-full p-3 pl-10 border border-border rounded-xl focus:ring-2 focus:ring-tatt-lime outline-none bg-background text-foreground placeholder:text-tatt-gray"
                                                placeholder="MM / YY"
                                                type="text"
                                                required
                                            />
                                            <Calendar className="absolute left-3 top-3.5 text-tatt-gray h-4 w-4" />
                                        </div>
                                        <div className="relative">
                                            <input
                                                className="w-full p-3 pl-10 border border-border rounded-xl focus:ring-2 focus:ring-tatt-lime outline-none bg-background text-foreground placeholder:text-tatt-gray"
                                                placeholder="CVC"
                                                type="text"
                                                required
                                            />
                                            <Lock className="absolute left-3 top-3.5 text-tatt-gray h-4 w-4" />
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input
                                            className="w-full p-3 pl-10 border border-border rounded-xl focus:ring-2 focus:ring-tatt-lime outline-none bg-background text-foreground placeholder:text-tatt-gray"
                                            placeholder="Name on card"
                                            type="text"
                                            required
                                        />
                                        <User className="absolute left-3 top-3.5 text-tatt-gray h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Billing Address */}
                        <section className="space-y-5">
                            <div className="flex items-center gap-3">
                                <span className="text-tatt-lime bg-tatt-lime/10 p-2 rounded-lg">
                                    <MapPin className="h-5 w-5" />
                                </span>
                                <h2 className="text-lg font-bold text-foreground">Billing Address</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="md:col-span-2">
                                    <input
                                        className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-tatt-lime outline-none bg-background text-foreground placeholder:text-tatt-gray"
                                        placeholder="Street address"
                                        type="text"
                                        required
                                    />
                                </div>
                                <input className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-tatt-lime outline-none bg-background text-foreground placeholder:text-tatt-gray" placeholder="City" type="text" required />
                                <input className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-tatt-lime outline-none bg-background text-foreground placeholder:text-tatt-gray" placeholder="State / Province" type="text" required />
                                <input className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-tatt-lime outline-none bg-background text-foreground placeholder:text-tatt-gray" placeholder="Postal code" type="text" required />
                                <select className="w-full p-3 border border-border rounded-xl focus:ring-2 focus:ring-tatt-lime outline-none bg-background text-foreground">
                                    <option>United States</option>
                                    <option>Canada</option>
                                    <option>United Kingdom</option>
                                    <option>Nigeria</option>
                                    <option>Ghana</option>
                                    <option>South Africa</option>
                                    <option>Kenya</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <input defaultChecked className="w-4 h-4 rounded accent-tatt-lime" type="checkbox" id="same-billing" />
                                <label htmlFor="same-billing" className="text-sm font-medium text-tatt-gray">Same as shipping address</label>
                            </div>
                        </section>

                        {/* Error */}
                        {submitError && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                                {submitError}
                            </div>
                        )}

                        {/* Submit */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-tatt-lime hover:brightness-105 text-tatt-black font-black py-4 px-6 rounded-2xl transition-all shadow-md flex items-center justify-center gap-3 group disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                            >
                                {isSubmitting
                                    ? <Loader2 className="h-5 w-5 animate-spin" />
                                    : <ShieldCheck className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                }
                                {isSubmitting ? "Processing..." : "Complete Payment"}
                            </button>
                            <p className="text-center text-xs text-tatt-gray mt-3 flex items-center justify-center gap-1">
                                <Lock className="h-3 w-3" />
                                Secure SSL Encrypted Payment
                            </p>
                        </div>
                    </form>
                </div>

                {/* ── Right: Order Summary ── */}
                <div className="lg:col-span-5">
                    <div className="sticky top-6 space-y-5">
                        <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                            {/* Header strip */}
                            <div className="h-1 bg-tatt-lime w-full" />

                            <div className="p-6 relative">
                                <div className="absolute top-0 right-0 w-28 h-28 bg-tatt-lime/5 rounded-full -mr-12 -mt-12 pointer-events-none" />

                                <h3 className="text-base font-bold text-foreground mb-5">Order Summary</h3>

                                {/* Plan block */}
                                <div className="flex items-start gap-4 mb-5 p-4 bg-tatt-lime/5 border border-tatt-lime/20 rounded-xl">
                                    <div className="size-14 rounded-xl bg-tatt-lime/20 flex items-center justify-center shrink-0">
                                        <CheckCircle className="h-7 w-7 text-tatt-lime" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-foreground">TATT {planDetails.name}</p>
                                        <p className="text-tatt-lime font-bold text-lg mt-0.5">
                                            ${fmt(planDetails.price)}
                                            <span className="text-tatt-gray text-xs font-normal ml-1">/ {planDetails.period}</span>
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => router.push("/dashboard/upgrade")}
                                            className="text-xs font-bold text-tatt-gray hover:text-tatt-lime mt-1 underline underline-offset-4"
                                        >
                                            Change plan
                                        </button>
                                    </div>
                                </div>

                                {/* Features */}
                                {planDetails.features.length > 0 && (
                                    <ul className="space-y-2 mb-5 border-b border-border pb-5">
                                        {planDetails.features.map((feature: string, idx: number) => (
                                            <li key={idx} className="flex items-center gap-2 text-sm text-tatt-gray">
                                                <CheckCircle className="text-tatt-lime h-4 w-4 shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {/* Price breakdown */}
                                <div className="space-y-2 mb-5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-tatt-gray">Subtotal</span>
                                        <span className="font-medium text-foreground">${fmt(planDetails.price)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-tatt-gray">Tax (0%)</span>
                                        <span className="font-medium text-foreground">$0.00</span>
                                    </div>
                                    <div className="flex justify-between font-black text-lg pt-3 border-t border-border">
                                        <span className="text-foreground">Total Due</span>
                                        <span className="text-foreground">${fmt(planDetails.price)}</span>
                                    </div>
                                </div>

                                {/* Notice */}
                                <div className="p-3 bg-background rounded-xl border border-dashed border-border text-[10px] text-tatt-gray leading-relaxed uppercase tracking-tight">
                                    <span className="font-black text-foreground">Subscription Notice:</span>{" "}
                                    Your membership will automatically renew. Cancel anytime from Settings.
                                </div>
                            </div>
                        </div>

                        {/* Trust signals */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: ShieldCheck, label: "SSL Encrypted" },
                                { icon: Lock, label: "Stripe Secured" },
                            ].map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.label} className="flex items-center gap-2 bg-surface border border-border rounded-xl p-3">
                                        <Icon className="h-4 w-4 text-tatt-lime-dark shrink-0" />
                                        <span className="text-xs font-bold text-tatt-gray">{item.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DashboardPaymentPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-10 w-10 text-tatt-lime animate-spin" />
            </div>
        }>
            <DashboardPaymentContent />
        </Suspense>
    );
}
