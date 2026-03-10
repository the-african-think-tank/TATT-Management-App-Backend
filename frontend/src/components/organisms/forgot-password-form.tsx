"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { AuthButton } from "@/components/atoms/auth-button";
import { LoginField } from "@/components/molecules/login-field";
import api from "@/services/api";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true);
        setError(null);
        try {
            await api.post("/auth/password/forgot", data);
            setIsSubmitted(true);
        } catch (err: any) {
            console.error("Forgot password error:", err);
            setError(err.response?.data?.message || "Failed to send reset email. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="space-y-6 text-center">
                <div className="flex justify-center">
                    <CheckCircle2 className="h-16 w-16 text-tatt-lime" />
                </div>
                <h1 className="text-3xl font-black text-tatt-black">Check your email</h1>
                <p className="text-base text-tatt-gray">
                    We&apos;ve sent a password reset link to your email address. Please follow the instructions to reset your password.
                </p>
                <div className="pt-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-bold text-tatt-black hover:underline decoration-tatt-lime"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <section className="w-full">
            <header className="space-y-2">
                <h1 className="text-[42px] font-black leading-[1.2] tracking-[-0.75px] text-tatt-black">
                    Forgot Password
                </h1>
                <p className="text-base leading-6 text-tatt-gray">
                    Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
            </header>

            {error && (
                <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                    {error}
                </div>
            )}

            <form className="mt-10 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <LoginField
                    id="email"
                    label="Email Address"
                    placeholder="m.garvey@africanthinktank.org"
                    type="email"
                    leftIcon={<Mail className="h-4 w-4" />}
                    error={errors.email?.message}
                    {...register("email")}
                />

                <AuthButton disabled={isLoading}>
                    {isLoading ? "SENDING LINK..." : "SEND RESET LINK"}
                </AuthButton>
            </form>

            <div className="mt-8 text-center">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-bold text-tatt-black hover:underline decoration-tatt-lime"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Sign In
                </Link>
            </div>
        </section>
    );
}
