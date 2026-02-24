# TATT Management App Backend — Setup & Onboarding

This guide explains **what the project is**, **what’s already built**, and **how to run it on your machine** before you add new features (e.g. resource management).

---

## 1. What this project is

**TATT** = **The African Think Tank**. This repo is the **backend** for a membership and community platform. It provides:

- **REST API** for the frontend (auth, feed, chapters, connections, billing, etc.).
- **WebSockets** (Socket.IO) for real-time messaging.
- **Swagger/OpenAPI** docs at `/api-docs`.

It is built with:

- **NestJS** (Node.js framework)
- **TypeScript**
- **PostgreSQL** (via Sequelize)
- **JWT** + **Passport** (local + OAuth: Google, Apple, Microsoft)
- **Stripe** for subscriptions
- **Nodemailer** for transactional email
- **2FA** (TOTP + email OTP)

---

## 2. What has been done (current features)

| Area | What’s implemented |
|------|---------------------|
| **Auth (IAM)** | Sign-in/sign-up, JWT, OAuth (Google/Apple/Microsoft), password reset, 2FA (TOTP + email OTP), password rotation and history. |
| **Security** | 2FA setup/completion, admin 2FA policy, password policy. |
| **Chapters** | Regional chapters (CRUD, geolocation, codes). |
| **Interests** | Professional interests/skills taxonomy and user–interest linking. |
| **Connections** | Member networking: connection requests, network view, “TATT Connect” recommender. |
| **Feed** | Community feed: posts (GENERAL, RESOURCE, EVENT, ANNOUNCEMENT), rich text (plain/Markdown/HTML), likes, comments. |
| **Messages** | Direct messaging: REST for history/lists, Socket.IO for real-time delivery, typing, read receipts. |
| **Uploads** | `POST /uploads/media` for images/video/audio/documents; returns URLs for use in posts/messages. |
| **Billing** | Stripe subscriptions (tiers: FREE, UBUNTU, IMANI, KIONGOZI), webhooks, tier-based access. |
| **Mail** | Global mail module for transactional emails (password reset, etc.). |

**Roles** (examples): `SUPERADMIN`, `ADMIN`, `REGIONAL_ADMIN`, `MODERATOR`, `CONTENT_ADMIN`, `SALES`, `COMMUNITY_MEMBER`.  
**Tiers**: `FREE`, `UBUNTU`, `IMANI`, `KIONGOZI` (used for premium content and features).

The app does **not** use Sequelize migrations in the repo; the schema is driven by **entities** with `synchronize: false`, so you will create the database and then sync or add migrations yourself (see below).

---

## 3. Steps to run the project on your machine

Follow these in order. Each step is explained so you know why it matters.

---

### Step 1: Install Node.js and npm

