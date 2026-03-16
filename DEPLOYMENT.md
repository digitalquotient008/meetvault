# MeetingVault – Deployment

## Vercel

1. Connect the repo to Vercel and deploy.
2. Set environment variables in the Vercel project (see below).
3. Use **Postgres** (e.g. Neon or Supabase) and set `DATABASE_URL`.
4. Run migrations after first deploy: from the project root, `npx prisma migrate deploy` (or use `db:push` for prototyping).

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXT_PUBLIC_APP_URL` | Yes | Full app URL (e.g. `https://your-app.vercel.app`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk dashboard |
| `CLERK_SECRET_KEY` | Yes | Clerk dashboard |
| `STRIPE_SECRET_KEY` | Payments | For deposits/full payment |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Payments | Stripe dashboard |
| `STRIPE_WEBHOOK_SECRET` | Payments | Stripe webhook signing secret |
| `RESEND_API_KEY` | Optional | Dormant-client / reminder emails |
| `SENTRY_DSN` | Optional | Error tracking |
| `MEETINGVAULT_API_URL` | Optional | Consultslot backend URL; when set, public booking uses this API for shop data |
| `MEETINGVAULT_API_KEY` | Optional | API key for consultslot (if required by backend) |

## Demo mode

After deployment, run the seed once (e.g. from a one-off script or locally with production `DATABASE_URL`) to create a demo shop:

```bash
npm run db:seed
```

The seed creates a shop with slug `demo-shop` (or as configured in `prisma/seed.ts`). Share the booking link: `https://your-app.vercel.app/book/demo-shop`.

## Tests

- **Unit (Vitest):** `npm run test`
- **E2E (Playwright):** Start the app, then `npm run test:e2e`. In CI, Playwright can start the server automatically.

## Observability

- **Sentry:** Set `SENTRY_DSN` to enable error tracking. The app initializes Sentry in `instrument.ts` when the DSN is present.
- **Audit logs:** Key actions (appointment created/completed/canceled, payment succeeded/refunded) write to `AuditLog` for compliance and debugging.
