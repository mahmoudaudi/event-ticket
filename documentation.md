# Aurum — Event Ticket Booking Platform

A premium event discovery and ticket booking platform built with **Next.js 16 (Turbopack)**, featuring seat selection, Stripe payment integration, an admin dashboard, OTP/reset-password flows, Google OAuth, and an interactive event map powered by Google Maps.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16.2.10 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **UI** | React 19, Tailwind CSS 4, Lucide React icons, Material Symbols |
| **Charts** | Recharts |
| **Database** | MongoDB (via Mongoose 9) |
| **Auth** | NextAuth 5 (admin login), custom JWT + cookie auth (public site) |
| **Payments** | Stripe (Checkout Sessions, webhooks) |
| **Maps** | `@react-google-maps/api`, Google Maps Geocoder (client-side) |
| **Email** | Nodemailer (Gmail SMTP) |
| **QR Codes** | `qrcode` library (server-side SVG generation) |
| **Validation** | Zod |
| **Markdown** | react-markdown + remark-gfm |
| **AI Chat** | Groq API |

---

## Project Structure

```
event-ticket-app/
├── .env.local                    # Environment variables (gitignored)
├── .env.example                  # Environment variable template
├── middleware.ts                 # Edge middleware for admin/dashboard routing
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration (@/* -> src/*)
├── postcss.config.mjs            # PostCSS + Tailwind
├── eslint.config.mjs             # ESLint config
├── scripts/
│   └── seed.ts                   # Database seeder (npm run seed)
├── logs/
│   └── error.log                 # Server-side error log (auto-created)
├── public/
│   └── uploads/events/           # Event image uploads (local filesystem)
└── src/
    ├── app/                      # Next.js App Router pages + API routes
    │   ├── layout.tsx            # Root layout with metadata, fonts, providers
    │   ├── page.tsx              # Home page (hero, carousel, map, events grid)
    │   ├── login/page.tsx        # Public login
    │   ├── signup/page.tsx       # Registration
    │   ├── verify-otp/page.tsx   # OTP verification for forgot-password
    │   ├── reset-password/page.tsx # Password reset form
    │   ├── dashboard/page.tsx    # User dashboard (bookings, loyalty)
    │   ├── events/               # Event detail pages
    │   ├── checkout/             # Checkout flow (review → Stripe → confirmation)
    │   ├── bookings/             # User booking history
    │   ├── confirmation/         # Booking confirmation page
    │   ├── contact/              # Contact page
    │   ├── terms/                # Terms of service
    │   ├── cookie-policy/        # Cookie policy
    │   ├── sitemap.ts            # Dynamic sitemap
    │   ├── robots.ts             # Robots.txt
    │   ├── admin/                # Admin area
    │   │   ├── login/            # Admin login page
    │   │   └── (protected)/      # Admin dashboard pages
    │   │       ├── page.tsx           # Admin home (stats overview)
    │   │       ├── events/           # Event management (list, create, edit)
    │   │       ├── bookings/         # Booking management
    │   │       ├── users/            # User management
    │   │       ├── promos/           # Promo codes
    │   │       ├── calendar/         # Event calendar view
    │   │       ├── activity/         # Admin audit log
    │   │       ├── logs/             # System logs
    │   │       └── settings/         # Admin settings
    │   └── api/                  # API route handlers
    │       ├── auth/             # Register, login, forgot-password, OTP, reset, Google OAuth, NextAuth
    │       ├── events/           # Public event listing, detail, seats, geocode
    │       ├── bookings/         # User booking CRUD, cancellation
    │       ├── checkout/         # Stripe checkout session creation, confirmation
    │       ├── dashboard/        # User dashboard data
    │       ├── promocodes/       # Promo code validation
    │       ├── webhooks/         # Stripe webhook handler
    │       ├── chat/             # Groq AI chat endpoint
    │       ├── qrcode/           # QR code generation
    │       ├── newsletter/       # Newsletter subscription
    │       ├── tickets/          # Ticket verification
    │       ├── health/           # Health check
    │       └── admin/            # Admin CRUD endpoints
    ├── components/
    │   ├── admin/                # Admin dashboard components
    │   │   ├── Sidebar.tsx, Topbar.tsx, EventsTable.tsx, BookingsTable.tsx,
    │   │   ├── UsersTable.tsx, TicketTypeManager.tsx, SeatManager.tsx,
    │   │   ├── EventForm.tsx, LocationPicker.tsx, ImageUploader.tsx,
    │   │   ├── StatCard.tsx, BookingTrendsChart.tsx, NotificationsBell.tsx,
    │   │   ├── BookingDetailModal.tsx, AuditLogList.tsx, LogsTabBar.tsx,
    │   │   ├── ConfirmDialog.tsx, SearchBar.tsx, GlobalSearch.tsx,
    │   │   ├── DateRangeSelect.tsx, TabBar.tsx, PageLinkPagination.tsx,
    │   │   ├── MobileMenuButton.tsx, MobileSidebarContext.tsx,
    │   │   ├── RecentActivity.tsx, ChangePasswordForm.tsx,
    │   │   ├── TablePageSkeleton.tsx, MiniStatCard.tsx
    │   │   └── ...
    │   ├── ui/                   # Shared UI primitives
    │   │   ├── Button.tsx, Card.tsx, Badge.tsx, Modal.tsx, Field.tsx,
    │   │   ├── Skeleton.tsx, EmptyState.tsx, ProgressBar.tsx, StatusBadge.tsx
    │   ├── Navbar.tsx            # Public site navigation
    │   ├── Footer.tsx            # Public site footer
    │   ├── Hero.tsx              # Home page hero section
    │   ├── FeaturedCarousel.tsx  # Auto-scrolling featured events
    │   ├── CategoryCards.tsx     # Category filter cards
    │   ├── UpcomingEvents.tsx    # Upcoming events section
    │   ├── PopularEvents.tsx     # Popular events section
    │   ├── EventsMap.tsx         # Google Maps with event pins
    │   ├── EventHero.tsx         # Event detail page hero
    │   ├── EventDetailClient.tsx # Event detail client component
    │   ├── EventFooter.tsx       # Event detail footer
    │   ├── EventHighlights.tsx   # Event highlights section
    │   ├── SeatSelection.tsx     # Interactive seat map (public)
    │   ├── BookingWidget.tsx     # Booking flow widget
    │   ├── CheckoutForm.tsx      # Checkout form (customer details + promo)
    │   ├── CheckoutSummary.tsx   # Order summary sidebar
    │   ├── ShareWidget.tsx       # Social share with clipboard fallback
    │   ├── VenueMap.tsx          # Venue location map on event detail
    │   ├── ChatWidget.tsx        # Grok AI chat assistant
    │   ├── ChatWidgetWrapper.tsx # Chat widget client wrapper
    │   ├── MarqueeBar.tsx        # Animated announcement marquee
    │   ├── BackToTop.tsx         # Scroll-to-top button
    │   ├── Toast.tsx             # Toast notification system
    │   ├── Providers.tsx         # Client-side providers (Auth, Toast, etc.)
    │   ├── AdminCheckWrapper.tsx # Admin session check wrapper
    │   ├── OrganizerCard.tsx     # Event organizer card
    │   └── EditProfileModal.tsx  # Edit profile modal
    ├── context/
    │   └── AuthContext.tsx       # Auth state (JWT + cookie + localStorage)
    ├── hooks/
    │   ├── useClickOutside.ts    # Click outside detection hook
    │   └── useDebouncedFetch.ts  # Debounced fetch hook
    ├── lib/                     # Server/client library code
    │   ├── db.ts                # MongoDB connection (cached, SRV resolution fallback)
    │   ├── auth.ts              # NextAuth config + credentials provider
    │   ├── auth.config.ts       # NextAuth edge-safe config (for middleware)
    │   ├── guards.ts            # requireAdmin() and requireUser() helpers
    │   ├── password.ts          # bcrypt hash/verify helpers
    │   ├── stripe.ts            # Stripe client singleton
    │   ├── mail.ts              # Nodemailer transporter + email templates
    │   ├── geocode.ts           # Server-side geocoding (Google + Nominatim fallback)
    │   ├── qrcode.ts            # QR code SVG generation
    │   ├── bookingFulfillment.ts # Booking creation from Stripe session
    │   ├── checkoutStorage.ts   # sessionStorage helpers for checkout state
    │   ├── format.ts            # Currency, date, time formatters
    │   ├── cn.ts                # Tailwind class merge utility
    │   ├── logger.ts            # File-based error logger
    │   ├── withErrorLogging.ts  # API route error wrapper
    │   ├── regex.ts             # Escape regex helper
    │   ├── groq.ts              # Groq AI client
    │   ├── csv.ts               # CSV export utility
    │   ├── calendarGrid.ts      # Calendar grid generation
    │   ├── index.ts             # Library barrel exports
    │   ├── validation/          # Zod schemas
    │   │   └── event.ts         # Event input validation
    │   └── admin/               # Admin service layer
    │       ├── events.ts        # Event CRUD logic
    │       ├── bookings.ts      # Booking listing/management
    │       ├── users.ts         # User listing/management
    │       ├── stats.ts         # Dashboard statistics
    │       ├── notifications.ts # Pending booking notifications
    │       ├── activity.ts      # Admin activity log
    │       ├── logs.ts          # System log reader
    │       ├── logins.ts        # Login attempt logging
    │       ├── search.ts        # Global admin search
    │       └── calendar.ts      # Calendar event fetching
    ├── models/                  # Mongoose models (index.ts re-exports all)
    │   ├── User.ts              # User (firstName, lastName, email, password, role, resetOTP, etc.)
    │   ├── Event.ts             # Event (title, description, categoryId, venue, address, city, eventDate, lat/lng, etc.)
    │   ├── Category.ts          # Category (name, description)
    │   ├── TicketType.ts        # TicketType (eventId, name, price, capacity, remainingSeats)
    │   ├── Seat.ts              # Seat (eventId, section, row, seatNumber, status, price)
    │   ├── ReservedSeat.ts      # ReservedSeat (bookingId, seatId)
    │   ├── Booking.ts           # Booking (bookingReference, userId, eventId, tickets, total, paymentStatus, bookingStatus, stripeSessionId, qrCode)
    │   ├── Payment.ts           # Payment (bookingId, paymentMethod, amount, transactionReference)
    │   ├── PromoCode.ts         # PromoCode (code, discountType, discountValue, maxUsage, usedCount, expiresAt)
    │   ├── Subscriber.ts        # Newsletter subscriber (phone)
    │   ├── AdminActivity.ts     # Admin audit log
    │   └── LoginActivity.ts     # Login attempt tracking
    └── types/                   # TypeScript type definitions
        ├── admin.ts             # Admin-specific types
        ├── user.ts              # User-related types
        └── next-auth.d.ts       # NextAuth type augmentation
```

