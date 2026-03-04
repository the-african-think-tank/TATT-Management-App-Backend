# Volunteer Module – Detailed Explanation for Frontend Implementation

This document explains the **Volunteers** module in the TATT Management App Backend: what it does, how its data is structured, how it connects to the rest of the app, and exactly which APIs your frontend should call and when. It is written so you can build the volunteer section of the frontend without gaps or loopholes.

---

## 1. What is the Volunteer Module For?

The volunteer module lets the TATT community:

1. **Discover** open volunteer roles (e.g. “Youth Mentor”, “Event Coordinator”) per chapter.
2. **Apply** to become a volunteer (for a specific role or in general).
3. **Be approved** by staff (Volunteer Admin / Admin / Superadmin); on approval, the user becomes a “volunteer” in the system.
4. **Receive tasks** (activities) assigned by admins, complete or decline them, and earn **impact points** and **hours**.
5. **Access training resources** (guides, materials) reserved for volunteers.
6. **Build impact** via grades (Silver → Bronze → Gold) based on points.

So the backend supports: **role listings**, **applications**, **approval workflow**, **task assignment**, **training content**, and **volunteer stats/gamification**. Your frontend will need to call the right endpoints for each of these and respect who is allowed to do what (member vs volunteer vs admin).

---

## 2. Where Does the Volunteer Code Live?

All volunteer-related backend code lives under:

```
src/
├── modules/volunteers/
│   ├── volunteers.module.ts       ← Registers the module, entities, guards
│   ├── volunteers.controller.ts   ← All API routes under /volunteers
│   ├── volunteers.service.ts      ← Business logic (apply, approve, activities, etc.)
│   ├── dto/
│   │   ├── volunteers.dto.ts      ← Request body validation (CreateRole, Apply, UpdateStatus, etc.)
│   │   └── volunteers.schemas.ts  ← Swagger response schemas (for API docs)
│   └── entities/
│       ├── volunteer-role.entity.ts
│       ├── volunteer-application.entity.ts
│       ├── volunteer-activity.entity.ts
│       ├── volunteer-training.entity.ts
│       └── volunteer-stat.entity.ts
└── common/guards/
    └── volunteer.guard.ts         ← Restricts certain routes to “approved volunteers” (or staff)
```

The module is registered in `src/app.module.ts` as `VolunteersModule`. The database tables used are: `volunteer_roles`, `volunteer_applications`, `volunteer_activities`, `volunteer_training_resources`, `volunteer_stats`. They are used via Sequelize and the entities above.

---

## 3. Data Model – Entities and How They Link to the Rest of the App

### 3.1 VolunteerRole

- **Table:** `volunteer_roles`
- **Purpose:** One “open position” that people can apply for (e.g. “Youth Mentor – Accra”).
- **Important fields:**
  - `name`, `location`, `description`, `responsibilities[]`, `requiredSkills[]`
  - `chapterId` → links to **Chapter** (which chapter this role belongs to)
  - `weeklyHours`, `durationMonths`, `spotsNeeded`, `openUntil`
  - `isActive` (when closed by admin, this becomes `false`)
  - `createdBy` → **User** (admin who created the role)

**Link to rest of app:** Uses **Chapter** and **User** from other modules. Listing roles can be filtered by `chapterId` so the frontend can show “roles in my chapter” or “all roles”.

---

### 3.2 VolunteerApplication

- **Table:** `volunteer_applications`
- **Purpose:** A user’s application to become a volunteer (for one specific role or “general”).
- **Important fields:**
  - `userId` → **User** (applicant)
  - `roleId` → **VolunteerRole** (optional; `null` = general application)
  - `interestsAndSkills[]`, `weeklyAvailability`, `hoursAvailablePerWeek`, `reasonForApplying`, `questionsForAdmin`
  - `status`: `PENDING` | `INTERVIEW_SCHEDULED` | `APPROVED` | `REJECTED` | `WITHDRAWN`
  - `interviewTime`, `adminNotes` (set by admin when reviewing)

**Link to rest of app:** When status becomes **APPROVED**, the backend:
- Adds the **VOLUNTEER** flag to **User** (`user.flags`), so the user is treated as an approved volunteer.
- Creates a **VolunteerStat** row for that user (hours/points/grade).
- Creates or updates a **Connection** between the approving admin and the volunteer (so they can use Direct Chat for coordination).

So: **User**, **Connection**, and **VolunteerStat** are all tied together at approval time.

---

### 3.3 VolunteerActivity

