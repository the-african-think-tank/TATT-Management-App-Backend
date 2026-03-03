# Volunteer Module – Addendum: Gaps and Else Cases

Add this to your reading of **VOLUNTEER_MODULE_EXPLAINED.md**. It clarifies what is **not** in the backend (so you don’t assume it exists) and documents **else cases** and edge cases for the frontend.

---

## What Is (and Isn’t) Covered – Current Gaps

### Covered by the main doc and the backend

- All volunteer API endpoints (roles, apply, applications, activities, training) and who can call them.
- Data model (entities, tables, relations to User, Chapter, Connection).
- Auth: JWT required; VolunteerGuard and RolesGuard behaviour.
- Request/response shapes and main error cases (401, 403, 404, 400 for duplicate application).
- Approval flow: on APPROVED, backend sets User flag, creates VolunteerStat, creates/accepts Connection.

### Not in the backend (gaps you should know)

1. **"My applications" for the applicant**  
   There is **no** `GET /volunteers/my-applications` (or similar) for a logged-in user to see their own application(s) and status (e.g. PENDING, APPROVED, REJECTED). Only admins can list applications via `GET /volunteers/applications`. So the frontend **cannot** show "Your application is under review" or "You were approved" from the volunteer API alone. Options: add a backend endpoint that returns the current user's applications, or surface status via another channel (e.g. email, or a future profile/notifications API).

2. **"My stats" for the volunteer**  
   There is **no** `GET /volunteers/my-stats` (or similar) that returns the current user's `VolunteerStat` (totalHours, impactPoints, grade). Stats are updated when activities are completed, but no endpoint exposes them to the volunteer. To show impact on the frontend you'd need either a new endpoint or the auth/profile API to include volunteer stats.

3. **Sign-in response does not include `flags`**  
   The auth `generateAuthResponse` returns `user: { id, firstName, lastName, email, systemRole, communityTier, isActive, isTwoFactorEnabled, twoFactorMethod }` but **not** `flags`. So right after approval, the frontend cannot know from the sign-in response that the user is a volunteer. The backend does set `req.user.flags` when validating the JWT (from the DB), but that is only used server-side. **Recommendation:** either add `flags` (and optionally `chapterId`) to the auth response, or provide a `GET /auth/me` (or profile) that returns the current user including `flags`, so the frontend can show/hide volunteer sections without calling a volunteer endpoint and inferring from 403.

4. **No admin "list all activities"**  
   Admins can create activities but there is no endpoint to list all activities (e.g. by chapter or by volunteer). Only volunteers can list their own via `GET /volunteers/my-activities`. If the admin UI needs a full list, the backend would need a new endpoint.

5. **Volunteer database tables and migrations**  
   The volunteer entities are registered in `VolunteersModule` via `SequelizeModule.forFeature(...)`. There are **no** volunteer-specific SQL migration scripts in the repo (unlike the Resources module). Tables may be created by Sequelize `synchronize` if enabled, or you may need to add migrations. Confirm with your team how the volunteer tables are created in each environment.

---

## Else Cases and Edge Cases

### Application status flows

- **REJECTED:** Backend only updates application status. No flag, no VolunteerStat, no Connection. User remains a normal member. Frontend can show "Application declined" if you have a way to expose status (see gap above).
- **WITHDRAWN:** Same as REJECTED from a data perspective. There is **no** dedicated "withdraw my application" endpoint for the applicant; only admins can set status via `PATCH /volunteers/applications/:id/status`. If you want applicants to withdraw, you'd need a new endpoint (e.g. `PATCH /volunteers/my-applications/:id/withdraw`).
- **INTERVIEW_SCHEDULED:** Admin can set this and optionally `interviewTime` and `adminNotes`. No other side effects. Frontend can show interview date/notes if you expose application details to the applicant.

### Multiple applications

- The backend allows **one pending application per (userId, roleId)**. So:
  - Same role twice → **400** "You already have a pending application."
  - **Different roles:** the user can have multiple pending applications (one per role).
  - **General application** (`roleId` null) is one "role"; only one pending general application per user.
- Frontend: prevent duplicate submit for the same role; you can allow applying to several roles and show "Applied" per role.

### Activity status: COMPLETED, DECLINED, CANCELLED

- **COMPLETED:** Backend adds `estimatedHours` and `impactPoints` to VolunteerStat and may upgrade grade (Silver → Bronze → Gold). Only this status triggers rewards.
- **DECLINED:** Volunteer can send `status: DECLINED` and optional `declineReason`. No points; activity is just marked declined.
- **CANCELLED:** The DTO accepts any `ActivityStatus`, so `CANCELLED` is valid. Backend only saves the status; no points. Use for "task was cancelled" (e.g. by volunteer or by context). There is no separate admin-only "cancel activity" endpoint; the volunteer can set CANCELLED via the same PATCH.
- **Already completed:** If the activity is already COMPLETED, the backend returns **400** "Activity already completed" to avoid double-reward.

### 404 and 403

- **404 "Role not found":** e.g. closing a role that doesn't exist or wrong UUID.
- **404 "Application not found":** wrong application id or admin reviewing a non-existent application.
- **404 "Activity not found or not assigned to you":** volunteer tried to update an activity that isn't theirs or doesn't exist.
- **403 "This endpoint is restricted to approved TATT Volunteers.":** user is logged in but does not have the VOLUNTEER flag (and is not staff). Show a clear message and optionally a CTA to apply.
- **403 "Insufficient permissions":** admin endpoint called by a user who is not VOLUNTEER_ADMIN / ADMIN / SUPERADMIN.

### Validation (400)

- Invalid UUID (e.g. `chapterId`, `roleId`, `assignedToId`).
- Missing required fields or wrong types (e.g. non-array for `interestsAndSkills`).
- Duplicate pending application (see above).

### Enums to use on the frontend

Use the same values as the backend so requests and display are consistent:

- **ApplicationStatus:** `PENDING` | `INTERVIEW_SCHEDULED` | `APPROVED` | `REJECTED` | `WITHDRAWN`
- **ActivityStatus:** `ASSIGNED` | `COMPLETED` | `DECLINED` | `CANCELLED`
- **VolunteerGrade:** `SILVER` | `BRONZE` | `GOLD` (for displaying stats when you have them)

### Idempotent approval

- If an admin sets an application to APPROVED and the user **already** has the VOLUNTEER flag, the backend does not duplicate the flag. It still ensures VolunteerStat exists and creates/accepts the Connection. So re-approving or updating an already-approved application to APPROVED again is safe.

### Pagination and list size

- None of the volunteer list endpoints (roles, applications, my-activities, training) use pagination. For large datasets you might get large responses; consider asking the backend team for pagination later if needed.