- **Why:** The app runs on Node.js; npm installs dependencies and runs scripts.
- **What to do:** Install **Node.js 18+** (LTS) from [nodejs.org](https://nodejs.org). Verify:
  ```bash
  node -v
  npm -v
  ```

---

### Step 2: Install PostgreSQL

- **Why:** All app data (users, chapters, posts, connections, etc.) is stored in PostgreSQL. The app connects via Sequelize.
- **What to do:**
  - **Windows:** Install from [postgresql.org](https://www.postgresql.org/download/windows/) or use a package manager (e.g. Chocolatey: `choco install postgresql`).
  - **macOS:** `brew install postgresql@16` (or latest).
  - **Linux:** Use your distro’s package manager (e.g. `apt install postgresql`).
- **Create a database and user** (e.g. via `psql` or pgAdmin):
  ```sql
  CREATE USER tatt_user WITH PASSWORD 'your_password';
  CREATE DATABASE tatt_db OWNER tatt_user;
  ```
  Remember: `DB_USER`, `DB_PASS`, `DB_NAME` in `.env` must match this.

---

### Step 3: Clone and install dependencies

- **Why:** You already cloned; the repo doesn’t include `node_modules`, so you must install them.
- **What to do:** In the project root:
  ```bash
  cd TATT-Management-App-Backend
  npm install
  ```

---

### Step 4: Create and fill `.env`

- **Why:** The app reads configuration from environment variables (database, JWT, Stripe, mail, etc.). Without a valid `.env`, the server may not start or will misbehave.
- **What to do:**
  1. Copy the example file:
     ```bash
     copy .env.example .env
     ```
     (On macOS/Linux: `cp .env.example .env`.)
  2. Open `.env` and set at least:

  | Variable | What to set |
  |----------|-------------|
  | `NODE_ENV` | `development` |
  | `PORT` | `3000` (or another port) |
  | `DB_HOST` | `localhost` (or your DB host) |
  | `DB_PORT` | `5432` |
  | `DB_NAME` | `tatt_db` (same as the DB you created) |
  | `DB_USER` | Your PostgreSQL user (e.g. `tatt_user`) |
  | `DB_PASS` | That user’s password |
  | `JWT_SECRET` | A long random string (e.g. `openssl rand -hex 64`) |
  | `JWT_EXPIRES_IN` | `7d` |
  | `APP_SECRET` | At least 32 characters (e.g. `openssl rand -hex 32`) — used for 2FA secret encryption |

  **Optional for first run (can use placeholders):**

  - **Mail:** `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM`, `FRONTEND_URL` — needed for “forgot password” and 2FA email; you can leave defaults or use a test SMTP.
  - **Stripe:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*` — needed for subscriptions; use test keys and placeholder price IDs if you only want the app to start.
  - **CORS / API / Uploads:** `CORS_ORIGINS`, `API_BASE_URL`, `UPLOAD_DIR`, `UPLOAD_BASE_URL` — defaults are fine for local dev.

  **Important:** Never commit `.env`; it’s in `.gitignore`.

---

### Step 5: Create database tables (schema)

- **Why:** The app uses Sequelize with `synchronize: false`, so it does not create or alter tables automatically. You must create the schema once.
- **Options:**

  **Option A – Let Sequelize create tables (dev only)**  
  Temporarily set `synchronize: true` in `src/core/database/database.module.ts` (in the `useFactory` config), then start the app once so Sequelize creates tables. Then set `synchronize` back to `false` to avoid accidental schema changes.

  **Option B – Use migrations (recommended for real work)**  
  The repo doesn’t include migration files yet. You can:
  - Add Sequelize CLI and generate migrations from your entities, or
  - Export SQL from an existing DB / write migrations by hand and run them with `psql` or a migration runner.

  For a quick local run, Option A is enough.

---

### Step 6: Run the application

- **Why:** This starts the HTTP server and WebSocket server so you can call the API and open Swagger.
- **What to do:**
  ```bash
  npm run dev
  ```
  This runs `ts-node -r tsconfig-paths/register src/main.ts` (development with hot reload via your editor/process manager if you add one).

  You should see something like:
  - `Core Platform running on port 3000`
  - `Swagger UI → http://localhost:3000/api-docs`
  - `Upload dir → ...`

- **Verify:**
  - Open **http://localhost:3000/api-docs** — Swagger UI should load.
  - Try **POST /auth/signin** (or a public endpoint) to confirm the app responds.

---

### Step 7: (Optional) Create a first user

- **Why:** Many endpoints require a signed-in user (JWT). You need at least one user to test.
- **Options:**
  - Use **POST /auth/signup** (or the equivalent your API exposes for community signup) if available.
  - Or insert a user directly into the `users` table (with a hashed password) and then sign in via **POST /auth/signin**.

Use the returned JWT in Swagger: click “Authorize” and set the Bearer token.

---

## 4. Checklist before you change code

- [ ] Node 18+ and npm installed  
- [ ] PostgreSQL installed and running  
- [ ] Database `tatt_db` (or your `DB_NAME`) created  
- [ ] `.env` created from `.env.example` and required variables set (DB_*, JWT_SECRET, APP_SECRET)  
- [ ] `npm install` run  
- [ ] Schema created (sync once or run migrations)  
- [ ] `npm run dev` runs without errors  
- [ ] http://localhost:3000/api-docs opens and at least one request works  

---

## 5. Adding “resource management” later

You said you’ll add **resource management** functionality. As a backend developer, a typical order of work is:

1. **Design the domain**  
   Decide what a “resource” is (e.g. documents, links, events, rooms) and what operations you need (CRUD, publish/unpublish, categories, permissions).

2. **Add entities and DB schema**  
   Create Sequelize entities (and migrations if you use them), and register models in `src/core/database/database.module.ts`.

3. **Create a module**  
   e.g. `ResourceModule` with `ResourceController`, `ResourceService`, DTOs, and optionally guards (e.g. role-based access).

4. **Wire REST (and optionally WebSockets)**  
   Implement endpoints, document them in Swagger, and protect them with JWT and role guards (reuse `@Roles()`, `JwtAuthGuard`, etc.).

5. **Integrate with existing features**  
   If resources relate to chapters, feed, or billing, add the right relations and checks (e.g. tier required to access certain resources).

Once your local setup is working, you can start step 1 for resource management. If you want, we can break down “resource management” into concrete endpoints and tables next.
