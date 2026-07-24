# 🎟️ Crescent Live — Event Ticket & Reservation System

A full-stack booking platform for **Crescent Live Event Hall**, a single-venue business
digitalizing its ticketing workflow to sell directly to customers instead of relying on
third-party platforms and manual box-office sales.

Built with **Next.js**, **TypeScript**, **Tailwind CSS**, and **MongoDB**.

**Team:** Mahmoud Audi · Mohammad Ali · Mohammad Dib
**Course project** — Next.js capstone, single-business booking application

> **Branch scope:** this `admin` branch implements the **Admin Dashboard module**
> (Jira epics ETS-18, ETS-19, ETS-20, ETS-21) — event management, bookings management,
> user management, and platform statistics. The public-facing site (home page, event
> discovery, seat/ticket selection, checkout, user account) is separate, ongoing work —
> see the team Jira board for that scope.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Admin Dashboard](#admin-dashboard-admin-admin-role-only)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Known Limitations / Next Steps](#known-limitations--next-steps)
- [Project Structure](#project-structure)

---

## Tech Stack

- **Frontend & Backend:** Next.js (App Router, React Server Components)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** MongoDB Atlas · Mongoose ODM
- **Auth:** NextAuth.js (Auth.js) v5, credentials + JWT sessions, role-based (`USER` / `ADMIN`)
- **Charts:** Recharts
- **Icons:** lucide-react

## Getting Started

### Prerequisites

- Node.js 20+
- A MongoDB Atlas connection string (ask a teammate for the shared cluster credentials, or use your own)

### Installation

```bash
git clone https://github.com/mahmoudaudi/event-ticket.git
cd event-ticket
git checkout admin
cp .env.example .env.local
```

Edit `.env.local`:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/event_ticket_db
AUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
```

> **Windows without OpenSSL?** Generate a secret in PowerShell instead:
> `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))`
>
> **Save `.env.local` as UTF-8, not UTF-16.** Notepad and some editors default to
> UTF-16 on Windows, which breaks the dotenv parser silently (it reports
> `injected env (0)`). If that happens, rewrite the file with:
> `Get-Content .env.local -Raw | Out-File -FilePath .env.local -Encoding ascii -NoNewline`

Install dependencies and seed sample data:

```bash
npm install
npm run seed   # wipes and re-seeds users, categories, events, bookings, payments
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> ⚠️ `npm run seed` **wipes** the users/categories/events/bookings/payments collections
> before re-seeding. Check with the team before running it against the shared cluster —
> agree on one person seeding once, rather than everyone re-seeding independently.

### Seeded accounts

| Role  | Email                       | Password       |
|-------|-----------------------------|----------------|
| Admin | admin@crescentlive.com      | Admin123!      |
| User  | jane.doe@example.com        | Password123!   |

Sign in at `/login` — admins are redirected to `/admin`, other users to `/`.

## Admin Dashboard (`/admin`, ADMIN role only)

Protected by Edge middleware (`middleware.ts`) plus a server-side session check in `src/app/admin/layout.tsx`.

| Page | Path | Features |
|---|---|---|
| Overview | `/admin` | Revenue/events/bookings/user KPIs with trend %, date-range selector (7/30/90 days), booking-volume chart, recent activity feed, loading skeleton |
| Events | `/admin/events` | Search, status filter, capacity/revenue rollups, create/edit/delete, duplicate as draft, drag-and-drop image upload (multi-image, cover selection), per-event ticket tier management, empty states, loading skeleton |
| Bookings | `/admin/bookings` | Three tabs — **Table** (search, status filter, date-range filter, confirm/cancel, detail modal, bulk actions, CSV export), **Calendar** (month view of events by date, click to edit), **Activity** (booking-specific audit trail: confirms/cancels) |
| Users | `/admin/users` | Search, per-user booking count, role change, activate/suspend with confirmation dialog, empty states, loading skeleton |
| Logs | `/admin/logs` | Three tabs: **Admin Actions** (full audit trail, all action types), **Login Activity** (every sign-in attempt, success or failure, with reason), **Error Logs** (application errors read live from `logs/error.log`) |
| Settings | `/admin/settings` | Admin profile, change password |

> **Why Calendar/Activity live inside Bookings but Logs stays separate:** Calendar visualizes events by date and Activity shows booking-specific audit entries — both are naturally booking-context views. Login Activity and Error Logs aren't booking-specific (they're login attempts and application-wide errors), so nesting them under Bookings would be confusing; they stay in their own global Logs section instead. `/admin/calendar` and `/admin/activity` still exist as redirects to their new locations, so old links/bookmarks don't break.

Both the topbar search box and notification bell are fully functional (not decorative):
searching queries live events/users and navigates to the right screen; the bell surfaces
bookings awaiting confirmation with a live count badge.

### Notable implementation details