---

## Setup & Installation

### Prerequisites
- Node.js 20+
- MongoDB Atlas (or local MongoDB)
- Google Maps API key (with Geocoding and Maps JavaScript API enabled)
- Stripe account (for payment processing)
- Gmail account with app password (SMTP)
- Google OAuth credentials

### Installation

```bash
git clone <repo-url>
cd event-ticket-app
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/event_ticket_db

# JWT
JWT_SECRET=<your-jwt-secret>
AUTH_SECRET=<nextauth-secret>

# SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<your-email@gmail.com>
SMTP_PASS=<gmail-app-password>
SMTP_FROM=<your-email@gmail.com>

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your-maps-api-key>

# Groq AI
GROQ_API_KEY=<your-groq-api-key>

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Seed Database

```bash
npm run seed
```

This creates:
- 1 admin: `admin@crescentlive.com` / `Admin123!`
- 6 sample users (jane.doe@example.com / Password123!, etc.)
- 4 categories (Concerts, Comedy, Theater, Classical)
- 7 events with ticket tiers
- 2 events with seat maps
- 2 promo codes (WELCOME10, GALA25)
- ~60 bookings spread over the last 30 days with payments

### Run Development Server

```bash
npm run dev
```

Opens at `http://localhost:3000`.

### Stripe Webhook Dev (optional)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Key Features & Workflows

