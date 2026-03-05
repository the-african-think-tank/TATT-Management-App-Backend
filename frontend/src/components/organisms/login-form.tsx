"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { AuthButton } from "@/components/atoms/auth-button";
import { LoginField } from "@/components/molecules/login-field";
import { RememberForgotRow } from "@/components/molecules/remember-forgot-row";
import api from "@/services/api";
import { useAuth } from "@/context/auth-context";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const EMAIL_ICON_SRC =
  "https://www.figma.com/api/mcp/asset/46f35b83-8281-44fe-bcbb-f5c959d2af9f";
const PASSWORD_ICON_SRC =
  "https://www.figma.com/api/mcp/asset/8db218ed-1ede-4e79-aadf-f23871c4566e";
const EYE_ICON_SRC =
  "https://www.figma.com/api/mcp/asset/13680719-0fcf-4541-a246-4b5375b0d4ef";
const TRUST_ICON_SRC =
  "https://www.figma.com/api/mcp/asset/f800d29c-afcd-4e2c-9b94-afe68a17f191";

export function LoginForm() {
  const { login: authLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/signin", data);

      console.log("Login success:", response.data);

      if (response.data.access_token) {
        authLogin(response.data.access_token, response.data.user);

        // Redirect based on role
        const systemRole = response.data.user.systemRole;
        if (systemRole && systemRole !== 'COMMUNITY_MEMBER') {
          window.location.href = "/admin";
        } else {
          window.location.href = "/dashboard";
        }
      } else if (response.data.requiresTwoFactor) {
        // Handle 2FA case
        setError("Two-factor authentication required. (2FA UI not yet implemented)");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full max-w-[448px]">
      <header className="space-y-2">
        <h1 className="text-[32px] sm:text-[42px] font-black leading-[1.2] tracking-[-0.75px] text-tatt-black">
          Welcome Back
        </h1>
        <p className="text-sm sm:text-base leading-6 text-tatt-gray">
          Please enter your details to access the member portal.
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
          leftIconSrc={EMAIL_ICON_SRC}
          error={errors.email?.message}
          {...register("email")}
        />
        <LoginField
          id="password"
          label="Password"
          placeholder="••••••••••••"
          type="password"
          leftIconSrc={PASSWORD_ICON_SRC}
          rightIconSrc={EYE_ICON_SRC}
          error={errors.password?.message}
          {...register("password")}
        />

        <RememberForgotRow />
        <AuthButton disabled={isLoading}>
          {isLoading ? "SIGNING IN..." : "SIGN IN"}
        </AuthButton>
      </form>

      <div className="mt-6 space-y-6 text-center">
        <div className="relative flex h-6 items-center justify-center">
          <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
          <span className="relative bg-white px-6 text-sm font-medium leading-6 text-tatt-gray">
            New to the community?
          </span>
        </div>

        <p className="text-sm leading-5 text-tatt-gray">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="font-bold leading-6 text-tatt-black underline decoration-tatt-lime">
            Request Access / Sign Up
          </a>
        </p>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 pt-2">
        <img src={TRUST_ICON_SRC} alt="" className="h-3 w-[10px]" aria-hidden="true" />
        <p className="text-center text-xs font-bold uppercase tracking-[1.2px] text-tatt-gray">
          Secure NGO Member Portal
        </p>
      </div>
    </section>
  );
}
