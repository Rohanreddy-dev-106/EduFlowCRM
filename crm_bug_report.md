# 🔴 CRM Backend Crash Report — Full Audit

> **Presentation: Tomorrow** — Here's everything that's broken and the fixes.

---

## 🚨 CRITICAL: Backend Crash Bugs (These kill the server)

### Bug 1: `.env` file is in the WRONG LOCATION
**Severity:** 🔴 CRASH — Server won't start  
**File:** `Backend/src/.env` (wrong!) — should be `Backend/.env`

Your `.env` file is at `Backend/src/.env` but:
- `server.js` calls `dotenv.config()` from the **Backend root**, which looks for `Backend/.env`
- `prisma.config.ts` uses `dotenv/config` which also looks at the root
- `prismaClient.js` has a manual fallback path (`../../.env` from `src/db/`) but even that resolves to `Backend/.env`

**There is NO `.env` at `Backend/.env`** — so `DATABASE_URL`, `JWT_SECRET`, `PORT`, etc. are all `undefined`.

**Result:** The server crashes instantly with:
```
Error: DATABASE_URL is required for Prisma
```
Or if Prisma somehow loads, JWT_SECRET is missing, so every auth call crashes.

**Fix:** Move/copy `Backend/src/.env` → `Backend/.env`

---

### Bug 2: Express 5 breaking change — Error handler signature
**Severity:** 🔴 CRASH — Unhandled errors crash the process  
**File:** `Backend/index.js` lines 62-97

You're using **Express 5** (`"express": "^5.2.1"`). In Express 5, the 4-argument error handler `(err, req, res, next)` is **no longer automatically recognized** as an error handler by just having 4 params. Express 5 requires you to explicitly register error-handling middleware using `router.use` or the function **must** have exactly the signature `(err, req, res, next)` — but Express 5 also changed how it routes errors internally.

More critically, in Express 5, **if an async route handler throws (rejects), Express 5 catches it and forwards it to error middleware** — unlike Express 4. But your error handler has `_next` as the param name; while this works, the real issue is that **some of your route handlers mix `return res.status()` with `next(err)` patterns inconsistently**, which can cause "headers already sent" crashes.

**Fix:** Add `process.on('unhandledRejection')` and `process.on('uncaughtException')` handlers to `server.js` so the server doesn't silently crash.

---

### Bug 3: No `url` in Prisma datasource — schema.prisma is incomplete
**Severity:** 🔴 CRASH  
**File:** `Backend/prisma/schema.prisma` lines 5-7

```prisma
datasource db {
  provider = "mysql"
}
```

The datasource block has **no `url` property**. While `prisma.config.ts` provides the URL at migration time, and `prismaClient.js` uses the adapter pattern, the Prisma CLI commands (`prisma generate`, `prisma migrate`) will fail without the URL in the schema or a `--url` flag. This is a known Prisma 7 pattern, but it means:

- `npx prisma generate` may fail for first-time setup
- If the generated client is stale/missing, the entire backend crashes on import

**Fix:** This is actually intentional for Prisma 7 with `prisma.config.ts`, so it should be fine — **but you must ensure `npx prisma generate` has been run at least once**. Run:
```bash
cd Backend && npx prisma generate
```

---

### Bug 4: `server.js` — `server.listen()` callback doesn't catch startup errors
**Severity:** 🟡 SILENT CRASH  
**File:** `Backend/server.js`

```js
try {
    server.listen(PORT, () => {
        console.log(`Server is Up and Running at PORT ${PORT}`);
    });
} catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
}
```

The `try/catch` here is **useless** — `server.listen()` is asynchronous and never throws synchronously. If the port is in use or binding fails, the error goes to an `"error"` event, not a catch block. You need `server.on("error", ...)`.

Additionally, there are **no handlers for `unhandledRejection` or `uncaughtException`**, meaning any unhandled async error (like a DB connection failure) crashes the process silently with no logs.

---

## 🟡 MEDIUM: Bugs That Cause Runtime Failures

### Bug 5: PORT mismatch between Backend and Frontend
**Severity:** 🟡 Requests fail silently  

| Config | Value |
|--------|-------|
| `Backend/src/.env` → PORT | `6060` |
| `Backend/.env.example` → PORT | `5000` |
| `Frontend/.env.local` → NEXT_PUBLIC_BACKEND_URL | `http://localhost:6060` |
| `Frontend/lib/api.ts` fallback | `http://localhost:5000` |

If dotenv doesn't load (Bug 1), the backend defaults to port **5000** (`server.js` line 2). But the frontend is hardcoded to call **port 6060**. So even if the backend starts, frontend API calls all fail.