### 1. User Registration & Authentication

**Dual auth system:**
- **Public site**: Custom JWT-based auth stored in `localStorage` + cookies. Users register/login via `/login` or `/signup`. Supports email/password and Google OAuth.
- **Admin dashboard**: NextAuth 5 with Credentials provider + JWT strategy. Admins log in at `/admin/login`.

The `middleware.ts` checks the JWT cookie first (fast, no DB call), then falls back to NextAuth for admin routes.

### 2. Event Discovery & Booking Flow

1. **Browse events** on the homepage (featured carousel, upcoming, popular sections, all events grid)
2. **View event detail** (`/events/[id]`) — shows description, date/time, venue, ticket tiers, seat map
3. **Select seats** on the interactive seat map (if the event has seats configured)
4. **Checkout flow**:
   - Selections saved to `sessionStorage` via `/checkout`
   - Customer fills in name, email, phone; can apply promo code
   - Creates Stripe Checkout Session (`/api/checkout/create-session`)
   - Redirects to Stripe's hosted payment page
   - On success, redirected to `/checkout/success?session_id=...`
   - `/api/checkout/confirm` verifies payment and creates the Booking
   - **Safety net**: Stripe webhook (`/api/webhooks/stripe`) confirms booking if the user's browser closes mid-redirect; `checkout.session.expired` releases reserved seats

