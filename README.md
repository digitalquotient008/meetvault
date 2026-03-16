# MeetingVault

**The operating system for modern barbershops.**

Online booking, deposits, no-show protection, client management, staff scheduling, growth tools, and email broadcasts — all in one clean platform for $25/month.

**Live:** [meetvault.app](https://www.meetvault.app)

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router), TypeScript, React 19 |
| Styling | Tailwind CSS 4 |
| Auth | Clerk |
| Database | PostgreSQL (Neon) via Prisma ORM |
| Payments | Stripe + Stripe Connect (deposits, full payments, tips, refunds, per-shop payouts) |
| Email | Resend |
| Deployment | Vercel |

## Features

### Marketing Site

| Page | Route | Description |
|------|-------|-------------|
| Homepage | `/` | Hero, features grid, how-it-works, outcomes, CTA |
| Features | `/features` | Full feature breakdown with before/after comparisons |
| Pricing | `/pricing` | Single $25/mo Starter plan with 14-day free trial |
| FAQ | `/faq` | Frequently asked questions |
| Contact | `/contact` | Contact form |
| About | `/about` | About page |
| Terms | `/terms` | Terms of service |
| Privacy | `/privacy` | Privacy policy |

### Public Booking Flow

| Page | Route | Description |
|------|-------|-------------|
| Booking | `/book/[shopSlug]` | Client-facing booking flow: service → barber → date/time → details → confirm |
| Confirmation | `/book/[shopSlug]/confirm/[id]` | Booking confirmation with code and details |
| Payment | `/book/[shopSlug]/pay/[id]` | Stripe deposit or full payment |

All times displayed in the **shop's timezone** (not browser or server UTC).

### Dashboard (authenticated)

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/app` | Personalized overview with clickable stat cards, today's schedule, quick actions, booking link with copy button |
| Calendar | `/app/calendar` | Today's appointments in chronological order |
| Appointments | `/app/appointments` | All appointments list with status, payment badge, actions |
| Appointment detail | `/app/appointments/[id]` | Full detail view with payments and refund controls |
| Customers | `/app/customers` | Client list with name, email, phone, visits |
| Customer detail | `/app/customers/[id]` | Visit timeline, notes, lifetime value, no-show count |
| Client import | `/app/customers/import` | CSV/TSV import from Square, Vagaro, Squire, Boulevard, Booksy, or any CSV. Auto-detects columns, preview, bulk insert with deduplication |
| Services | `/app/services` | Active services with pricing and duration |
| Staff | `/app/staff` | Barber profiles and availability rules |
| Queue | `/app/queue` | Walk-in queue management (waiting → assigned → in service → done) |
| Waitlist | `/app/waitlist` | Waitlist for fully booked dates |
| Growth | `/app/growth` | Rebooking prompts and dormant client outreach |
| Broadcast | `/app/broadcast` | Bulk email send to all/recent/dormant clients with templates (out of office, events, promotions, general) and `{{first_name}}` personalization |
| Reports | `/app/reports` | Barber earnings by date range with CSV export |
| Payments | `/app/payments` | Stripe Connect dashboard: available/pending balance, payout history, request withdrawal |
| Checkout | `/app/appointments/[id]/checkout` | In-dashboard checkout: tip selection (15/20/25/custom/skip) → card-on-file or new card → complete appointment |
| Settings: Shop | `/app/settings/shop` | Shop name, timezone, branding, deposit config |
| Settings: Payments | `/app/settings/payments` | Stripe Connect status, platform fee, tipping toggle |
| Onboarding | `/app/onboarding` | New shop setup wizard: shop profile → services (templates + custom) → staff → hours → done |

### Email Notifications

Automatic emails sent via Resend on appointment lifecycle events:

| Event | Client receives | Shop owner receives |
|-------|----------------|-------------------|
| Booking created | "You're booked!" confirmation with code, service, barber, time, total, booking link | "New booking" alert with client name, details, dashboard link |
| Booking canceled | "Appointment canceled" with details and rebook link | "Booking canceled" alert with calendar link |
| Booking completed | "Thanks for visiting!" with rebook prompt | — |

All emails use the shop's timezone, are branded with the shop name, logged to `NotificationLog`, and gracefully skip if `RESEND_API_KEY` is not set or client has no email.

### Key Technical Details

- **Multi-tenant:** All data is scoped by `shopId`. `requireShopAccess()` enforces tenant isolation on every server action.
- **Timezone-aware:** All date/time displays use the shop's IANA timezone via `date-fns-tz`. Date queries (today's appointments, calendar) use shop-local midnight boundaries.
- **Prisma migrations:** Production uses `prisma migrate deploy` (not `db push`). A migration script auto-baselines if switching from `db push`.
- **Auth flow:** Clerk handles sign-up/sign-in. After auth, users are redirected to `/app`. If the DB is unreachable, an error page is shown instead of a redirect loop.
- **Booking engine:** 15-minute slot intervals, buffer-before/after per barber, conflict detection in a transaction, random confirmation codes.
- **Payments:** Stripe PaymentIntents for deposits and full payments. Platform webhook at `/api/stripe/webhook`. Refund support.
- **Stripe Connect:** Each shop onboards a Stripe Express account via `/app/payments`. Payments route through the platform with a configurable `PLATFORM_FEE_PERCENT` deducted as `application_fee_amount`. Connect webhook at `/api/stripe/connect-webhook` handles `account.updated`, `payment_intent.succeeded/failed`, `payout.paid/failed`.
- **In-dashboard checkout:** After service, barber opens `/app/appointments/[id]/checkout` — tip grid (15/20/25/custom/skip), charge card on file or new card via Stripe Elements, success animation, appointment marked COMPLETED.
- **Card on file:** After first successful payment, a Stripe Customer is created on the connected account and the PaymentMethod attached. Future checkouts offer one-tap charge.
- **Payouts:** Shop owners can view available/pending balance and request instant or standard payouts to their bank directly from `/app/payments`.
- **Audit trail:** `AuditLog` table records appointment created/completed/canceled, payment succeeded/refunded, and payout paid/failed events.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and set:

- `DATABASE_URL` — PostgreSQL connection string (e.g. Neon, Supabase)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — from [Clerk](https://clerk.com)
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_APP_URL` — e.g. `http://localhost:3000`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full list including Stripe, Stripe Connect, Resend, Twilio, and Sentry.

