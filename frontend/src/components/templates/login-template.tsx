import { LoginForm } from "@/components/organisms/login-form";
import { LoginPromoPanel } from "@/components/organisms/login-promo-panel";
import Image from "next/image";

export function LoginTemplate() {
  return (
    <main className="grid min-h-screen w-full grid-cols-1 bg-[#f8f8f5] lg:grid-cols-[1.05fr_1fr]">
      <LoginPromoPanel />

      <section className="flex min-h-screen flex-col bg-white px-6 py-10 sm:px-10 lg:px-20 lg:py-12 xl:px-24">
        {/* Mobile-only brand header, hidden on desktop where the side panel shows */}
        <div className="flex items-center gap-3 mb-8 lg:hidden">
          <Image src="/assets/tattlogoIcon.svg" alt="TATT Logo" width={36} height={36} />
          <span className="text-base font-black uppercase tracking-tight text-tatt-black">
            The African Think Tank
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-[448px]">
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