### 3. Seat Management

- **Admin**: `SeatManager` component on the event edit page lets admins generate seats by section/row/price. Seats sync to ticket type capacities automatically.
- **Public**: `SeatSelection` component displays a visual grid. Available seats are clickable; reserved/booked seats are disabled.
- Seat statuses: `AVAILABLE` → `RESERVED` (during checkout) → `BOOKED` (after payment confirmed)

### 4. Event Location Map

- `EventsMap` component renders on the home page (`/?all=true` section) and `/events` page
- Uses `@react-google-maps/api` with `GoogleMap` + `Marker` components
- **Client-side geocoding**: When events lack `lat`/`lng` coordinates, the browser's `google.maps.Geocoder` resolves addresses on first load; coordinates are persisted via `PATCH /api/events/[id]/geocode`
- Fallback: shows "No event locations available yet" if no events have coordinates

### 5. Password Reset / OTP Flow

1. User requests reset at `/login` → enters email
2. Choose OTP method (6-digit code, expires 2 min) or email link (expires 1 hour)
3. OTP verified at `/verify-otp` (clears OTP from DB, returns JWT)
4. User sets new password at `/reset-password?token=...`

### 6. Admin Dashboard

Full admin panel at `/admin` with:
- **Dashboard** (`/admin`): Revenue, booking trends chart, active/draft events, pending bookings
- **Events** (`/admin/events`): CRUD, duplicate, search, filter by status; edit includes ticket tiers, seat map, location picker with Google Maps
- **Bookings** (`/admin/bookings`): List with search/filter/date range, confirm/cancel, bulk operations, CSV export
- **Users** (`/admin/users`): List, search, role change, suspend/reactivate
- **Promo Codes** (`/admin/promos`): CRUD for discount codes
- **Calendar** (`/admin/calendar`): Monthly event calendar
- **Activity** (`/admin/activity`): Admin action audit log
- **Logs** (`/admin/logs`): System error log viewer
- **Settings** (`/admin/settings`): Change password

### 7. AI Chat Assistant

Chat widget (bottom-right) powered by Groq API. Uses `src/lib/groq.ts` to send messages and stream responses. Chat history persists in `localStorage`.

---

## Database Models (MongoDB Collections)

### User
| Field | Type | Notes |
|-------|------|-------|
| firstName | String | required |
| lastName | String | required |
| email | String | required, unique |
| password | String | required, bcrypt hashed |
| phone | String | optional |
| role | enum | USER \| ADMIN, default USER |
| profileImage | String | optional |
| isActive | Boolean | default true |
| marketingConsent | Boolean | default false |
| resetOTP | String | nullable |
| resetOTPExpiry | Date | nullable |
| resetPasswordToken | String | nullable |
| resetPasswordExpiry | Date | nullable |

