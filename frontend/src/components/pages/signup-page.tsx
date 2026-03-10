import { SignupTemplate } from "@/components/templates/signup-template";
import { Navbar, Footer } from "@/components/organisms";

export function SignupPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 shrink-0">
        <SignupTemplate />
      </div>
      <Footer />
    </div>
  );
}
