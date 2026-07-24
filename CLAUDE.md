# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

Two independent projects, no root package.json. The repo was recently restructured: the old root-level Vite app moved into `frontend/`, and a new NestJS scaffold was added in `backend/`.

- `frontend/` — Vite + React 19 + TypeScript SPA
- `backend/` — NestJS 11 API with MongoDB (Mongoose) + Redis

Both packages use **pnpm** (each has its own `pnpm-lock.yaml`).
- `http/auth.http` — REST Client collection for hitting the API manually

Run commands from inside the respective subdirectory — not the repo root.

The backend follows the module conventions of the BetOnFire project (`C:\Users\Asus\Desktop\BetOnFire`): per-module `dto/`, `interface/`, `schema/` folders, raw Mongoose `new Schema()` (no decorators) with separate TS interfaces, and zero circular module deps (no `forwardRef`).

**Language rule (both packages):** all code — identifiers, types, schema fields, CSS class names, comments, logs, test descriptions — is in **English**. Only user-facing text is in **Spanish**: API response messages in the backend (exception messages, class-validator `message` options), and UI strings / labels / alerts in the frontend. Public URL paths stay in Spanish too (`/paquetes`, `/mis-citas`, `/admin/citas`) — they are user-visible.

## Commands

### Frontend (`cd frontend`, pnpm)

```bash
pnpm dev           # Vite dev server (port 5173)
pnpm build         # tsc -b && vite build
pnpm preview       # preview production build
```

No lint or test setup exists in the frontend.

### Backend (`cd backend`, pnpm)

```bash
pnpm start:dev     # watch mode (listens on PORT env var, default 3000)
pnpm build
pnpm lint          # eslint with --fix
pnpm test          # jest unit tests (*.spec.ts under src/)
pnpm test -- auth.service     # single test file (matches testRegex)
pnpm test:e2e      # full auth-flow e2e (test/jest-e2e.json)
pnpm db:seed:users        # seed demo users (plan/dry-run — prints, writes nothing)
pnpm db:seed:users:apply  # actually create admin/client/washer demo users
```

DB scripts live in `backend/scripts/` and run with `tsx` (excluded from `nest build` via `tsconfig.build.json`). They follow BetOnFire's plan/apply convention, but mode is chosen with an `--apply` argv flag instead of env vars (Windows-compatible). Always run the plan variant first.

Backend env lives in `backend/.env` (see `.env.example`): `MONGODB_URI`, `REDIS_URL`, `SECRET_KEY`, `ALLOWED_ORIGINS`, `ADMIN_EMAIL`/`ADMIN_PASSWORD`. `pnpm start:dev` needs real MongoDB + Redis running; the e2e suite instead uses `mongodb-memory-server` for Mongo but a **real local Redis** (db 15) — Redis must be up for `pnpm test:e2e` to pass. Jest maps `src/*` imports via `moduleNameMapper` in both configs.

## Architecture

The app is a Spanish-language carwash (autolavado) booking system for "Monkey Wash". The UI is Spanish; the code is English (see language rule above). Spanish↔English domain glossary: `cita`=appointment, `lavador`=washer, `paquete`=package, `horario`=time slot, `cliente`=customer/client.

### Backend

**Auth model — read before adding any endpoint.** Two global guards are registered via `APP_GUARD` in `app.module.ts`: `AuthGuard` (JWT + Redis session) then `RolesGuard`. Every route requires a Bearer token unless decorated with `@SkipAuth()`; `@Roles('admin')` (usable at class or handler level) restricts by role on top. Decorators live in `src/auth/auth.decorator.ts` (`SkipAuth`, `Roles`, `CurrentUser`).

Login issues a JWT (7d, signed with `SECRET_KEY`) whose `jti` is mirrored as a Redis key `session:<userId>:<jti>` (`src/session/session.service.ts`). A token is only valid while its Redis key exists — logout/deactivation deletes the keys, making sessions revocable. `AuthGuard` additionally does a minimal `users` lookup (`isActive`) per request so deactivating a user cuts access instantly. Keep `SESSION_TTL_SECONDS` (auth.service.ts) in sync with the JwtModule `expiresIn`.

Module wiring: `SessionModule`, `RedisModule` are `@Global()`; `AuthModule` is `@Global()` and registers `JwtModule` globally. `UserModule` must NOT import `AuthModule` (would create a cycle) — cross-module session invalidation goes through `SessionService`, not `AuthService`.