### Event
| Field | Type | Notes |
|-------|------|-------|
| title | String | required |
| description | String | |
| categoryId | ObjectId | ref Category |
| venue | String | |
| address | String | |
| city | String | |
| eventDate | Date | required |
| startTime | String | |
| endTime | String | |
| organizer | String | |
| bannerImage | String | |
| images | [String] | |
| status | enum | DRAFT \| PUBLISHED \| CANCELLED |
| isFeatured | Boolean | default false |
| lat | Number | nullable |
| lng | Number | nullable |
| createdBy | ObjectId | ref User |

### Booking
| Field | Type | Notes |
|-------|------|-------|
| bookingReference | String | unique, e.g. `EP-1234-ABC` |
| userId | ObjectId | ref User |
| eventId | ObjectId | ref Event |
| tickets | [TicketItem] | { ticketTypeId, quantity, unitPrice, totalPrice } |
| promoCodeId | ObjectId | ref PromoCode (optional) |
| subtotal | Number | |
| discount | Number | |
| total | Number | required |
| paymentStatus | enum | PENDING \| PAID \| FAILED \| REFUNDED |
| bookingStatus | enum | PENDING \| CONFIRMED \| CANCELLED |
| qrCode | String | URL to booking confirmation |
| stripeSessionId | String | unique, sparse index |

### TicketType
| Field | Type | Notes |
|-------|------|-------|
| eventId | ObjectId | ref Event |
| name | String | e.g. "General Admission" |
| description | String | |
| price | Number | |
| capacity | Number | total tickets available |
| remainingSeats | Number | |

### Seat
| Field | Type | Notes |
|-------|------|-------|
| eventId | ObjectId | ref Event |
| section | String | e.g. "Floor", "Balcony" |
| row | String | e.g. "A", "B" |
| seatNumber | String | |
| status | enum | AVAILABLE \| RESERVED \| BOOKED |
| price | Number | |

### ReservedSeat (join table)
| Field | Type |
|-------|------|
| bookingId | ObjectId ref Booking |
| seatId | ObjectId ref Seat |

### PromoCode
| Field | Type | Notes |
|-------|------|-------|
| code | String | unique |
| discountType | enum | PERCENTAGE \| FIXED |
| discountValue | Number | |
| minimumPurchase | Number | optional |
| maxUsage | Number | |
| usedCount | Number | default 0 |
| expiresAt | Date | |
| isActive | Boolean | default true |

### Category, Payment, AdminActivity, LoginActivity, Subscriber
See `src/models/*.ts` for full schemas.

---

## API Routes Summary

### Public Auth (`/api/auth`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register` | Create account (firstName, lastName, email, password) → returns JWT |
| POST | `/api/auth/login` | Email/password login → returns JWT |
| GET | `/api/auth/google` | Redirect to Google OAuth |
| GET | `/api/auth/google/callback` | Google OAuth callback → JWT + cookies |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth handlers (admin auth) |
| POST | `/api/auth/forgot-password` | Send reset email or OTP |
| POST | `/api/auth/verify-otp` | Verify OTP → returns JWT |
| POST | `/api/auth/reset-password` | Reset password with token |
| POST | `/api/auth/update-profile` | Update user profile |

### Events (`/api/events`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/events` | List events (`?featured=true`, `?popular=true`, `?upcoming=true`, `?all=true`) |
| GET | `/api/events/[id]` | Single event detail with ticket tiers |
| GET | `/api/events/[id]/seats` | Seat map for an event |
| POST | `/api/events/[id]/reserve` | Reserve selected seats |
| PATCH | `/api/events/[id]/geocode` | Persist lat/lng coordinates |

### Checkout (`/api/checkout`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/checkout/create-session` | Create Stripe Checkout Session, reserve seats |
| POST | `/api/checkout/confirm` | Confirm payment and create booking (called from success page) |

