# MeetingVault – Deployment

## Vercel

1. Connect the repo to Vercel and deploy.
2. Set environment variables in the Vercel project (see below).
3. Use **PostgreSQL** (e.g. Neon or Supabase) and set `DATABASE_URL`.
4. The build script runs `prisma migrate deploy` automatically — tables are created/updated on each deploy.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXT_PUBLIC_APP_URL` | Yes | Full app URL (e.g. `https://www.meetvault.app`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk dashboard |
| `CLERK_SECRET_KEY` | Yes | Clerk dashboard |
| `STRIPE_SECRET_KEY` | Yes (payments) | Stripe dashboard |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes (payments) | Stripe dashboard |
| `STRIPE_WEBHOOK_SECRET` | Yes (payments) | Stripe webhook signing secret |
| `RESEND_API_KEY` | Optional | Email notifications (reminders, dormant-client outreach) |
| `TWILIO_ACCOUNT_SID` | Optional | SMS notifications |
| `TWILIO_AUTH_TOKEN` | Optional | SMS notifications |
| `TWILIO_PHONE_NUMBER` | Optional | SMS sender number |
| `SENTRY_DSN` | Optional | Error tracking |

## Database migrations

Migrations live in `prisma/migrations/` and are applied automatically during the Vercel build (`prisma migrate deploy`).

To create a new migration locally:

```bash
npx prisma migrate dev --name describe_the_change
```

This generates a new migration file. Commit it and push — Vercel applies it on the next deploy.

## Observability

- **Sentry:** Set `SENTRY_DSN` to enable error tracking.
- **Audit logs:** Key actions (appointment created/completed/canceled, payment succeeded/refunded) write to `AuditLog` for compliance and debugging.
