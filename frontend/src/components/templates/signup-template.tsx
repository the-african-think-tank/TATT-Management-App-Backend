import { SignupBrandPanel } from "@/components/organisms/signup-brand-panel";
import { SignupForm } from "@/components/organisms/signup-form";

export function SignupTemplate() {
  return (
    <main className="grid min-h-screen w-full grid-cols-1 bg-[#f8f8f5] lg:grid-cols-2">
      <SignupBrandPanel />

      <section className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-10 sm:px-10 lg:px-20 lg:py-12 xl:px-24">
        <div className="flex flex-1 items-center justify-center pt-8 lg:pt-0">
          <SignupForm />
        </div>
      </section>
    </main>
  );
}
