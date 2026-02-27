# Frontend Implementation: Billing & Subscriptions

TATT uses **Stripe** for recurring billing and tier management.

## 1. Membership Levels (Tiers)
The system recognizes four community tiers:
- `FREE`: Access to feed and basic resources.
- `UBUNTU`: Basic paid membership.
- `IMANI`: Mid-tier paid membership.
- `KIONGOZI`: High-tier/Leadership membership.

---

## 2. Subscription Flow
Subscriptions are created during the **Signup** phase (`POST /auth/signup/community`).

### Implementation Strategy:
1.  **Stripe Elements**: Use `@stripe/react-stripe-js` (or equivalent) to securely collect card details on the frontend.
2.  **Generate PaymentMethod**: Request a `paymentMethodId` from the Stripe API.
3.  **Submit to TATT**: Send the `paymentMethodId` and the chosen `communityTier` to the signup endpoint.

---

## 3. Subscription Management
The backend handles subscription lifecycle events via **Webhooks** (e.g., failed payments, cancellations).

### User Feedback:
- When a payment fails or a subscription expires, the backend automatically downgrades the user to `FREE`.
- The frontend should monitor the `user.communityTier` in the global state/Redux. If it changes to `FREE` unexpectedly, prompt the user with a "Subscription Expired" banner.

---

## 4. Admin View (Billing Dashboard)
Admin users have access to financial and subscriber oversight.

### 4.1 Subscriber Oversight
- **All Paid Members:** `GET /billing/subscribers`
- **At Risk of Expiry:** `GET /billing/renewals` (Members without auto-pay expiring in < 7 days).
- **Manual Notify:** `POST /billing/notify-renewals` (Trigger reminder emails).

### 4.2 Revenue Metrics (SuperAdmin Only)
- **Endpoint:** `GET /billing/revenue`
- **Returns:** 
  - `activeSubscriptions` (count)
  - `estimatedMonthlyRevenue` (MRR)
  - `estimatedAnnualRunRate` (ARR)
  - `currency`

---

## 5. Deployment Note (Environment Variables)
The frontend must provide the **Stripe Publishable Key** (`STRIPE_PUBLISHABLE_KEY`) to initialize the Stripe client. Do not use the Secret Key on the frontend.