- **Toast notifications** (`useToast()`) confirm or explain the outcome of every mutating action across the admin UI.
- **Search is regex-escaped** (`src/lib/regex.ts`) and requests are de-duplicated via `AbortController` (`src/hooks/useDebouncedFetch.ts`) so a slow response to an old keystroke can never overwrite a newer one.
- **Confirmation dialogs** (`src/components/admin/ConfirmDialog.tsx`) replace native `confirm()` for destructive actions.
- **Client + server validation share one Zod schema** (`src/lib/validation/event.ts`) so form errors surface instantly, not just after a round-trip.
- **Image uploads** are validated (JPEG/PNG/WEBP, 5MB max) and stored under `public/uploads/events/`. This needs zero external account setup and works great for local dev / any traditional Node.js host — but a local filesystem does **not** persist on serverless platforms with ephemeral storage (e.g. Vercel). If this project is deployed there, swap the storage calls in `src/app/api/admin/uploads/route.ts` for an object-storage SDK (Cloudinary, Vercel Blob, S3); the request/response shape is designed to stay the same so `ImageUploader.tsx` wouldn't need to change.
- **Audit log** (`AdminActivity` model) is a separate concern from the dashboard's "Recent Activity" feed: the dashboard feed reflects business events (new booking, new signup, new event) sourced live from those collections, while the audit log specifically records admin-initiated actions.
- **Topbar search** (`GlobalSearch.tsx`) queries events and users live, and navigates straight to the right screen: an event result opens its edit page, a user result opens the Users table pre-filtered to that person (`/admin/users?search=...`).
- **Topbar notifications** (`NotificationsBell.tsx`) surface bookings awaiting confirmation, with a live count badge and a "View all pending bookings" link that deep-links to `/admin/bookings?status=PENDING`.
- **Error logging** (`src/lib/logger.ts` + `withErrorLogging.ts`): every `/api/admin/*` route is wrapped so any unexpected thrown error is caught, logged with a timestamp/message/stack trace/request context to `logs/error.log`, and turned into a clean 500 response instead of leaking a stack trace to the client or failing silently. View them at `/admin/logs` → Error Logs tab. Same local-filesystem caveat as image uploads: fine for local dev/traditional hosting, would need swapping for a hosted logging service (Sentry, Logtail, etc.) on serverless.
- **Login activity audit trail** (`LoginActivity` model): every sign-in attempt is recorded — success, or a specific failure reason (`unknown_email`, `invalid_password`, `account_suspended`) — logged from the NextAuth `authorize()` callback in `src/lib/auth.ts`. Viewable at `/admin/logs` → Login Activity.
- **Events calendar** (`/admin/bookings?view=calendar`): month view built from a pure date-grid helper (`src/lib/calendarGrid.ts`), showing each event on its date with a booking count and a status-colored dot; clicking an event opens its edit page directly. Navigation is URL-param driven (`?view=calendar&month=YYYY-MM`), so the whole tab stays server-rendered with no client JS needed.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check database connection |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth session/sign-in handlers |
| GET | `/api/admin/stats?range=7\|30\|90` | Dashboard KPIs + chart + activity feed |
| GET/POST | `/api/admin/events` | List (paginated/search/filter) / create event |
| GET/PATCH/DELETE | `/api/admin/events/[id]` | Read / update / delete an event |
| POST | `/api/admin/events/[id]/duplicate` | Clone an event + its ticket tiers as a new draft |
| POST | `/api/admin/events/[id]/ticket-types` | Add a ticket tier to an event |
| PATCH/DELETE | `/api/admin/ticket-types/[id]` | Update / remove a ticket tier |
| GET/POST | `/api/admin/categories` | List / create categories |
| GET | `/api/admin/bookings?dateRange=7\|30\|90\|ALL` | List bookings (paginated/search/filter/date-range) |
| GET | `/api/admin/bookings/[id]` | Full booking detail (ticket line items, totals) |
| PATCH | `/api/admin/bookings/[id]` | Confirm or cancel a booking (logs to audit trail) |
| PATCH | `/api/admin/bookings/bulk` | Bulk confirm/cancel multiple bookings |
| GET | `/api/admin/bookings/export` | CSV export, respects current search/status/date filters |
| GET | `/api/admin/users` | List users (paginated/search) |
| PATCH | `/api/admin/users/[id]` | Change role / active status (logs to audit trail) |
| GET | `/api/admin/activity` | Paginated admin audit log |
| GET | `/api/admin/search?q=` | Topbar quick search (events + users) |
| GET | `/api/admin/notifications` | Pending-booking count + items for the topbar bell |
| POST/DELETE | `/api/admin/uploads` | Upload / delete event images |
| PATCH | `/api/admin/profile` | Change own password |

All `/api/admin/*` routes are guarded server-side by `requireAdmin()` (`src/lib/guards.ts`) and wrapped in `withErrorLogging()` (`src/lib/withErrorLogging.ts`), independent of the middleware.

## Database Schema

