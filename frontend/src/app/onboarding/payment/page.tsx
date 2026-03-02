import { OnboardingPaymentPage } from "@/components/pages/onboarding-payment-page";
import { Suspense } from "react";

export default function PaymentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OnboardingPaymentPage />
        </Suspense>
    );
}