### Bookings (`/api/bookings`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/bookings` | Create booking directly (non-Stripe) |
| GET | `/api/bookings/[bookingId]` | Get booking detail |
| POST | `/api/bookings/[bookingId]/cancel` | Cancel booking |

### Other Public
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/promocodes/validate` | Validate promo code (`?code=...`) |
| GET | `/api/dashboard` | User dashboard data (bookings, loyalty tier) |
| POST | `/api/chat` | Groq AI chat |
| GET | `/api/qrcode` | Generate QR code for booking |
| POST | `/api/newsletter` | Subscribe to newsletter |
| POST | `/api/tickets/verify` | Verify ticket QR code |
| GET | `/api/health` | Health check |
| POST | `/api/webhooks/stripe` | Stripe webhook (checkout.session.completed, checkout.session.expired) |

### Admin (`/api/admin`) — all require ADMIN role
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/events` | Paginated event list with search/filter |
| POST | `/api/admin/events` | Create event |
| GET | `/api/admin/events/[id]` | Get event detail for edit |
| PATCH | `/api/admin/events/[id]` | Update event |
| DELETE | `/api/admin/events/[id]` | Delete event (blocked if bookings exist) |
| POST | `/api/admin/events/[id]/duplicate` | Clone event as new DRAFT |
| POST/GET/DELETE | `/api/admin/events/[id]/seats` | Seat CRUD (generate, list, clear) |
| GET/POST/PATCH/DELETE | `/api/admin/events/[id]/ticket-types` | Ticket type CRUD |
| GET | `/api/admin/bookings` | Paginated booking list with search/filter/date range |
| GET/PATCH | `/api/admin/bookings/[id]` | Booking detail / confirm-cancel |
| POST | `/api/admin/bookings/bulk` | Bulk booking status change |
| GET | `/api/admin/bookings/export` | CSV export |
| GET | `/api/admin/users` | Paginated user list |
| GET/PATCH | `/api/admin/users/[id]` | User detail / role-suspend |
| GET | `/api/admin/stats` | Dashboard statistics (`?range=7|30|90`) |
| GET | `/api/admin/notifications` | Pending booking notifications |
| GET/POST | `/api/admin/categories` | Category CRUD |
| GET/POST | `/api/admin/promos` | Promo code CRUD |
| GET/PATCH/... | `/api/admin/promos/[id]` | Promo code update/delete |
| GET | `/api/admin/activity` | Admin activity log |
| GET | `/api/admin/logs` | System error logs |
| POST | `/api/admin/uploads` | Image upload |
| GET | `/api/admin/profile` | Admin profile |
| GET | `/api/admin/search` | Global search |
| POST | `/api/admin/profile` | Update profile/change password |

---

## Authentication & Authorization

### Public Site (Users)
- **Register** → `POST /api/auth/register` → JWT returned → stored in `localStorage` + cookie
- **Login** → `POST /api/auth/login` → JWT returned → same storage
- **Google OAuth** → `GET /api/auth/google` → callback sets cookie directly
- **AuthContext** reads `localStorage` on mount; exposes `user`, `token`, `login()`, `logout()`
- **Server-side guard**: `requireUser()` in `src/lib/guards.ts` reads JWT from cookie

### Admin Dashboard
- **Login** at `/admin/login` uses NextAuth Credentials provider
- **Middleware** (`middleware.ts`) protects `/admin/*` routes — checks JWT cookie first, falls back to NextAuth session
- **API routes** use `requireAdmin()` from `src/lib/guards.ts`
- **Session strategy**: JWT (no database sessions)

---

## Key Technical Decisions

### MongoDB Connection Caching
The `connectDB()` function in `src/lib/db.ts` caches the Mongoose connection on `globalThis` to survive Turbopack hot-reloads. It also resolves `mongodb+srv://` URIs to plain replicaset URIs via DNS SRV/TXT lookups for environments where SRV resolution fails.

### Dual Auth System
NextAuth powers the admin dashboard (supports middleware edge checks well). The public site uses a custom JWT cookie system because it needs to work seamlessly with the seat selection → checkout → Stripe redirect flow without the complexity of NextAuth callbacks. The two systems are independent but both use the same User model.

