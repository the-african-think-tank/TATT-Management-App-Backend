import { SignupBrandPanel } from "@/components/organisms/signup-brand-panel";
import { SignupForm } from "@/components/organisms/signup-form";
import Image from "next/image";

export function SignupTemplate() {
  return (
    <main className="grid min-h-screen w-full grid-cols-1 bg-[#f8f8f5] lg:grid-cols-2">
      <SignupBrandPanel />

      <section className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-10 sm:px-10 lg:px-20 lg:py-12 xl:px-24">
        {/* Mobile-only brand header */}
        <div className="flex w-full max-w-[448px] items-center gap-3 mb-8 lg:hidden">
          <Image src="/assets/tattlogoIcon.svg" alt="TATT Logo" width={36} height={36} />
          <span className="text-base font-black uppercase tracking-tight text-tatt-black">
            The African Think Tank
          </span>
        </div>
        <SignupForm />
      </section>
    </main>
  );
}
