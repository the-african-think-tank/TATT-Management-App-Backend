# Resource & Knowledge Hub — What’s Implemented & How to Test

## 1. What Was Implemented

### Module layout
- **`src/modules/resources/`**
  - **Entities**: `Resource` (table `resources`), `ResourceInteraction` (table `resource_interactions`, optional audit).
  - **DTOs**: `CreateResourceDto`, `UpdateResourceDto`, `ResourceListQueryDto` (with validation and Swagger).
  - **Service**: `ResourcesService` — create, update, soft-delete, list (visibility-gated), getById (access-gated), tier/chapter helpers, optional interaction logging.
  - **Controller**: `ResourcesController` — all routes under `/resources`, admin-only for write, JWT required for read.
  - **Module**: `ResourcesModule` registered in `AppModule`; entities in `DatabaseModule`.

### Resource model (summary)
- **Resource**: `id` (UUID), `title`, `type` (GUIDE | DOCUMENT | VIDEO | PARTNERSHIP), `description` (text/HTML), `contentUrl`, `thumbnailUrl`, `chapterId` (optional FK), `visibility` (PUBLIC | RESTRICTED), `minTier` (FREE | UBUNTU | IMANI | KIONGOZI), `tags` (array), `metadata` (JSONB). Soft-delete (`paranoid: true`).

### API endpoints
| Method | Path | Who | Purpose |
|--------|------|-----|--------|
| POST   | `/resources` | Content Admin (CONTENT_ADMIN / ADMIN / SUPERADMIN) | Create resource |
| PATCH  | `/resources/:id` | Content Admin | Update resource |
| DELETE | `/resources/:id` | Content Admin | Soft-delete (archive) resource |
| GET    | `/resources` | Any authenticated user | List resources (visibility-gated), query: `type`, `chapterId`, `tag`, `page`, `limit` |
| GET    | `/resources/:id` | Any authenticated user | Get one resource (access-gated); returns 403 if tier/chapter not met |

### Behaviour in code
- **Tier order**: FREE < UBUNTU < IMANI < KIONGOZI (used for “user tier ≥ resource minTier”).
- **Visibility (listing, GET /resources)**  
  - **PUBLIC**: resource appears for everyone.  
  - **RESTRICTED**: only if user’s `communityTier` ≥ `minTier` and (if resource has `chapterId`) user’s `chapterId` matches (or resource has no chapter).
- **Access (detail, GET /resources/:id)**  
  - Allowed only if user’s tier ≥ `minTier` and (if resource has `chapterId`) user is in that chapter.  
  - If not allowed: **403** with message: *"Your current membership does not include access to this [Type]. Upgrade to [minTier] to unlock."*
- **Admins**: CONTENT_ADMIN / ADMIN / SUPERADMIN see all resources in the list and can always open any resource (no 403).
- **Audit**: Successful view of a resource (GET `/resources/:id`) can create a `ResourceInteraction` (VIEW) for analytics.

---

## 2. Can It Be Tested? Yes

You can test in two ways:

1. **Manually** — Run the app, get a JWT (sign-in), then call the APIs with Postman/Insomnia/curl or use **Swagger** at `http://localhost:3000/api-docs` (or your base URL + `/api-docs`). All resource endpoints are under the **“Knowledge & Resource Hub”** tag.
2. **Automated** — Add unit tests for `ResourcesService` (tier/chapter logic, 403 cases) and/or e2e tests that call the HTTP endpoints with different users and resources.

Below is a **manual testing guide** and what you should / should not see.

---

## 3. How to Test (Manual)

### Prerequisites
- App running (e.g. `npm run start:dev`).
- Database has `resources` and `resource_interactions` tables. If they don’t exist yet, run the migration once:
  - **DBeaver / pgAdmin:** Execute `scripts/migrate-resources-tables.sql` in your project root (with database **tatt_db** selected).
  - **psql:** `psql -U postgres -d tatt_db -f scripts/migrate-resources-tables.sql`
  - See **DATABASE-SETUP.md** (section “Resources tables”) for more detail.
- At least:
  - One **Content Admin** user (e.g. CONTENT_ADMIN, ADMIN, or SUPERADMIN).
  - One **Community member** with tier **FREE**.
  - One **Community member** with tier **UBUNTU** (or higher).
  - Optional: two chapters and users in different chapters to test chapter scoping.

### Step 1: Get JWTs
- Sign in as **Admin** → get `tokenAdmin`.
- Sign in as **FREE member** → get `tokenFree`.
- Sign in as **UBUNTU member** → get `tokenUbuntu`.

Use each token in the `Authorization: Bearer <token>` header.

### Step 2: Create resources (as Admin)
Call **POST /resources** with `tokenAdmin` and bodies like:

**A – Public, FREE (everyone can see and open)**  
```json
{
  "title": "Public Guide",
  "type": "GUIDE",
  "description": "<p>For everyone</p>",
  "visibility": "PUBLIC",
  "minTier": "FREE",
  "tags": ["Legal"]
}
```

**B – Restricted, UBUNTU (only UBUNTU+ can see and open)**  
```json
{
  "title": "Ubuntu-Only Deal",
  "type": "PARTNERSHIP",
  "visibility": "RESTRICTED",
  "minTier": "UBUNTU",
  "tags": ["Deals"]
}
```

**C – Optional: chapter-specific**  
Set `chapterId` to a real chapter UUID and assign one test user to that chapter and another to a different chapter (or no chapter).

Save the `id` of at least one resource (e.g. the UBUNTU-only one) for GET-by-id tests.

