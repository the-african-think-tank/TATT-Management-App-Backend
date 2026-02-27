import { OnboardingSuccessPage } from "@/components/pages/onboarding-success-page";
import { Suspense } from "react";

export default function SuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OnboardingSuccessPage />
        </Suspense>
    );
}
