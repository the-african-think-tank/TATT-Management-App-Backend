"use client";

import { ResetPasswordForm } from "@/components/organisms/reset-password-form";
import { LoginPromoPanel } from "@/components/organisms/login-promo-panel";
import { Navbar, Footer } from "@/components/organisms";
import { Suspense } from "react";
import Link from "next/link";
import { useTermsModal } from "@/context/terms-context";


export default function ResetPasswordPage() {
    const { showTerms } = useTermsModal();
    return (

        <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1 shrink-0">
                <main className="grid h-full w-full grid-cols-1 bg-[#f8f8f5] lg:grid-cols-[1.05fr_1fr]">
                    <LoginPromoPanel />

                    <section className="flex h-full min-h-[600px] flex-col bg-white px-6 py-10 sm:px-10 lg:px-20 lg:py-12 xl:px-24">
                        <div className="flex flex-1 items-center justify-center">
                            <div className="w-full max-w-[448px]">
                                <Suspense fallback={<div>Loading...</div>}>
                                    <ResetPasswordForm />
                                </Suspense>
                            </div>
                        </div>

                        <footer className="flex items-center justify-center gap-4 border-t border-[#f0f0ea] pt-8 text-xs text-[#8c8c5f]">
                            <a href="#" className="hover:underline">
                                Privacy Policy
                            </a>
                            <span>•</span>
                            <button onClick={showTerms} className="hover:underline">
                                Terms of Service
                            </button>
                            <span>•</span>
                            <a href="#" className="hover:underline">
                                Contact Support
                            </a>
                        </footer>
                    </section>
                </main>
            </div>
            <Footer />
        </div>
    );
}
