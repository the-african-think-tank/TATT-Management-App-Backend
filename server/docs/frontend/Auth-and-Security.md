# Frontend Implementation: Authentication & Security

This document outlines the flows, endpoints, and state management requirements for implementing Identity & Access Management (IAM) in the TATT Frontend.

## 1. Multi-Step Sign-In Flow
The sign-in process is non-linear and handles 2FA, password expiry, and forced setup.

### Endpoint: `POST /auth/signin`
**Payload:** `{ email, password }`

**Possible Responses & Actions:**

| Scenario | Response Body contains... | Frontend Action |
| :--- | :--- | :--- |
| **Success (No 2FA)** | `access_token`, `user` | Store token in `localStorage`/`sessionStorage`, redirect to dashboard. |
| **2FA Required** | `requiresTwoFactor: true`, `partialToken`, `method: "EMAIL" | "TOTP"` | Redirect to OTP verification page. Show prompt for either Email or App code. |
| **2FA Setup Required** | `requiresTwoFactorSetup: true`, `setupToken` | Redirect to 2FA Setup page (policy mandate). |
| **Password Expired** | `requiresPasswordRotation: true`, `rotationToken` | Redirect to "Force Password Change" page. |

---

## 2. Completing Multi-Factor Authentication
If `requiresTwoFactor` was returned, use the following:

### Step A: Verify OTP
**Endpoint:** `POST /auth/2fa/complete`  
**Payload:** `{ partialToken, otp }` (otp is 6 digits)  
**Success:** Returns `access_token` and `user`.

### Step B: Resend Code (Email only)
**Endpoint:** `POST /auth/2fa/resend-otp`  
**Payload:** `{ partialToken }`  
**Success:** Dispatches a new email.

---

## 3. Policy-Enforced Security

### 3.1 Forced Password Rotation
If `requiresPasswordRotation` was returned:
- **Endpoint:** `POST /auth/password/rotate`
- **Payload:** `{ rotationToken, newPassword }`
- **Error Handling:** Should handle `400 Bad Request` messages like "Password must not be one of your last 3 passwords" or "Password too weak".

### 3.2 2FA Setup (Mandatory or Optional)
- **Get TOTP Secret:** `POST /security/2fa/setup/totp` (Requires `setupToken` or `access_token`).
- **Verify & Enable:** `POST /security/2fa/enable/totp` or `/security/2fa/enable/email`.

---

## 4. Community Member Signup
**Endpoint:** `POST /auth/signup/community`  

**Payload:** 
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "communityTier": "FREE | UBUNTU | IMANI | KIONGOZI",
  "billingCycle": "MONTHLY | YEARLY",
  "paymentMethodId": "pm_...", // From Stripe Elements (only if tier != FREE)
  "chapterId": "uuid",
  "interestIds": ["uuid", "uuid"]
}
```

**Implementation Note:** Use **Stripe Elements** on the frontend to collect payment details and generate a `paymentMethodId` before calling this API.

---

## 5. Administrative Invitations
Users with role `ADMIN` or `SUPERADMIN` can invite staff.

1. **Invite Staff:** `POST /auth/org-member/add`  
   - Role can be `ADMIN`, `MODERATOR`, `CONTENT_ADMIN`, `REGIONAL_ADMIN`.
2. **Accept Invite (Staff):** `POST /auth/org-member/complete-registration`
   - **Payload:** `{ token, password }`
   - The `token` is extracted from the URL query string in the invitation email.

## 6. Self-Service Recovery
- **Forgot Password:** `POST /auth/password/forgot` (Sends email).
- **Reset Password:** `POST /auth/password/reset`
  - **Payload:** `{ token, newPassword }`
  - `token` comes from the email reset link.