NoSQL-injection defense is layered: `SanitizationMiddleware` (`src/sanitization/`, applied to all routes in `app.module.ts` `configure()`) strips `$`-prefixed keys from `params`/`body`/`query` **in place** — Express 5 makes `req.query` getter-only, so never rewrite the middleware to reassign those objects. On top of that, DTO validation (`whitelist: true`) rejects non-string bodies and prunes unknown query keys; note Express 5's "simple" query parser never produces nested objects from query strings. Query params that filter Mongo queries must go through a validated DTO (see `FindUsersQueryDTO`).

Roles: `admin | washer | client` (`src/user/interface/user.interface.ts`). `/auth/register` always creates `client`; admins create `washer`/`admin` users via `POST /users`. On first boot with an empty DB, `UserService.onApplicationBootstrap` seeds an admin from `ADMIN_EMAIL`/`ADMIN_PASSWORD` (defaults match the frontend's hardcoded `admin@monkey.com`/`admin`); `pnpm db:seed:users:apply` additionally creates demo client/washer users. Users are soft-deleted (`isActive: false`), never removed.

### Frontend

**Backend integration: auth only (so far).** `frontend/src/api.ts` is the API client — base URL from `VITE_API_URL` (`frontend/.env`, default `http://localhost:3000`), typed `api.login/register/logout/me`, `ApiError` carrying the backend's Spanish message, and the session persisted under localStorage key `autolavado_auth`. `Login.tsx` calls `POST /auth/login` and only lets `role === 'admin'` into the panel (other roles get their session revoked immediately); `AdminLayout` redirects to `/login` unless an admin session exists and its logout button calls `POST /auth/logout`. Domain data (appointments, washers, customer) is still mock state in the store — NOT wired to the API yet.

All domain state lives in a single React Context (`frontend/src/store.tsx`) seeded with mock data and persisted to `localStorage` (key `autolavado_data`, debounced 300ms). When wiring more endpoints, `api.ts` + this store are the integration points.

**Two route trees** in `frontend/src/App.tsx`:
- `/admin/*` — admin panel wrapped in `AdminLayout` (sidebar). Login is hardcoded in `Login.tsx`: `admin@monkey.com` / `admin`. Several sections (clientes, finanzas, inventario, configuraciones) render `AdminPlaceholder`.
- `/*` — public client pages with `Navbar`/`Footer`. Booking flow: `Landing` → `Packages` (`/paquetes`) → `Schedule` (`/horarios`) → `ConfirmAppointment` (`/confirmar-cita`) → `Success` (`/exito`); `MyAppointments` (`/mis-citas`) manages existing appointments.
- `WasherLayout`/`WasherDashboard` exist but are **not routed** — the washer role moved to the mobile app (APK served from `frontend/public/assets/Carwash.apk`). The washer dashboard uses `html5-qrcode` for scanning appointment QR codes.

**Domain model** (`frontend/src/types.ts`):
- Service catalog is hardcoded in `PACKAGES_BY_SIZE`, keyed by `VehicleSize` (`small | medium | large | motorcycle | trailer`). Package prices/durations vary by vehicle size; package ids still encode the old Spanish size initials (`c1`, `m2`, `g3`, `mc1`, `t1`) — they are opaque ids, don't rename.
- `Appointment.status` lifecycle: `pending → confirmed → in_progress → ready_for_pickup → completed`, plus `cancelled`. Spanish labels for statuses live in per-page `STATUS_LABEL` maps.
- Vehicle type label → `VehicleSize` mapping lives in `vehicleTypeToSize` (`store.tsx`).
- localStorage key `autolavado_data` predates the rename: old persisted data (Spanish field names) is silently ignored and mocks are used instead.

**External APIs** (`frontend/src/utils.ts`, called directly from the browser):
- NHTSA vPIC (`vpic.nhtsa.dot.gov`) for vehicle makes/models/types; large regex tables classify models into body types (SUV, Sedan, Motorcycle, Trailer, etc.).
- Wikimedia Commons search for vehicle images (results cached in a module-level `Map`).

**Styling**: one global stylesheet (`frontend/src/index.css`, ~1600 lines) using CSS variables (`--primary`, `--gray`, etc.), combined with inline styles in components. No CSS modules or Tailwind. Icons come from `lucide-react`.

### Deployment

Frontend deploys to Vercel (`frontend/vercel.json`, output `dist/`). A separate client-facing mobile/PWA app lives at `washin-machine.vercel.app` — this web app is the staff/admin side.
