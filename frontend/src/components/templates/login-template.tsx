import { LoginForm } from "@/components/organisms/login-form";
import { LoginPromoPanel } from "@/components/organisms/login-promo-panel";

export function LoginTemplate() {
  return (
    <main className="grid min-h-screen w-full grid-cols-1 bg-[#f8f8f5] lg:grid-cols-[1.05fr_1fr]">
      <LoginPromoPanel />

      <section className="flex min-h-screen flex-col bg-white px-6 py-10 sm:px-10 lg:px-20 lg:py-12 xl:px-24">
        <div className="flex flex-1 items-center justify-center pt-8 lg:pt-0">
          <div className="w-full max-w-[448px]">
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
