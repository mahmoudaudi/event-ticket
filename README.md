# Aurum — Event Ticket Booking Platform

A premium event discovery and ticket booking platform built with Next.js 16, MongoDB, Stripe, and Google Maps.

## Quick Start

```bash
npm install
npm run seed
npm run dev
```

Opens at `http://localhost:3000`.

## Test Accounts (after seeding)

| Role  | Email                | Password     |
| ----- | -------------------- | ------------ |
| Admin | admin@aurum.com      | Admin123!    |
| User  | jane.doe@example.com | Password123! |

## Tech Stack

Next.js 16 (Turbopack), React 19, TypeScript 5, Tailwind CSS 4, MongoDB (Mongoose 9), NextAuth 5, Stripe, Google Maps, Nodemailer, Groq AI

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

- `MONGODB_URI` — MongoDB Atlas connection string
- `JWT_SECRET` / `AUTH_SECRET` — signing secrets
- `SMTP_*` — Gmail app password for email
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — OAuth
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — Maps JS API key
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — Stripe
- `GROQ_API_KEY` — AI chat

## Scripts

| Command         | Purpose                        |
| --------------- | ------------------------------ |
| `npm run dev`   | Start dev server               |
| `npm run build` | Production build               |
| `npm start`     | Start production server        |
| `npm run seed`  | Seed database with sample data |
| `npm run lint`  | Run ESLint                     |

## Project Map

```
src/
├── app/            # Pages + API routes (App Router)
│   ├── api/        # REST endpoints (auth, events, checkout, admin, etc.)
│   ├── admin/      # Admin dashboard pages
│   ├── checkout/   # Checkout flow
│   └── ...
├── components/     # React components
│   ├── admin/      # Admin panel components
│   └── ui/         # Shared UI primitives
├── context/        # AuthContext (JWT + cookies)
├── models/         # Mongoose schemas (11 collections)
├── lib/            # Server/client utilities (db, auth, guards, stripe, mail, etc.)
└── types/          # TypeScript definitions
```

---

**Full documentation**: [documentation.md](./documentation.md)