### Collections

- **users** — accounts (`USER` / `ADMIN` roles, bcrypt-hashed passwords)
- **categories** — event categories
- **events** — events with venue, date, status, banner + gallery images
- **tickettypes** — ticket tiers per event (price, capacity, remaining seats)
- **bookings** — booking records with ticket line items
- **promocodes** — discount codes
- **payments** — payment records
- **adminactivity** — audit trail of admin-initiated actions (booking status changes, user role/active changes)
- **loginactivity** — every sign-in attempt (success/failure + reason), regardless of role
- **seats** / **reservedseats** — per-seat inventory (schema present for a possible future interactive seat map; **the current admin/booking data model uses general-admission `tickettypes`, not per-seat assignment** — if another branch implements seat selection against `seats`/`reservedseats`, that's a different inventory model and needs reconciling with this one before checkout is built on top of either)

### Files (not database) generated at runtime

- **`logs/error.log`** — newline-delimited JSON error log, written by `withErrorLogging()`. Gitignored (only `logs/.gitkeep` is tracked).
- **`public/uploads/events/`** — uploaded event images. Gitignored (only `.gitkeep` is tracked).

## Known Limitations / Next Steps

- **Image storage is local-disk**, not suitable for serverless deployment as-is (see note above).
- **Error logs are also local-disk** (`logs/error.log`), same serverless caveat — swap for a hosted logging service if deployed there.
- **ETS-20 scope**: this covers the admin-side upload experience. The public booking flow (browsing, checkout, e-tickets) is a separate, not-yet-built phase.
- **Public site** (home page, event discovery, seat/ticket selection, checkout, user dashboard) is out of scope for this module — see the team's Jira board for that work.

## Project Structure

```
src/
├── app/
│   ├── admin/             # Admin dashboard pages (protected)
│   │   ├── activity/       # Redirects to /admin/logs?tab=admin (legacy link support)
│   │   ├── bookings/       # Tabbed: Table / Calendar / Activity
│   │   ├── calendar/       # Redirects to /admin/bookings?view=calendar (legacy link support)
│   │   ├── events/
│   │   ├── logs/           # Tabbed: Admin Actions / Login Activity / Error Logs
│   │   ├── settings/
│   │   ├── users/
│   │   └── loading.tsx     # Per-route loading skeletons
│   ├── api/
│   │   ├── admin/          # Admin REST endpoints (all wrapped in withErrorLogging)
│   │   ├── auth/           # NextAuth handler
│   │   └── health/
│   ├── login/
│   └── page.tsx
├── components/
│   ├── admin/              # Sidebar, Topbar, tables, charts, forms, modals, TabBar, AuditLogList, PageLinkPagination
│   ├── auth/                # LoginForm
│   ├── providers/           # Session + Toast providers (mounted at root layout)
│   └── ui/                  # Button, Card, Badge, Modal, ConfirmDialog, EmptyState, Skeleton, Field
├── hooks/
│   ├── useDebouncedFetch.ts # Debounced, abort-safe data fetching for search/filter tables
│   └── useClickOutside.ts  # Closes dropdowns/popovers on outside click
├── lib/
│   ├── admin/                # Shared query/mutation logic:
│   │   ├── stats.ts            #   dashboard KPIs
│   │   ├── events.ts           #   event + ticket tier CRUD
│   │   ├── bookings.ts         #   booking list/detail/status/export
│   │   ├── users.ts            #   user list/role/active
│   │   ├── activity.ts         #   admin action audit log (+ booking-scoped filter for the Bookings Activity tab)
│   │   ├── logins.ts           #   login attempt audit log
│   │   ├── logs.ts             #   reads logs/error.log for the UI
│   │   ├── calendar.ts         #   events-by-month for the calendar page
│   │   ├── search.ts           #   topbar quick search
│   │   └── notifications.ts    #   topbar pending-booking bell
│   ├── validation/            # Zod schemas (shared by client + API)
│   ├── auth.ts / auth.config.ts  # NextAuth (edge-safe config split from DB-backed config)
│   ├── guards.ts              # requireAdmin() for API routes
│   ├── db.ts                  # Mongoose connection
│   ├── password.ts            # bcrypt hashing
│   ├── regex.ts                # Safe regex-escaping for search input
│   ├── csv.ts                  # CSV serialization for exports
│   ├── logger.ts               # File-based error logger (logs/error.log)
│   ├── withErrorLogging.ts     # Route handler wrapper using logger.ts
│   └── calendarGrid.ts         # Pure month-grid builder for the calendar page
├── models/                     # Mongoose schemas (incl. AdminActivity, LoginActivity)
└── types/                      # Shared TypeScript types
logs/
└── error.log                    # Generated at runtime, gitignored (only .gitkeep tracked)
public/
└── uploads/events/              # Uploaded event images (gitignored, kept out of version control)
scripts/
└── seed.ts                      # Sample data seed script
```