- **Table:** `volunteer_activities`
- **Purpose:** A single task assigned to one volunteer (e.g. “Organize Chapter Meetup”).
- **Important fields:**
  - `title`, `description`, `chapterId` (which chapter the activity is for)
  - `assignedToId` → **User** (the volunteer)
  - `dueDate`, `estimatedHours`, `impactPoints`
  - `status`: `ASSIGNED` | `COMPLETED` | `DECLINED` | `CANCELLED`
  - `declineReason` (optional, when volunteer declines)

**Link to rest of app:** Uses **User** and **Chapter**. When a volunteer marks an activity as **COMPLETED**, the service updates **VolunteerStat** (adds hours and impact points, and may upgrade grade: Silver → Bronze → Gold).

---

### 3.4 VolunteerTrainingResource

- **Table:** `volunteer_training_resources`
- **Purpose:** Training materials (e.g. “Volunteer Handbook”) only for volunteers.
- **Important fields:** `title`, `content` (e.g. HTML/markdown), `mediaUrls[]`, `createdBy` → **User**.

**Link to rest of app:** Only **User** (creator). Access to the list is controlled by **VolunteerGuard** (see below).

---

### 3.5 VolunteerStat

- **Table:** `volunteer_stats`
- **Purpose:** One row per volunteer: total hours, impact points, and grade (gamification).
- **Important fields:**
  - `userId` → **User** (unique: one stat row per user)
  - `totalHours`, `impactPoints`
  - `grade`: `SILVER` | `BRONZE` | `GOLD` (backend updates this when points cross 100 / 500).

**Link to rest of app:** Created when an application is **APPROVED**; updated when the volunteer **completes** activities. The frontend can show this on profile/dashboard (if you expose it via an endpoint like `/auth/me` or a dedicated profile API).

---

## 4. How Access Control Works (Critical for Frontend)

Every volunteer API is under `GET/POST/PATCH ... /volunteers/...` and is protected by **JWT**: the user must be logged in (`JwtAuthGuard`). Then two extra mechanisms decide who can do what:

### 4.1 Role-based access (RolesGuard + `@Roles`)

- Used for **admin-only** endpoints (create role, close role, list applications, approve/reject, create activity, create training).
- Allowed roles: **VOLUNTEER_ADMIN**, **ADMIN**, **SUPERADMIN** (from `SystemRole` in IAM).
- If the user’s `systemRole` is not one of these, they get **403 Forbidden**.

### 4.2 VolunteerGuard (volunteer-only endpoints)

- Used for: **my-activities**, **update activity status**, **training**.
- Allows:
  - Any **staff** (SUPERADMIN, ADMIN, VOLUNTEER_ADMIN), or
  - Any user whose **User.flags** array contains **VOLUNTEER** (or the string `'VOLUNTEER'`).
- If the user is not staff and does not have the volunteer flag, the API returns **403** with message: *"This endpoint is restricted to approved TATT Volunteers."*

So on the frontend:

- **Public (any logged-in member):** list roles, submit application.
- **Volunteer-only (or staff):** my activities, complete/decline activity, training list.
- **Admin-only (VOLUNTEER_ADMIN / ADMIN / SUPERADMIN):** create/close roles, list/review applications, create activities, create training.

You should hide or disable volunteer-only UI (e.g. “My tasks”, “Training”) for users who don’t have the volunteer flag (or staff role), and show a clear message if they hit 403.

---

## 5. API Endpoints – Summary Table

| Method | Path | Who can call | Brief purpose |
|--------|------|----------------|----------------|
| GET    | `/volunteers/roles` | Any authenticated user | List active open roles (optional `?chapterId=`) |
| POST   | `/volunteers/apply` | Any authenticated user | Submit volunteer application |
| GET    | `/volunteers/my-activities` | Volunteer (or staff) | List activities assigned to current user |
| PATCH  | `/volunteers/activities/:id/status` | Volunteer (or staff) | Mark activity COMPLETED or DECLINED |
| GET    | `/volunteers/training` | Volunteer (or staff) | List training resources |
| POST   | `/volunteers/roles` | Volunteer Admin / Admin / Superadmin | Create a new volunteer role |
| PATCH  | `/volunteers/roles/:id/close` | Volunteer Admin / Admin / Superadmin | Close a role (`isActive = false`) |
| GET    | `/volunteers/applications` | Volunteer Admin / Admin / Superadmin | List all applications (optional `?roleId=`) |
| PATCH  | `/volunteers/applications/:id/status` | Volunteer Admin / Admin / Superadmin | Set status (e.g. APPROVED), optional `interviewTime`, `adminNotes` |
| POST   | `/volunteers/activities` | Volunteer Admin / Admin / Superadmin | Create an activity (assign to a volunteer) |
| POST   | `/volunteers/training` | Volunteer Admin / Admin / Superadmin | Create a training resource |

