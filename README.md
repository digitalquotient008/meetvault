# MeetingVault

**The operating system for modern barbershops.**  
Bookings, payments, customer relationships, staff payouts, and growth workflows in one clean platform that the shop actually controls.

## Stack

- **Next.js 15** (App Router), TypeScript, Tailwind CSS
- **Clerk** for auth
- **Prisma** + PostgreSQL
- Stripe-ready (Phase 2)

## Getting started

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

### 3. Database

```bash
npm run db:generate
npm run db:push
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

## Phase 0 & 1 (current)

- [x] App skeleton, auth (Clerk), Prisma schema, tenant structure
- [x] Marketing site (MeetingVault branding), pricing, FAQ
- [x] Protected app shell (sidebar, dashboard)
- [x] Owner onboarding (shop → services → staff → hours → booking link)
- [x] Services & staff (list views; full CRUD in Phase 2)
- [x] Scheduling engine (slots, conflict check, transactional booking)
- [x] Public booking flow: service → barber → date/time → details → confirm
- [x] Confirmation page
- [x] Seed (demo shop, barber, service, customer)

## Phase 2 (next)

- Customer CRM (detail, notes, visit history)
- Stripe deposits & checkout, tips, receipts, refunds
- Appointment completion flow, dashboard metrics

## Commands

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start dev server         |
| `npm run build`| Build for production     |
| `npm run db:push` | Push schema to DB     |
| `npm run db:seed` | Run seed              |
| `npm run db:studio` | Open Prisma Studio  |

## Project structure

- `src/app/(marketing)/` — Landing, features, pricing, etc.
- `src/app/(auth)/` — Sign-in, sign-up (Clerk)
- `src/app/app/` — Dashboard (onboarding, calendar, customers, services, staff, settings)
- `src/app/book/[shopSlug]/` — Public booking flow & confirmation
- `src/lib/services/` — Shop, service, barber, availability, appointment, customer
- `src/lib/auth.ts` — Clerk + membership, requireShopAccess
- `prisma/schema.prisma` — Full multi-tenant schema
