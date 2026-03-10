"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { AuthButton } from "@/components/atoms/auth-button";
import { LoginField } from "@/components/molecules/login-field";
import api from "@/services/api";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Lock, Eye } from "lucide-react";

const resetPasswordSchema = z.object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) {
            setError("Invalid or missing reset token.");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            await api.post("/auth/password/reset", {
                token,
                newPassword: data.newPassword,
            });
            setIsSuccess(true);
        } catch (err: any) {
            console.error("Reset password error:", err);
            setError(err.response?.data?.message || "Failed to reset password. Link may be expired.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="space-y-6 text-center">
                <h1 className="text-3xl font-black text-tatt-black">Invalid Link</h1>
                <p className="text-base text-tatt-gray">
                    This password reset link is invalid or has expired. Please request a new one.
                </p>
                <div className="pt-4">
                    <Link
                        href="/forgot-password"
                        className="inline-flex items-center gap-2 text-sm font-bold text-tatt-black hover:underline decoration-tatt-lime"
                    >
                        Request New Link
                    </Link>
                </div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="space-y-6 text-center">
                <div className="flex justify-center">
                    <CheckCircle2 className="h-16 w-16 text-tatt-lime" />
                </div>
                <h1 className="text-3xl font-black text-tatt-black">Password Reset</h1>
                <p className="text-base text-tatt-gray">
                    Your password has been successfully reset. You can now use your new password to sign in.
                </p>
                <div className="pt-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-bold text-tatt-black hover:underline decoration-tatt-lime"
                    >
                        Go to Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <section className="w-full">
            <header className="space-y-2">
                <h1 className="text-[42px] font-black leading-[1.2] tracking-[-0.75px] text-tatt-black">
                    Reset Password
                </h1>
                <p className="text-base leading-6 text-tatt-gray">
                    Please enter your new password below.
                </p>
            </header>

            {error && (
                <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                    {error}
                </div>
            )}

            <form className="mt-10 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <LoginField
                    id="newPassword"
                    label="New Password"
                    placeholder="••••••••••••"
                    type="password"
                    leftIcon={<Lock className="h-4 w-4" />}
                    rightIcon={<Eye className="h-4 w-4" />}
                    error={errors.newPassword?.message}
                    {...register("newPassword")}
                />

                <LoginField
                    id="confirmPassword"
                    label="Confirm New Password"
                    placeholder="••••••••••••"
                    type="password"
                    leftIcon={<Lock className="h-4 w-4" />}
                    error={errors.confirmPassword?.message}
                    {...register("confirmPassword")}
                />

                <AuthButton disabled={isLoading}>
                    {isLoading ? "UPDATING PASSWORD..." : "RESET PASSWORD"}
                </AuthButton>
            </form>
        </section>
    );
}
