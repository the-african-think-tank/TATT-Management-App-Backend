import BusinessIntakeForm from "@/components/organisms/BusinessIntakeForm";
import { Navbar } from "@/components/organisms/navbar";
import { Footer } from "@/components/organisms/footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business Partner Application | TATT Ecosystem",
  description: "Join the TATT Business Partner program and showcase your business to our global diaspora community.",
};

export default function PublicBusinessApplyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1">
        <BusinessIntakeForm 
          isPublic={true} 
          backLink="/business-directory" 
          onSuccessRedirect="/business-directory?success=true" 
        />
      </main>
      <Footer />
    </div>
  );
}
