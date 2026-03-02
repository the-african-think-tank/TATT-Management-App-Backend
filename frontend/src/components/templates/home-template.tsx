import { HeroSection } from "@/components/organisms/hero-section";
import { Footer } from "@/components/organisms/footer";

export function HomeTemplate() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow bg-background text-foreground">
        <HeroSection />
      </main>
      <Footer />
    </div>
  );
}
