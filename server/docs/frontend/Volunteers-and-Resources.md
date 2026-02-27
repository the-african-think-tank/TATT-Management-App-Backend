# Frontend Implementation: Volunteers & Knowledge Hub

These modules handle community contribution and structured educational content.

## 1. Volunteer Management

### 1.1 Discovery & Application
- **List Roles:** `GET /volunteers/roles?chapterId=...`
- **Apply:** `POST /volunteers/apply`
  - **Payload:** `{ roleId, interestsAndSkills[], weeklyAvailability, hoursAvailablePerWeek, reasonForApplying }`

### 1.2 Volunteer Dashboard
- **My Tasks:** `GET /volunteers/my-activities` (List of active assignments).
- **Completion:** `PATCH /volunteers/activities/:id/status`
  - **Payload:** `{ status: "COMPLETED" | "DECLINED" }`.
  - **Rewards:** Completing tasks automatically grants **Impact Points** (visible on user profile).

---

## 2. Knowledge & Resource Hub
Unlike the Feed, this is for structured guides and official PDF/Video resources.

### 2.1 Exploring Resources
**Endpoint:** `GET /resources`

**Filtering:** Filter by `type` (`GUIDE`, `DOCUMENT`, `VIDEO`, `PARTNERSHIP`) or `tag`.

### 2.2 Access Gating Logic
The backend returns a `403 Forbidden` if a user tries to access a resource they aren't eligible for.
- **Trigger:** `GET /resources/:id`
- **Action on 403:** Show a "Premium Upgrade" modal. The error message from the API is descriptive (e.g., *"Upgrade to IMANI to unlock"*). Use this message directly in the UI.

### 2.3 Training Resources (Staff/Verified Volunteers)
**Endpoint:** `GET /volunteers/training`
Exclusive list of training materials. Only available if `roles` guard includes `VOLUNTEER`.

---

## 3. Impact & Social Proof
Impact points should be featured prominently on the user's dashboard/profile.
- **Points Source:** `User.volunteerStats` (returned in the `/auth/signin` or future profile profile endpoints).
- **Gamification:** Frontend should display badges or level indicators based on these points.
