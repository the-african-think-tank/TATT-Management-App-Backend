"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/services/api";
import {
    Check,
    ArrowRight,
    LayoutDashboard,
    Rss,
    Sparkles,
    ShieldCheck,
    User,
    HeartHandshake
} from "lucide-react";
import { Footer, Navbar } from "@/components/organisms";
import { useAuth } from "@/context/auth-context";

export function OnboardingSuccessPage() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const planId = searchParams.get("plan") || "FREE";
    const [plans, setPlans] = useState<any[]>([]);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const resp = await api.get("/billing/plans");
                setPlans(resp.data);
            } catch (err) {
                console.error("Failed to fetch plans", err);
            }
        };
        fetchPlans();
    }, []);

    const planName = useMemo(() => {
        const plan = plans.find(p => p.tier === planId);
        if (plan) return plan.name;
        return planId.charAt(0) + planId.slice(1).toLowerCase();
    }, [plans, planId]);

    return (
        <div className="bg-background text-tatt-black min-h-screen flex flex-col">
            {/* Header */}
            <Navbar />

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center p-6 md:p-12 bg-pattern">
                <div className="max-w-4xl w-full bg-white rounded-xl shadow-xl overflow-hidden animate-scale-in flex flex-col md:flex-row border border-border">
                    {/* Left Column: Celebration Content */}
                    <div className="flex-1 p-8 md:p-12 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-border">
                        {/* Success Icon */}
                        <div className="mb-6 w-20 h-20 bg-tatt-lime rounded-full flex items-center justify-center shadow-lg shadow-tatt-lime/20">
                            <Check className="h-10 w-10 text-tatt-black stroke-[3px]" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight text-tatt-black">
                            Welcome to the <br />
                            <span className="text-tatt-lime uppercase">TATT Community, {user?.firstName || 'Friend'}!</span>
                        </h1>
                        <p className="text-tatt-gray text-lg mb-8 max-w-sm">
                            Your {planName} Tier subscription is confirmed. You now have full access to our premium network and resources.
                        </p>
                        <div className="w-full flex flex-col gap-4">
                            <a
                                href="/dashboard"
                                className="w-full py-4 bg-tatt-lime text-tatt-black font-bold rounded-lg hover:brightness-105 transition-all flex items-center justify-center gap-2 shadow-lg shadow-tatt-lime/20"
                            >
                                Go to My Dashboard
                                <LayoutDashboard className="h-5 w-5" />
                            </a>
                            <a
                                href="/dashboard/feed"
                                className="w-full py-4 border-2 border-tatt-black text-tatt-black font-bold rounded-lg hover:bg-tatt-black hover:text-white transition-all text-center"
                            >
                                View TATT Feed
                            </a>
                        </div>
                    </div>

                    {/* Right Column: Subscription Summary */}
                    <div className="flex-1 bg-gray-50 p-8 md:p-12 flex flex-col">
                        <h2 className="text-sm font-bold text-tatt-gray uppercase tracking-widest mb-6">Membership Details</h2>
                        <div className="bg-white p-4 rounded-lg mb-8 flex items-center gap-4 shadow-sm border border-border">
                            <div className="w-12 h-12 bg-tatt-lime/10 rounded-lg flex items-center justify-center text-tatt-lime">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="font-bold text-lg">{planName} Tier</div>
                                <div className="text-tatt-gray text-sm font-medium">Premium Access Activated</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-tatt-gray uppercase tracking-widest mb-2">Benefits Now Active</h3>
                            <div className="flex items-start gap-3">
                                <div className="mt-1 flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                    <Check className="h-3 w-3 text-green-600 stroke-[4px]" />
                                </div>
                                <span className="text-sm font-medium">Unlimited access to premium assets</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1 flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                    <Check className="h-3 w-3 text-green-600 stroke-[4px]" />
                                </div>
                                <span className="text-sm font-medium">Priority support & monthly workshops</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1 flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                    <Check className="h-3 w-3 text-green-600 stroke-[4px]" />
                                </div>
                                <span className="text-sm font-medium">Commercial usage license included</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1 flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                    <Check className="h-3 w-3 text-green-600 stroke-[4px]" />
                                </div>
                                <span className="text-sm font-medium">Member-only community forum access</span>
                            </div>
                        </div>

                        {/* Order Detail Muted */}
                        <div className="mt-auto pt-8 border-t border-border mt-8">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-tatt-gray">Order Status:</span>
                                <span className="font-bold text-green-600">PAID & ACTIVE</span>
                            </div>
                            <div className="text-[10px] text-tatt-gray uppercase tracking-tight">
                                Billing Cycle Initiated
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />

            <style jsx>{`
        .bg-pattern {
          background-image: radial-gradient(circle at 2px 2px, rgba(159, 204, 0, 0.1) 1px, transparent 0);
          background-size: 24px 24px;
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scaleIn 0.5s ease-out forwards;
        }
      `}</style>
        </div>
    );
}
