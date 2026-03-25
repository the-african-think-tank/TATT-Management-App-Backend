"use client";

import BusinessIntakeForm from "@/components/organisms/BusinessIntakeForm";

export default function MemberBusinessApplyPage() {
  return (
    <div className="bg-background min-h-screen">
      <BusinessIntakeForm 
        isPublic={false} 
        backLink="/dashboard/business-center" 
        onSuccessRedirect="/dashboard/business-center" 
      />
    </div>
  );
}
