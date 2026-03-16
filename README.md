# MeetingVault

**The operating system for modern barbershops.**  
Bookings, payments, customer relationships, staff payouts, and growth workflows in one clean platform that the shop actually controls.

## Stack

- **Next.js 15** (App Router), TypeScript, Tailwind CSS
- **Clerk** for authentication
- **Prisma** + PostgreSQL
- **Stripe** for payments (deposits, full payments, tips, refunds)

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

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full list.

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
| `npm run build` | Build for production |
| `npx prisma migrate dev --name <name>` | Create a new migration |
| `npm run db:seed` | Run seed |
| `npm run db:studio` | Open Prisma Studio |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run E2E tests (Playwright) |

## Project structure

- `src/app/(marketing)/` — Landing, features, pricing, etc.
- `src/app/(auth)/` — Sign-in, sign-up (Clerk)
- `src/app/app/` — Dashboard (onboarding, calendar, customers, services, staff, settings)
- `src/app/book/[shopSlug]/` — Public booking flow & confirmation
- `src/lib/services/` — Shop, service, barber, availability, appointment, customer
- `src/lib/auth.ts` — Clerk + membership, requireShopAccess
- `prisma/schema.prisma` — Full multi-tenant schema
- `prisma/migrations/` — Database migrations (applied automatically on deploy)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel deployment, environment variables, and migration workflow.
