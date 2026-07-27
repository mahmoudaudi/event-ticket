# Aurum — Event Ticket & Reservation System

A full-stack event ticketing platform built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, **MongoDB**, and **NextAuth.js**.

Users can browse events, select seats, apply promo codes, pay with a real card via **Stripe Checkout**, receive e-tickets with QR codes, and cancel reservations. Admins manage events, bookings, users, promo codes, and view analytics.

Built by **Mahmoud Audi** · **Mohammad Ali** · **Mohammad Dib**

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [Seed Data](#seed-data)
- [Login Credentials](#login-credentials)
- [Accessing from Mobile](#accessing-from-mobile)
- [Payments (Stripe)](#payments-stripe)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Known Limitations](#known-limitations)

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | >= 18 | Required by Next.js 16 |
| npm | >= 9 | Comes with Node |
| MongoDB | Atlas (recommended) or local | A running instance |
| Git | — | For cloning |

Optional (for full functionality):

| Tool | Purpose |
|------|---------|
| Google Maps API key | Interactive location picker in the admin event form |
| Google OAuth credentials | "Sign in with Google" |
| SMTP credentials | Password reset emails |
| Groq API key | Chatbot AI assistant |
| Stripe test-mode keys + [Stripe CLI](https://stripe.com/docs/stripe-cli#install) | Checkout payments — required to test the checkout flow at all, see [Payments (Stripe)](#payments-stripe) |

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

### Required

```
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>
JWT_SECRET=<any-random-string>
AUTH_SECRET=<any-random-string>
```

### Optional

```
# App URL (used for QR codes / links)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# Google Maps (admin location picker)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=xxx

# SMTP (forgot password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=<app-password>
SMTP_FROM=you@gmail.com

# Groq AI (chatbot)
GROQ_API_KEY=xxx

# Stripe (see "Payments (Stripe)" below for how to test this locally)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## Installation

```bash
git clone <repo-url>
cd event-ticket-app
npm install
```

---

## Running the App

```bash
# Development
npm run dev

# Accessible on network (for mobile testing)
npm run dev -- -H 0.0.0.0

# Production build
npm run build && npm start
```

The app runs at **http://localhost:3000** by default.

---

## Seed Data

```bash
npm run seed
```

This creates:

- **7 events** with ticket types and seats
- **~66 bookings** spread across the last 30 days
- **7 users** (1 admin + 6 customers)
- **Promo codes**, categories, and admin activity logs

---

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@crescentlive.com | Admin123! |
| **User** | jane.doe@example.com | Password123! |

---

## Accessing from Mobile (QR Code Scanning)

1. Start the dev server on your network:
   ```bash
   npm run dev -- -H 0.0.0.0
   ```
2. Find your local IP:
   ```bash
   hostname -I   # e.g. 192.168.1.20
   ```
3. Set the URL in `.env.local`:
   ```
   NEXT_PUBLIC_APP_URL=http://192.168.1.20:3000
   ```
4. Re-seed to update QR codes:
   ```bash
   npm run seed
   ```
5. Access from your phone at `http://192.168.1.20:3000` (same WiFi).

---

## Payments (Stripe)

Checkout uses **Stripe Checkout** — a Stripe-hosted payment page. Card details
are entered on Stripe's own page and never touch our server, so there's no
raw card data to secure or store.

### How it works

1. On the checkout page, submitting the form calls `POST /api/checkout/create-session`.
   This holds the selected seats (marks them `RESERVED` for 30 minutes so nobody
   else can grab them mid-payment) and creates a Stripe Checkout Session for the
   order total.
2. The browser is redirected to Stripe's hosted page to enter card details.
3. On success, Stripe redirects back to `/checkout/success?session_id=...`, which
   calls `POST /api/checkout/confirm` to verify the payment actually went through,
   then creates the `Booking` (seats flip to `BOOKED`), and redirects to the
   existing `/confirmation/[bookingId]` page.
4. `POST /api/webhooks/stripe` is a second, independent path to the same result —
   it's the safety net for a buyer who closes the tab before step 3 completes
   (`checkout.session.completed`), and it releases the seat hold if a session
   expires unpaid (`checkout.session.expired`). Both this and step 3 call the
   same idempotent helper (`fulfillBookingFromStripeSession` in
   `src/lib/bookingFulfillment.ts`), so whichever one runs first wins — the
   `Booking.stripeSessionId` field has a unique index that prevents a duplicate.

### Setting it up locally

1. Get a **test-mode** secret key from your Stripe Dashboard → Developers →
   [API keys](https://dashboard.stripe.com/test/apikeys) (starts with `sk_test_...`).
   Put it in `.env.local` as `STRIPE_SECRET_KEY`.
2. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli#install) and log in:
   ```bash
   stripe login
   ```
3. In a separate terminal, forward webhook events to your dev server (keep this
   running while you test):
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   It prints a signing secret like `whsec_...` — put that in `.env.local` as
   `STRIPE_WEBHOOK_SECRET`, then (re)start `npm run dev`.
4. Go through the app: log in → pick an event → **Select Seats** → choose a seat →
   **Continue to checkout** → fill in the contact fields → confirm. You'll land
   on Stripe's hosted page.
5. Pay with a [Stripe test card](https://stripe.com/docs/testing#cards):
   - `4242 4242 4242 4242`, any future expiry (e.g. `12/34`), any 3-digit CVC, any ZIP — succeeds
   - `4000 0000 0000 0002` — declined (useful for testing the error path)
6. You should land back on the confirmation page with a real booking. Check the
   `stripe listen` terminal — it should show `checkout.session.completed` with a
   `200` response. Check the admin dashboard's Bookings table (or MongoDB
   directly) — the booking should show `paymentStatus: PAID` and a `stripeSessionId`.

Without `STRIPE_SECRET_KEY` set, any checkout attempt fails immediately with a
clear error (`src/lib/stripe.ts` throws at startup if it's missing) rather than
failing silently later.

---

## Key Features

### Public / User

- **Event discovery** — Browse all events with filters and search
- **Interactive seat selection** — Visual seat map with availability
- **Checkout** — Real card payments via Stripe Checkout (see [Payments (Stripe)](#payments-stripe))
- **Promo codes** — Apply discount codes at checkout
- **E-tickets** — QR code per booking (scannable URL to e-ticket page)
- **Cancel reservation** — User can cancel from confirmation or e-ticket page
  - **Same-day cancellation**: 50% fee applies if cancelled on the event date
- **Membership tiers** — Bronze / Silver / Gold / Platinum based on event count
- **Dashboard** — View bookings, membership progress, edit profile

### Admin (`/admin`)

| Page | Description |
|------|-------------|
| Dashboard | Stats, charts, recent activity |
| Events | CRUD — create, edit, duplicate, manage ticket types |
| Bookings | List, search, filter, confirm/cancel, export |
| Promo Codes | CRUD — percentage or fixed discount, min purchase, expiry |
| Users | List, search, edit role |
| Logs | Audit trail of admin actions |
| Settings | Admin profile |
| Calendar | Events calendar view |

### Auth

- **Dual auth**: JWT (`/login`) + NextAuth (`/admin/login`, Google OAuth)
- Middleware protects `/admin` and `/dashboard` routes
- Role-based redirect on login (admin → `/admin`, user → `/dashboard`)

---

## Project Structure

```
src/
├── app/
│   ├── admin/(protected)/   # Admin pages (events, bookings, users, etc.)
│   ├── api/                 # API routes
│   │   ├── admin/           # Admin CRUD APIs
│   │   ├── auth/            # Login, register, Google OAuth, password reset
│   │   ├── bookings/        # Booking CRUD + cancel
│   │   ├── events/          # Events + seats + reserve
│   │   ├── promocodes/      # Promo code validation
│   │   ├── qrcode/          # QR code SVG generator
│   │   └── tickets/         # Ticket verification (venue scanning)
│   ├── bookings/            # User's bookings list + detail
│   ├── checkout/            # Checkout page
│   ├── confirmation/        # Post-booking confirmation
│   ├── dashboard/           # User dashboard
│   └── events/              # Event listing + detail + seat selection
├── components/
│   ├── admin/               # Admin-specific components
│   ├── site/                # User-facing components
│   └── ui/                  # Shared UI primitives
├── context/                 # Auth context
├── lib/
│   ├── admin/               # Admin business logic
│   └── *.ts                 # Utilities (db, guards, mail, etc.)
└── models/                  # Mongoose models
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email + password |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/google` | Google OAuth redirect |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List all events |
| GET | `/api/events/[id]` | Event details |
| GET | `/api/events/[id]/seats` | Seats for an event |
| POST | `/api/events/[id]/reserve` | Reserve seats (legacy) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings/[id]` | Booking details |
| PATCH | `/api/bookings/[id]/cancel` | Cancel + refund |

### Payments (Stripe)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/checkout/create-session` | Hold seats, create a Stripe Checkout Session |
| POST | `/api/checkout/confirm` | Verify a paid session, create the booking |
| POST | `/api/webhooks/stripe` | Stripe webhook (`checkout.session.completed` / `.expired`) |
| POST | `/api/bookings` | Create a booking directly with no payment step. Kept for reference/testing; the checkout UI no longer calls this — it goes through `/api/checkout/create-session` above instead |

### Verification
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickets/verify?code=URL_OR_REF` | Venue ticket verification |

### Promo Codes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/promocodes/validate?code=XXX` | Validate a promo code |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/admin/events` | List / create events |
| GET/PUT | `/api/admin/events/[id]` | Get / update event |
| POST | `/api/admin/events/[id]/duplicate` | Duplicate event |
| GET/POST | `/api/admin/events/[id]/ticket-types` | Manage ticket types |
| GET/POST | `/api/admin/bookings` | List / search bookings |
| GET | `/api/admin/bookings/[id]` | Booking detail |
| GET | `/api/admin/bookings/export` | Export CSV |
| POST | `/api/admin/bookings/bulk` | Bulk confirm/cancel |
| GET/POST | `/api/admin/promos` | List / create promo codes |
| GET/PUT/DELETE | `/api/admin/promos/[id]` | Get / update / delete promo code |
| GET | `/api/admin/users` | List users |
| GET/PUT | `/api/admin/users/[id]` | Get / update user |
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/search` | Global search |
| GET | `/api/admin/activity` | Recent activity |
| GET | `/api/admin/logs` | Audit logs |
| GET | `/api/admin/notifications` | Pending booking alerts |

---

## Known Limitations

1. **No email sending** — SMTP is configured but sending is not fully wired. Password reset and booking confirmations don't send emails.
2. **No real-time notifications** — The admin notification bell only queries PENDING bookings on load. No WebSocket/SSE.
3. **Reservation expiry** — Seats reserved via the legacy `/api/events/[id]/reserve` endpoint stay `RESERVED` indefinitely (no timeout). Seats held during Stripe Checkout *are* time-bounded — they're released automatically after 30 minutes via the `checkout.session.expired` webhook — but that release only fires if the Stripe CLI (`stripe listen`) or a production webhook endpoint is actually running to receive it.
4. **Chatbot** — The Groq-powered chatbot exists but requires a valid API key to function.
5. **Stripe refunds** — Cancelling a booking marks it `REFUNDED` in the database but does not yet call Stripe's refund API to actually return the customer's money.
