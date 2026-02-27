import { LoginTemplate } from "@/components/templates/login-template";
import { Navbar, Footer } from "@/components/organisms";

export function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 shrink-0">
        <LoginTemplate />
      </div>
      <Footer />
    </div>
  );
}