**Fix:** After fixing Bug 1, ensure both agree on a port. Currently `.env` says 6060, so `api.ts`'s fallback should also be 6060, or just fix the `.env` location.

---

### Bug 6: Frontend `prisma.ts` imports Backend's Prisma client via relative path
**Severity:** 🟡 Build may fail  
**File:** `Frontend/lib/prisma.ts`

```ts
import "server-only";
export { default } from "../../Backend/src/db/prismaClient.js";
```

This cross-project import is fragile:
- It only works if both projects share the same `node_modules` resolution context
- The Backend's `prismaClient.js` imports `@prisma/adapter-mariadb` and `@prisma/client` — those must be installed in the **Frontend's** `node_modules` too (which they are for `@prisma/client`, but `@prisma/adapter-mariadb` is **NOT** in the Frontend's `package.json`)
- If the Prisma client wasn't generated in the Backend, this import crashes the Frontend's server-side rendering

**Impact:** Frontend API routes (`/api/prospects`, `/api/analytics`) that use Prisma directly will crash.

---

### Bug 7: `server-only` package may not be installed
**Severity:** 🟡 Build crash  
**File:** `Frontend/lib/prisma.ts`

`import "server-only"` is used but `server-only` is not listed in `Frontend/package.json` dependencies. Next.js 14 may bundle it implicitly, but it's safer to have it explicitly.

---

### Bug 8: Seed script deletes AuditLogs' parent Prospects without cleaning AuditLogs first
**Severity:** 🟡 Seed crashes  
**File:** `Backend/prisma/seed.js` lines 111-113

```js
await prisma.onboardingChecklist.deleteMany();
await prisma.prospectNote.deleteMany();
await prisma.prospect.deleteMany();  // ← AuditLog references Prospect (onDelete: Cascade)
```

The `Prospect` model has `auditLogs AuditLog[]` with `onDelete: Cascade`, so deleting prospects **should** cascade-delete audit logs. However, the delete order should still clean audit logs first to avoid potential FK constraint errors with some MySQL/MariaDB configurations. This is likely fine due to CASCADE, but worth noting.

---

## 🔵 LOW: Issues to Fix Before Presentation

### Bug 9: `MONGODB_CONNECTION_STRING` in `.env` — stale config
**File:** `Backend/src/.env` line 2
```
MONGODB_CONNECTION_STRING="mongodb://localhost:27017/CRM"
```
This is from a previous MongoDB-based version. It's unused but confusing.

### Bug 10: Duplicate `createCard` logic
**Files:** `Backend/src/repo/cards.repo.js:91-105` and `Backend/src/service/card.service.js:28-53`

Both `Repositories.createCard()` and `createCardService()` create prospects with nearly identical logic. The controller uses `createCardService` for POST, but `Repositories.createCard` is never called. Dead code.

### Bug 11: `onbord.chicklist.js` is never imported
**File:** `Backend/src/utils/onbord.chicklist.js`

This file defines `createOnboardingChecklist()` but it's **never imported** anywhere. The actual checklist creation logic is duplicated in `card.service.js`. This is dead code.

---

## ✅ FIX PLAN — Do These Steps to Present Tomorrow

### Step 1: Move `.env` to correct location
```bash
copy "Backend\src\.env" "Backend\.env"
```

### Step 2: Fix `server.js` to handle crashes gracefully
Add proper error handling and unhandled rejection handlers.

### Step 3: Ensure Prisma client is generated
```bash
cd Backend && npx prisma generate
```

### Step 4: Verify MariaDB/MySQL is running
Make sure your database server is actually running on `localhost:3306` with the credentials in `.env`.

### Step 5: Run the seed if DB is empty
```bash
cd Backend && node prisma/seed.js
```

### Step 6: Start backend, then frontend
```bash
# Terminal 1
cd Backend && npm run dev

# Terminal 2  
cd Frontend && npm run dev
```

---

## Architecture Summary (For Your Presentation)

```
Frontend (Next.js 14, port 3000)
  ├── /api/auth/* → proxies to Backend Express API
  ├── /api/prospects/* → Prisma direct (via Backend's prismaClient.js)
  ├── /api/analytics/* → Prisma direct
  └── Dashboard → KanbanBoard + Auth

Backend (Express 5, port 6060)
  ├── /api/auth/* → JWT auth (bcrypt + cookie)
  ├── /api/cards/* → CRUD with Zod validation
  ├── /api/analytics/* → Raw SQL aggregations
  └── Prisma 7 + MariaDB adapter
```

> **Key insight:** Your Frontend has a **hybrid architecture** — auth routes proxy to the Backend, but prospect/analytics routes talk to the DB directly via Prisma. This means the Backend must be running for **login/register/auth** to work, but CRUD operations go straight to the DB from Next.js server-side code.