### 3. Database

```bash
npx prisma migrate dev
npm run db:seed
```

### 4. Run dev server

```bash
npm run dev
```

- **Marketing:** http://localhost:3000
- **Sign up / Sign in:** http://localhost:3000/sign-up, /sign-in
- **Dashboard:** http://localhost:3000/app (after sign-in)
- **Public booking:** http://localhost:3000/book/demo-shop (after seed)

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production (generate + migrate + build) |
| `npm run lint` | Run ESLint |
| `npx prisma migrate dev --name <name>` | Create a new migration |
| `npm run db:seed` | Run seed (creates demo shop) |
| `npm run db:studio` | Open Prisma Studio |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run E2E tests (Playwright) |

## Project Structure

```
src/
├── app/
│   ├── (marketing)/          # Landing, features, pricing, FAQ, contact, about, terms, privacy
│   ├── (auth)/               # Sign-in, sign-up (Clerk)
│   ├── app/                  # Dashboard (protected)
│   │   ├── page.tsx          # Dashboard home
│   │   ├── calendar/         # Today's schedule
│   │   ├── appointments/     # Appointment list + detail
│   │   ├── customers/        # Customer list + detail + import
│   │   ├── services/         # Service management
│   │   ├── staff/            # Staff profiles + availability
│   │   ├── queue/            # Walk-in queue
│   │   ├── waitlist/         # Waitlist management
│   │   ├── growth/           # Rebooking + dormant outreach
│   │   ├── broadcast/        # Bulk email broadcasts
│   │   ├── reports/          # Revenue reports + CSV export
│   │   ├── payments/         # Stripe Connect dashboard: balance, payouts, withdrawal
│   │   ├── connect/          # Stripe Connect onboarding (return + refresh pages)
│   │   ├── settings/         # Shop settings + payment settings
│   │   └── onboarding/       # New shop setup wizard
│   ├── book/[shopSlug]/      # Public booking flow + confirmation + payment
│   └── api/
│       ├── book/slots/       # Available slot API
│       ├── stripe/webhook/   # Platform Stripe webhook (deposits, booking payments)
│       └── stripe/connect-webhook/  # Connect webhook (per-shop payments, payouts, account status)
├── components/
│   ├── dashboard/            # AppSidebar, AppointmentActions, CopyBookingLink
│   ├── Hero.tsx              # Homepage hero
│   ├── Features.tsx          # Homepage features grid
│   ├── HowItWorks.tsx        # How-it-works steps
│   ├── Outcomes.tsx          # Results + trust strip
│   ├── CTA.tsx               # Call to action
│   ├── PricingCards.tsx       # Pricing card
│   ├── Header.tsx            # Marketing header
│   ├── Footer.tsx            # Marketing footer
│   └── ChatWidget.tsx        # FAQ chat widget
├── lib/
│   ├── services/             # Business logic
│   │   ├── appointment.ts    # Create, cancel, complete, no-show, check-in
│   │   ├── availability.ts   # Slot generation with timezone handling
│   │   ├── customer.ts       # Create or find customer (dedupe by email/phone)
│   │   ├── customer-notes.ts # Customer notes CRUD
│   │   ├── email-notifications.ts  # Booking confirmation, cancellation, completion emails
│   │   ├── growth.ts         # Rebooking + dormant client queries
│   │   ├── payments.ts       # Stripe PaymentIntent, mark succeeded/failed, refunds, Connect routing
│   │   ├── stripe-connect.ts # Stripe Connect: create accounts, onboarding links, balance, payouts
│   │   ├── customer-stripe.ts # Card-on-file: attach PaymentMethod, retrieve default PM
│   │   ├── queue.ts          # Walk-in queue management
│   │   ├── reports.ts        # Barber earnings aggregation
│   │   ├── shop.ts           # Shop CRUD
│   │   └── waitlist.ts       # Waitlist management
│   ├── auth.ts               # Clerk + Prisma user sync, requireShopAccess
│   ├── audit.ts              # Audit log writer
│   ├── constants.ts          # APP_URL with protocol normalization
│   ├── db.ts                 # Prisma client singleton
│   ├── env.ts                # Zod-validated environment variables
│   ├── format-date.ts        # Timezone-aware date formatting utilities
│   └── faq.ts                # FAQ data
└── middleware.ts              # Clerk auth middleware (public vs protected routes)

prisma/
├── schema.prisma             # Full multi-tenant schema (17 models, +Stripe Connect fields)
├── migrations/               # SQL migrations (applied automatically on deploy)
├── migrate-prod.mjs          # Production migration script with auto-baseline
└── seed.ts                   # Demo shop seeder
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel setup, environment variables, and migration workflow.
