"use client";

import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AuthButton } from "@/components/atoms/auth-button";
import { JoinAsSelector } from "@/components/molecules/join-as-selector";
import { SignupField } from "@/components/molecules/signup-field";
import api from "@/services/api";
import { useAuth } from "@/context/auth-context";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

// ─── Password validation rules ──────────────────────────────────────────────
const PASSWORD_RULES = [
  { id: "length",    label: "At least 8 characters",          test: (p: string) => p.length >= 8 },
  { id: "uppercase", label: "At least one uppercase letter",   test: (p: string) => /[A-Z]/.test(p) },
  { id: "lowercase", label: "At least one lowercase letter",   test: (p: string) => /[a-z]/.test(p) },
  { id: "number",    label: "At least one number",             test: (p: string) => /\d/.test(p) },
  { id: "special",   label: "At least one special character",  test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function getPasswordStrength(password: string): { score: number; label: string; color: string; barColor: string } {
  if (!password) return { score: 0, label: "", color: "text-transparent", barColor: "bg-transparent" };
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  if (passed <= 1) return { score: 1, label: "Very Weak", color: "text-red-500", barColor: "bg-red-500" };
  if (passed === 2) return { score: 2, label: "Weak",      color: "text-orange-500", barColor: "bg-orange-400" };
  if (passed === 3) return { score: 3, label: "Fair",      color: "text-yellow-500", barColor: "bg-yellow-400" };
  if (passed === 4) return { score: 4, label: "Strong",    color: "text-tatt-lime", barColor: "bg-tatt-lime" };
  return              { score: 5, label: "Very Strong", color: "text-green-600",  barColor: "bg-green-500" };
}

// ─── Password strength meter component ───────────────────────────────────────
function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i <= strength.score ? strength.barColor : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <span className={`text-[11px] font-bold uppercase tracking-wide shrink-0 ${strength.color}`}>
          {strength.label}
        </span>
      </div>
      {/* Rule checklist */}
      <ul className="grid grid-cols-1 gap-0.5">
        {PASSWORD_RULES.map((rule) => {
          const passed = rule.test(password);
          return (
            <li key={rule.id} className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${passed ? "text-green-600" : "text-gray-400"}`}>
              {passed
                ? <CheckCircle className="size-3 shrink-0" />
                : <XCircle className="size-3 shrink-0" />
              }
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── Zod schema ─────────────────────────────────────────────────────────────
const signupSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name is too long")
    .regex(/^[A-Za-z\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name is too long")
    .regex(/^[A-Za-z\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes"),
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address (e.g. you@example.com)")
    .max(100, "Email address is too long"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z
    .string()
    .min(1, "Please confirm your password"),
  joinAs: z.enum(["MEMBER", "VOLUNTEER"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

// ─── Component ───────────────────────────────────────────────────────────────
export function SignupForm() {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
    defaultValues: { joinAs: "MEMBER" },
  });

  const passwordValue = watch("password") || "";

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/signup/community", {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        communityTier: "FREE",
      });

      if (response.data.message) {
        toast.success(response.data.message);
      }

      if (response.data.access_token) {
        authLogin(response.data.access_token, response.data.user);
        router.push("/onboarding/plans");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      const status = err.response?.status;
      const msg = err.response?.data?.message;
      if (status === 409) {
        setError(msg || "This email is already registered. Please sign in or use a different email.");
      } else {
        setError(Array.isArray(msg) ? msg[0] : msg || "Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full max-w-[448px]">
      <header className="space-y-2">
        <h1 className="text-[30px] sm:text-[42px] font-black leading-[1.2] tracking-[-0.75px] text-tatt-black">
          Create Your Account
        </h1>
        <p className="text-sm sm:text-base leading-6 text-tatt-gray">
          Step into a world of collective intelligence and impact.
        </p>
      </header>

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-start gap-2">
          <span className="mt-0.5 shrink-0">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form className="mt-10 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Controller
          name="joinAs"
          control={control}
          render={({ field }) => (
            <JoinAsSelector value={field.value} onChange={field.onChange} />
          )}
        />

        <div className="space-y-4">
          {/* Name row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SignupField
              id="firstName"
              label="First Name"
              placeholder="e.g. Your first name"
              autoComplete="given-name"
              error={errors.firstName?.message}
              {...register("firstName")}
            />
            <SignupField
              id="lastName"
              label="Last Name"
              placeholder="e.g. Your last name"
              autoComplete="family-name"
              error={errors.lastName?.message}
              {...register("lastName")}
            />
          </div>

          {/* Email */}
          <SignupField
            id="email"
            label="Email Address"
            placeholder="your.email@example.com"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium leading-5 text-tatt-black">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 pr-11 text-sm placeholder:text-gray-400 focus:border-tatt-lime focus:outline-none focus:ring-2 focus:ring-tatt-lime/20 transition-all"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-tatt-black transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
            {/* Strength meter — shown as you type */}
            <PasswordStrengthMeter password={passwordValue} />
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="block text-sm font-medium leading-5 text-tatt-black">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 pr-11 text-sm placeholder:text-gray-400 focus:border-tatt-lime focus:outline-none focus:ring-2 focus:ring-tatt-lime/20 transition-all"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-tatt-black transition-colors"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        {/* Terms & Privacy */}
        <label className="flex items-start gap-3 py-2 text-sm leading-5 text-tatt-gray cursor-pointer group">
          <input
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 rounded-[4px] border border-border bg-surface accent-tatt-lime shrink-0"
          />
          <span>
            I agree to the{" "}
            <a
              href="https://www.theafricanthinktank.com/terms-and-conditions"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-tatt-black underline decoration-tatt-lime hover:opacity-80 transition-opacity"
            >
              Terms of Service
            </a>
            {" "}and{" "}
            <a
              href="https://www.theafricanthinktank.com/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-tatt-black underline decoration-tatt-lime hover:opacity-80 transition-opacity"
            >
              Privacy Policy
            </a>
            .
          </span>
        </label>

        <AuthButton
          disabled={isLoading}
          className="shadow-[0_10px_15px_-3px_rgba(159,204,0,0.2),0_4px_6px_-4px_rgba(159,204,0,0.2)]"
        >
          {isLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
        </AuthButton>

        <p className="text-center text-sm text-tatt-gray">
          Already have an account?{" "}
          <a href="/" className="font-bold text-tatt-black hover:underline decoration-tatt-lime">
            Log in here
          </a>
        </p>
      </form>

      <div className="mt-10 border-t border-[#f5f5f0] pt-10 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-tatt-gray">
          In partnership with
        </p>
        <div className="mt-4 flex items-center justify-center gap-6 opacity-30">
          <span className="h-6 w-20 rounded-[2px] bg-tatt-black" />
          <span className="h-6 w-16 rounded-[2px] bg-tatt-black" />
          <span className="h-6 w-24 rounded-[2px] bg-tatt-black" />
        </div>
      </div>
    </section>
  );
}