### Step 3: List (GET /resources)
- **As Admin**: Call **GET /resources**. You should see **all** resources (Public + Restricted), regardless of your tier/chapter.
- **As FREE member**: You should see **only** resources that are either PUBLIC or (RESTRICTED with minTier = FREE and, if chapterId set, your chapter). So you **see** “Public Guide”, **do not see** “Ubuntu-Only Deal”.
- **As UBUNTU member**: You should see **both** “Public Guide” and “Ubuntu-Only Deal” (and any other that their tier/chapter allows).

Use query params to filter: `?type=GUIDE`, `?tag=Legal`, `?chapterId=<uuid>`, `?page=1&limit=10`.

### Step 4: Get by ID (GET /resources/:id)
- **FREE member** → **GET /resources/:id** for the **Public Guide** (minTier FREE): **200** with full object including `contentUrl`.
- **FREE member** → **GET /resources/:id** for the **Ubuntu-Only Deal** (minTier UBUNTU): **403** with message like *"Your current membership does not include access to this Partnership. Upgrade to UBUNTU to unlock."*
- **UBUNTU member** → **GET /resources/:id** for the same Partnership: **200** with full details and `contentUrl`.
- **Admin** → **GET /resources/:id** for any resource: **200** (admins bypass access check).

### Step 5: Update / Delete (as Admin only)
- **PATCH /resources/:id** with `tokenAdmin`: **200** and updated resource.
- **PATCH /resources/:id** with `tokenFree` or `tokenUbuntu`: **403** (insufficient role).
- **DELETE /resources/:id** with `tokenAdmin`: **200** and message like “Resource archived successfully”; that resource no longer appears in **GET /resources** (soft-delete).
- **DELETE /resources/:id** with `tokenFree`: **403**.

### Step 6: Chapter scoping (if you use chapterId)
- Create a resource with `chapterId` = Chapter A and `visibility: RESTRICTED`, `minTier: FREE`.
- User in **Chapter A**: sees it in list and can open it (200).
- User in **Chapter B** or **no chapter**: does **not** see it in list and gets **403** if they call GET by ID with that resource’s id.

---

## 4. What You ARE Expected to See

| Scenario | Expected result |
|----------|-----------------|
| Admin creates resource (POST /resources) | **201**, body with `message` and `data` (resource with id, title, type, visibility, minTier, etc.). |
| Admin lists resources (GET /resources) | **200**, `data` = all resources (no visibility filter), `meta` with total, page, limit, totalPages. |
| Admin gets any resource by id (GET /resources/:id) | **200**, full resource including `contentUrl`. |
| FREE member lists resources (GET /resources) | **200**, `data` only contains PUBLIC resources and RESTRICTED ones with minTier=FREE (and chapter match if chapterId set). |
| FREE member gets a FREE, public resource by id | **200**, full details and `contentUrl`. |
| FREE member gets a UBUNTU (or higher) resource by id | **403**, message: *"Your current membership does not include access to this [Type]. Upgrade to UBUNTU to unlock."* (or the relevant minTier). |
| UBUNTU member lists resources (GET /resources) | **200**, sees PUBLIC and RESTRICTED with minTier FREE or UBUNTU (and chapter match if applicable). |
| UBUNTU member gets UBUNTU resource by id | **200**, full details and `contentUrl`. |
| Community member (non-admin) calls POST/PATCH/DELETE /resources | **403** (forbidden – not Content Admin). |
| GET /resources/:id with invalid or deleted id | **404** “Resource not found”. |
| Request without valid JWT (or invalid token) | **401** Unauthorized. |
| Query filters (type, chapterId, tag, page, limit) on GET /resources | **200**, list filtered and paginated accordingly (within visibility rules). |

---

## 5. What You Are NOT Expected to See

| Scenario | You should NOT see |
|----------|--------------------|
| FREE member in list | RESTRICTED resources whose minTier is UBUNTU, IMANI, or KIONGOZI (unless they meet tier and chapter). |
| FREE member get by id | **200** for a resource with minTier = UBUNTU/IMANI/KIONGOZI; you must get **403** with the upgrade message. |
| Member in Chapter A in list | RESTRICTED resources that have `chapterId` = Chapter B (other chapter). |
| Member in Chapter A get by id | **200** for a resource with `chapterId` = Chapter B; you must get **403** (or it’s not in the list so you wouldn’t have the id). |
| Community member (non-admin) | **201** or **200** from POST or PATCH or DELETE /resources; you must get **403**. |
| Deleted resource | Deleted (archived) resources appearing in GET /resources or returned as **200** from GET /resources/:id. |
| List response for members | `contentUrl` in list items; list returns **cards** (no contentUrl). Only GET /resources/:id returns `contentUrl` when access is allowed. |
| Successful GET /resources/:id without access | **200** when the user’s tier is below minTier or chapter doesn’t match; you must get **403**. |

---

## 6. Quick Checklist

- [ ] Admin can POST /resources and get 201.
- [ ] Admin can PATCH /resources/:id and DELETE /resources/:id and get 200.
- [ ] Non-admin cannot POST/PATCH/DELETE; gets 403.
- [ ] GET /resources as FREE member returns only PUBLIC (and RESTRICTED with minTier FREE + chapter match).
- [ ] GET /resources as UBUNTU member returns PUBLIC + RESTRICTED with minTier FREE or UBUNTU (and chapter match).
- [ ] GET /resources/:id as FREE for a UBUNTU resource returns 403 with “Upgrade to UBUNTU to unlock.” (or correct type/minTier).
- [ ] GET /resources/:id as UBUNTU for that same resource returns 200 with contentUrl.
- [ ] Admin always gets 200 for GET /resources and GET /resources/:id for any resource.
- [ ] Invalid or non-existent id on GET /resources/:id returns 404.
- [ ] Unauthenticated requests get 401.

If all of the above match, the resource implementation is behaving as designed.
