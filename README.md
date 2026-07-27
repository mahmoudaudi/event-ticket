# Aurum — Event Ticket & Reservation System

A full-stack event ticketing platform built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, **MongoDB**, and **NextAuth.js**.

Users can browse events, select seats, apply promo codes, checkout (mock payment), receive e-tickets with QR codes, and cancel reservations. Admins manage events, bookings, users, promo codes, and view analytics.

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
| Stripe keys | Real payment processing (currently mock) |

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

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
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

## Key Features

### Public / User

- **Event discovery** — Browse all events with filters and search
- **Interactive seat selection** — Visual seat map with availability
- **Checkout** — Mock payment form with card or mock method
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
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/[id]` | Booking details |
| PATCH | `/api/bookings/[id]/cancel` | Cancel + refund |

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

1. **Payment is mock** — No real Stripe integration yet. All bookings are auto-PAID. Stripe can be added later with minimal changes (checkout session + webhook).
2. **No email sending** — SMTP is configured but sending is not fully wired. Password reset and booking confirmations don't send emails.
3. **No real-time notifications** — The admin notification bell only queries PENDING bookings on load. No WebSocket/SSE.
4. **Reservation expiry** — Seats reserved via the legacy reserve endpoint stay RESERVED indefinitely. No timeout mechanism.
5. **Chatbot** — The Groq-powered chatbot exists but requires a valid API key to function.
