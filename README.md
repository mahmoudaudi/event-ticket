# Event Ticket & Reservation System

A full-stack web application for managing event tickets and reservations built with **Next.js**, **TypeScript**, **Tailwind CSS**, and **MongoDB Atlas**.

## Tech Stack

- **Frontend & Backend:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** MongoDB Atlas (M0 cluster)
- **ODM:** Mongoose

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas connection string

### Installation

```bash
git clone https://github.com/mahmoudaudi/event-ticket.git
cd event-ticket
cp .env.example .env.local
```

Edit `.env.local` and add your MongoDB connection string:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/event_ticket_db
```

Then run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## API Endpoints

| Method | Endpoint         | Description              |
|--------|------------------|--------------------------|
| GET    | `/api/health`    | Check database connection |

## Database Schema

### Collections

- **users** — User accounts (USER / ADMIN roles)
- **categories** — Event categories
- **events** — Events with venue, date, status
- **tickettypes** — Ticket tiers per event (VIP, Regular, Student)
- **bookings** — Booking records with ticket items
- **promocodes** — Discount codes
- **payments** — Payment records
- **seats** — Seat inventory per event (future)
- **reservedseats** — Reserved seats per booking (future)

## Project Structure

```
src/
├── lib/           # Utilities (db connection)
├── models/        # Mongoose models
└── app/
    ├── api/       # API routes
    └── page.tsx   # Frontend page
```
