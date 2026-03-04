"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Lock, Eye, EyeOff, CheckCircle, ArrowRight } from "lucide-react";
import api from "@/services/api";
import { useAuth } from "@/context/auth-context";
import { toast } from "react-hot-toast";

function CompleteRegistrationForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const { login } = useAuth();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error("Invalid registration link. Missing token.");
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }

        setLoading(true);
        try {
            const response = await api.post("/auth/org-member/complete-registration", {
                token,
                password
            });

            toast.success("Account activated successfully!");
            setSuccess(true);

            // Login and redirect
            if (response.data.access_token) {
                login(response.data.access_token, response.data.user);
                setTimeout(() => {
                    router.push("/admin");
                }, 2000);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to complete registration");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center space-y-6 animate-in zoom-in duration-500">
                <div className="size-20 bg-tatt-lime/20 text-tatt-lime rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle size={40} />
                </div>
                <h1 className="text-3xl font-black text-foreground">Account Activated!</h1>
                <p className="text-tatt-gray">Your password has been set and your account is now active. Redirecting you to the management portal...</p>
                <div className="flex justify-center">
                    <div className="size-8 border-4 border-tatt-lime border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[448px] animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="space-y-4 mb-10 text-center">
                <div className="size-16 bg-tatt-lime/10 text-tatt-lime rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Shield size={32} />
                </div>
                <h1 className="text-[42px] font-black leading-tight tracking-tight text-foreground">
                    Finalize Your Profile
                </h1>
                <p className="text-tatt-gray text-lg">
                    Create a secure password to activate your administrative access.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-tatt-gray uppercase tracking-widest ml-1">New Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-tatt-gray size-5 group-focus-within:text-tatt-lime transition-colors" />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="At least 8 characters"
                            className="w-full h-14 pl-12 pr-12 rounded-xl border border-border bg-background focus:ring-2 focus:ring-tatt-lime focus:border-tatt-lime outline-none transition-all font-medium"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-tatt-gray hover:text-tatt-lime transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-tatt-gray uppercase tracking-widest ml-1">Confirm Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-tatt-gray size-5 group-focus-within:text-tatt-lime transition-colors" />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Must match password"
                            className="w-full h-14 pl-12 pr-12 rounded-xl border border-border bg-background focus:ring-2 focus:ring-tatt-lime focus:border-tatt-lime outline-none transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading || !token}
                        className="w-full h-14 bg-tatt-lime text-tatt-black font-black rounded-xl shadow-lg shadow-tatt-lime/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-widest disabled:opacity-50"
                    >
                        {loading ? "Activating..." : (
                            <>
                                Activate Account
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </div>
            </form>

            <footer className="mt-12 pt-8 border-t border-border flex items-center justify-center gap-2">
                <div className="size-2 bg-tatt-lime rounded-full"></div>
                <p className="text-[10px] font-black uppercase tracking-[2px] text-tatt-gray">
                    Secure NGO Onboarding Portal
                </p>
            </footer>
        </div>
    );
}

export default function CompleteRegistrationPage() {
    return (
        <main className="min-h-screen bg-background flex items-center justify-center p-6">
            <Suspense fallback={<div className="text-tatt-gray">Loading...</div>}>
                <CompleteRegistrationForm />
            </Suspense>
        </main>
    );
}