All require **Authorization: Bearer <JWT>**. Base path is your API prefix (e.g. `/api` if you use a global prefix) + `/volunteers`.

---

## 6. Request/Response Shapes (What to Send and Expect)

### 6.1 GET `/volunteers/roles?chapterId=...`

- **Query:** `chapterId` (optional UUID) to filter by chapter.
- **Response:** Array of role objects (see `VolunteerRoleSchema`): `id`, `name`, `location`, `weeklyHours`, `durationMonths`, `description`, `responsibilities`, `requiredSkills`, `spotsNeeded`, `openUntil`, `isActive`, and relation `chapter` if included. Only **active** roles with `openUntil` in the future are returned.

### 6.2 POST `/volunteers/apply`

- **Body (ApplyVolunteerDto):**
  - `roleId` (optional UUID) – specific role, or omit for general application.
  - `interestsAndSkills`: string[].
  - `weeklyAvailability`: object (e.g. `{ monday: ['09:00-12:00'], ... }`).
  - `hoursAvailablePerWeek`: number.
  - `reasonForApplying`: string.
  - `questionsForAdmin`: string (optional).
- **Response:** Created application (e.g. `VolunteerApplicationSchema`: `id`, `status: PENDING`, and the fields you sent).
- **Error:** **400** if the user already has a **pending** application for the same `roleId` (or same “general” application when `roleId` is null). Frontend should prevent double-submit and show a clear message.

### 6.3 GET `/volunteers/my-activities`

- **Response:** Array of activities assigned to the current user (`VolunteerActivitySchema`: `id`, `title`, `description`, `dueDate`, `estimatedHours`, `impactPoints`, `status`, optional `declineReason`).

### 6.4 PATCH `/volunteers/activities/:id/status`

- **Body (UpdateActivityStatusDto):**
  - `status`: `COMPLETED` | `DECLINED`.
  - `declineReason`: string (optional, useful when declining).
- **Response:** `{ message: "Activity marked as completed" }` (or declined).
- **Errors:** **404** if activity not found or not assigned to current user; **400** if already completed. On **COMPLETED**, backend adds hours and impact points to **VolunteerStat** and may upgrade grade.

### 6.5 GET `/volunteers/training`

- **Response:** Array of training resources: `id`, `title`, `content`, `mediaUrls`.

### 6.6 Admin – POST `/volunteers/roles`

- **Body (CreateVolunteerRoleDto):** `name`, `location`, `chapterId`, `weeklyHours`, `durationMonths`, `description`, `responsibilities[]`, `requiredSkills[]`, `spotsNeeded`, `openUntil` (date string, e.g. `YYYY-MM-DD`).

### 6.7 Admin – PATCH `/volunteers/roles/:id/close`

- No body. **Response:** `{ message: 'Role closed' }`.

### 6.8 Admin – GET `/volunteers/applications?roleId=...`

- **Response:** List of applications with `user` (e.g. `id`, `firstName`, `lastName`, `email`, `chapterId`) and `role` (VolunteerRole) included. Optional filter by `roleId`.

### 6.9 Admin – PATCH `/volunteers/applications/:id/status`

- **Body (UpdateApplicationStatusDto):**
  - `status`: one of `ApplicationStatus` (e.g. `PENDING`, `INTERVIEW_SCHEDULED`, `APPROVED`, `REJECTED`, `WITHDRAWN`).
  - `interviewTime`: ISO date string (optional).
  - `adminNotes`: string (optional).
- **Response:** `{ message: "Application approved", status: "APPROVED" }` (or similar). When status is **APPROVED**, backend sets user’s volunteer flag, creates VolunteerStat, and creates/accepts Connection with the admin.

### 6.10 Admin – POST `/volunteers/activities`

- **Body (CreateActivityDto):** `title`, `description`, `chapterId`, `assignedToId` (volunteer user UUID), `dueDate`, `estimatedHours`, `impactPoints`.

### 6.11 Admin – POST `/volunteers/training`

- **Body (CreateTrainingResourceDto):** `title`, `content`, `mediaUrls` (optional string array).

---

## 7. How the Volunteer Module Connects to the Rest of the Application