### Stripe Checkout with Idempotency
The booking is created **only after** Stripe confirms payment. Two paths lead to `fulfillBookingFromStripeSession()`: the success-page confirm endpoint and the webhook. A `stripeSessionId` unique index on the Booking collection guarantees idempotency — whichever arrives first wins.

### Seat Reservation Lifecycle
- Checkout start: seats `AVAILABLE` → `RESERVED` (30 min hold)
- Payment confirmed: `RESERVED` → `BOOKED`; `ReservedSeat` records created
- Session expired (Stripe webhook): `RESERVED` → `AVAILABLE`
- Checkout cancelled: seats remain `RESERVED` briefly (the webhook `checkout.session.expired` cleans up)

### Error Logging
Unhandled errors in admin API routes are caught by `withErrorLogging()` and written to `logs/error.log` with timestamp, route, method, and stack trace. The logger handles write failures gracefully by falling back to `console.error`.

### Event Location Geocoding
**Client-side** via browser `google.maps.Geocoder` (no API key restriction on client-side geocoding). Once geocoded, coordinates persist to the database via API call so subsequent page loads don't re-geocode. The server-side `geocode.ts` is used only in the admin event create/update flow.

---

## Testing

No formal test suite is configured yet. Manual testing flow:

```bash
# Start dev server
npm run dev

# Seed/refresh database
npm run seed
```

### Test accounts (after seeding)
- **Admin**: admin@crescentlive.com / Admin123!
- **User**: jane.doe@example.com / Password123!

### Manual test checklist
1. Browse home page — events load, categories display, map renders (may show "No event locations available yet" initially)
2. Register a new account at `/signup`
3. Browse event detail at `/events/[id]`
4. Select seats, proceed to checkout, complete payment (use Stripe test card `4242 4242 4242 4242`)
5. Verify booking appears at `/bookings` and `/admin/bookings`
6. Test forgot password flow (OTP and email link)
7. Log in as admin at `/admin/login` — dashboard, events CRUD, booking management, user management
8. Test seat map generation on admin event edit page

---

## Deployment

### Build
```bash
npm run build
```

### Production Start
```bash
npm start
```

### Platform Notes
- **Local filesystem storage**: Uploaded images and `logs/error.log` write to the local filesystem. These will NOT persist on serverless platforms (Vercel, Netlify). For production deployment on serverless, replace:
  - Image uploads → cloud storage (S3, Cloudinary)
  - File logging → hosted logging service (Sentry, Logtail, Axiom)
- **Google Maps**: The client-side Geocoder approach works from any domain — no API key restrictions needed beyond enabling the Maps JavaScript API and Geocoding API in Google Cloud Console

---

## Known Issues & Future Improvements

### Issues
- **Google Maps warnings in console**: `google.maps.Marker` is deprecated in favor of `AdvancedMarkerElement`; `google.maps.places.Autocomplete` is deprecated in favor of `PlaceAutocompleteElement`. These are non-functional warnings.
- **MongoDB connection latency**: Atlas connections take 4-25 seconds on cold start (typical for serverless/free tier).
- **Geocoding fallback**: The server-side Nominatim fallback was removed due to 429 rate-limiting. Client-side geocoding is the only path now.
- **Stripe keys**: Placeholders in `.env.local` — replace with real keys for production.

### Future Improvements
- [ ] Migrate to `google.maps.marker.AdvancedMarkerElement`
- [ ] Migrate to `google.maps.places.PlaceAutocompleteElement`
- [ ] Add automated test suite (Jest + Playwright or Cypress)
- [ ] Add caching layer (Redis) for event listings
- [ ] Replace file-based logging with cloud logging service
- [ ] Replace local image upload with S3/CDN
- [ ] Add payment refund flow in admin
- [ ] Add email notifications for booking confirmation/cancellation
- [ ] Add seat selection timeout/countdown UI
- [ ] Add multi-language support (i18n)
- [ ] Add PWA support (offline ticket access)
- [ ] Add event capacity auto-email notifications
