"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthButton } from "@/components/atoms/auth-button";
import { JoinAsSelector } from "@/components/molecules/join-as-selector";
import { SignupField } from "@/components/molecules/signup-field";
import api from "@/services/api";
import { useAuth } from "@/context/auth-context";

import { toast } from "react-hot-toast";

const signupSchema = z.object({
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is too short"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  joinAs: z.enum(["MEMBER", "VOLUNTEER"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm() {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      joinAs: "MEMBER",
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      // For now, we always signup as a community member
      // Tier is FREE by default in this basic form
      const response = await api.post("/auth/signup/community", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        communityTier: "FREE",
      });

      console.log("Signup success:", response.data);

      if (response.data.message) {
        toast.success(response.data.message);
      }

      // If they chose volunteer, we could redirect them to a volunteer application form 
      // after they are logged in or just show a message.

      setSuccess(true);
      // Store token if returned
      if (response.data.access_token) {
        authLogin(response.data.access_token, response.data.user);
        router.push("/onboarding/plans");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      const status = err.response?.status;
      const msg = err.response?.data?.message;
      if (status === 409) {
        setError(msg || "This email is already registered. Sign in or use a different email.");
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
        <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <form className="mt-10 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="joinAs"
          control={control}
          render={({ field }) => (
            <JoinAsSelector value={field.value} onChange={field.onChange} />
          )}
        />

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SignupField
              id="firstName"
              label="First Name"
              placeholder="Kwame"
              error={errors.firstName?.message}
              {...register("firstName")}
            />
            <SignupField
              id="lastName"
              label="Last Name"
              placeholder="Mensah"
              error={errors.lastName?.message}
              {...register("lastName")}
            />
          </div>
          <SignupField
            id="email"
            label="Email Address"
            placeholder="kwame@example.com"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SignupField
              id="password"
              label="Password"
              placeholder="••••••••"
              type="password"
              error={errors.password?.message}
              {...register("password")}
            />
            <SignupField
              id="confirmPassword"
              label="Confirm"
              placeholder="••••••••"
              type="password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
          </div>
        </div>

        <label className="flex items-start gap-3 py-2 text-sm leading-5 text-tatt-gray">
          <input
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 rounded-[4px] border border-border bg-surface accent-tatt-lime"
          />
          <span>
            I agree to the{" "}
            <a href="#" className="font-semibold text-tatt-black">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="font-semibold text-tatt-black">
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
          <a href="/" className="font-bold text-tatt-black">
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