- **IAM (User, roles, flags):**
  - Every request is authenticated (JWT → `req.user`).
  - **SystemRole** (e.g. `VOLUNTEER_ADMIN`, `ADMIN`, `SUPERADMIN`) is used by **RolesGuard** for admin endpoints.
  - **User.flags** (e.g. `VOLUNTEER`) is used by **VolunteerGuard** to allow access to volunteer-only endpoints. The flag is set when an application is approved.

- **Chapters:**
  - **VolunteerRole** and **VolunteerActivity** are tied to a **Chapter** via `chapterId`. The frontend can filter roles by chapter and show chapter context.

- **Connections & messaging:**
  - When an application is **APPROVED**, the backend creates or updates a **Connection** between the approving admin and the new volunteer (status ACCEPTED), so they can use the existing Direct Message / connection features for coordination.

- **Database:**
  - Volunteer entities are registered in `VolunteersModule` via `SequelizeModule.forFeature(...)`. They use the same Sequelize instance as the rest of the app (from `DatabaseModule`). **User** and **Connection** are shared with IAM and Connections modules.

So: the volunteer module is **not isolated**. It depends on **User**, **Chapter**, and **Connection**, and it **changes** User (flags) and creates Connection and VolunteerStat on approval. Your frontend should assume that “being a volunteer” is reflected in the user object (e.g. `flags` or a dedicated “isVolunteer” if your auth API exposes it) and that volunteer stats may be exposed via profile/me or a future stats endpoint.

---

## 8. Frontend Implementation Checklist and Gotchas

1. **Auth:** Send JWT on every request (e.g. `Authorization: Bearer <token>`). If token is missing or invalid, APIs return **401**.

2. **Who sees what:**
   - **Member (no volunteer flag):** Can list roles and apply; cannot call my-activities, activity status, or training. If they do, they get **403** with “restricted to approved TATT Volunteers”.
   - **Volunteer (has VOLUNTEER flag or is staff):** Can use my-activities, update activity status, and training.
   - **Volunteer Admin / Admin / Superadmin:** Can use all admin endpoints; they also pass VolunteerGuard so they can see activities and training like a volunteer.

3. **Applying:** Only one **pending** application per (user, roleId). For “general” application, `roleId` is null – so only one pending general application. Handle **400** and show “You already have a pending application.”

4. **Approval flow:** After admin sets status to **APPROVED**, the user becomes a volunteer (flag set), gets a stat row, and a connection with the admin. Your frontend may need to refresh user context (e.g. re-fetch `/auth/me` or equivalent) so the UI shows “volunteer” sections and new menu items.

5. **Activities:** Only the **assigned volunteer** can PATCH an activity’s status. If you build an admin “list all activities” view, that’s not provided by this controller – you’d need a new endpoint or use the same list with an admin filter.

6. **Training:** Content can be HTML or markdown; `mediaUrls` can be used for PDFs/videos. Render safely and handle empty `mediaUrls`.

7. **Impact points and grades:** Updated server-side when activities are completed. If your auth or profile API returns `volunteerStats` (totalHours, impactPoints, grade), display them for gamification; otherwise you may need a small “volunteer profile” or “my impact” endpoint later.

8. **Swagger:** All these endpoints are documented under the tag **“Volunteers & Impact”** at your `/api-docs` (or equivalent). Use it to double-check request/response shapes and status codes.

---

## 9. Short Summary

- **Volunteer module** = roles (open positions), applications, approval, activities (tasks), training resources, and volunteer stats (hours, points, grades).
- **Links:** Uses **User** (applicant, assignee, creator), **Chapter** (role/activity), and **Connection** (created on approval). Writes to **User.flags** and **VolunteerStat**.
- **Access:** JWT for all; **VolunteerGuard** for volunteer-only routes (my-activities, activity status, training); **RolesGuard** for admin-only routes (roles, applications, activities, training CRUD).
- **Frontend:** Use the endpoint table and request/response sections above; respect 401/403; avoid duplicate pending applications; refresh user context after approval so volunteer UI and permissions stay in sync.

With this, you can implement the volunteer section of the frontend against the existing backend without gaps or loopholes. If you add new endpoints (e.g. “my stats”, “list all activities for admin”), you’ll extend this same module and the same entities.

For **what is not in the backend (gaps)** and **else cases / edge cases** (rejected/withdrawn flows, multiple applications, activity CANCELLED vs DECLINED, 404/403/400 details, enums, idempotent approval, pagination), see **VOLUNTEER_MODULE_ADDENDUM_GAPS_AND_ELSE_CASES.md** in this folder.
