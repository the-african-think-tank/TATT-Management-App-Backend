# Database setup (first-time tables + permissions)

## Problem
The app needs to **create** tables and enum types in PostgreSQL. If you see **"permission denied for schema public"**, the DB user in `.env` does not have permission to create objects.

---

## Option A: Use `postgres` for the first run (fastest)

1. In your **`.env`**, set the app to use the PostgreSQL superuser:
   ```env
   DB_USER=postgres
   DB_PASS=your_postgres_password
   ```
   (Use the password you use to connect in DBeaver as **postgres**.)

2. Run the app once so it creates all tables:
   ```bash
   npm run dev
   ```
   Wait until you see "Core Platform running on port 3000".

3. Turn off schema sync so the app stops changing the schema on every start:
   - Open `src/core/database/database.module.ts`
   - Change `synchronize: true` to **`synchronize: false`**
   - Save.

4. (Optional) Use `tatt_user` again for daily use:
   - In `.env`, set back:
     ```env
     DB_USER=tatt_user
     DB_PASS=emma
     ```
   - Run `npm run dev` again. The tables already exist, so `tatt_user` only needs read/write (which you already granted).

---

## Option B: Give `tatt_user` permission to create (then use it from the start)

Run this in **DBeaver** while connected as **postgres** (or another superuser), with **`tatt_db`** as the current database:

```sql
-- Allow tatt_user to create tables, types, and other objects in public
GRANT CREATE ON SCHEMA public TO tatt_user;

-- In PostgreSQL 15+, also grant default create so new objects are allowed
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO tatt_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO tatt_user;
```

Then run `npm run dev`. If you still get "permission denied for schema public", use **Option A** (postgres) once to create the tables, then switch back to `tatt_user` and set `synchronize: false`.

---

## Resources tables (Knowledge & Resource Hub)

The **Resources** feature uses its own tables: `resources` and `resource_interactions`. They are **not** created by the app when `synchronize: false`. You must run the migration once per database.

**Create the tables:**

1. Connect to your database (e.g. **tatt_db**) as a user that can create types and tables (e.g. **postgres**).
2. Run the migration script:
   - **DBeaver / pgAdmin:** Open `scripts/migrate-resources-tables.sql`, execute it.
   - **psql:**  
     ```bash
     psql -U postgres -d tatt_db -f scripts/migrate-resources-tables.sql
     ```

This creates the `resources` and `resource_interactions` tables (and their enum types).

**Grant permissions to the app user:** The tables are owned by the user who ran the migration (e.g. postgres). If your app connects as a different user (e.g. **tatt_user**), that user needs explicit grants:

- **DBeaver / pgAdmin:** Execute `scripts/grant-resources-tables.sql` as **postgres** (with **tatt_db** selected).
- **psql:**  
  ```bash
  psql -U postgres -d tatt_db -f scripts/grant-resources-tables.sql
  ```

After that, keep `synchronize: false`; the Resources API will work.

**Rollback (optional):** To drop only the Resources tables and their enums (e.g. for a clean re-run), use `scripts/rollback-resources-tables.sql`. Do not run this if you need to keep existing resource data.
