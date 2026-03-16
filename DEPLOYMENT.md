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
| `NEXT_PUBLIC_APP_URL` | Yes | Full app URL with protocol (e.g. `https://www.meetvault.app`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk dashboard → API Keys |
| `CLERK_SECRET_KEY` | Yes | Clerk dashboard → API Keys |
| `STRIPE_SECRET_KEY` | Yes (payments) | Stripe dashboard → API Keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes (payments) | Stripe dashboard → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Yes (payments) | Stripe dashboard → Webhooks → signing secret |
| `RESEND_API_KEY` | Yes (email) | [resend.com](https://resend.com) → API Keys. Required for booking confirmations, cancellations, completion thank-yous, growth reminders, and broadcast emails |
| `TWILIO_ACCOUNT_SID` | Optional | SMS notifications |
| `TWILIO_AUTH_TOKEN` | Optional | SMS notifications |
| `TWILIO_PHONE_NUMBER` | Optional | SMS sender number |
| `SENTRY_DSN` | Optional | Error tracking |

**Important:** `NEXT_PUBLIC_APP_URL` must include the protocol (e.g. `https://www.meetvault.app`, not just `www.meetvault.app`).

## Database migrations

Migrations live in `prisma/migrations/` and are applied automatically during the Vercel build via `prisma/migrate-prod.mjs`.

To create a new migration locally:

```bash
npx prisma migrate dev --name describe_the_change
```

This generates a new migration file. Commit it and push — Vercel applies it on the next deploy.

## Email notifications

Booking confirmation, cancellation, and completion emails are sent automatically via [Resend](https://resend.com) when `RESEND_API_KEY` is set. The broadcast feature also requires this key.

Emails are sent to:
- **Clients** — booking confirmation, cancellation notice, completion thank-you
- **Shop owner** — new booking alert, cancellation alert (sent to the shop's email configured in Settings)

All emails are logged in the `NotificationLog` table with sent/failed status.

## Observability

- **Sentry:** Set `SENTRY_DSN` to enable error tracking.
- **Audit logs:** Key actions (appointment created/completed/canceled, payment succeeded/refunded) write to `AuditLog` for compliance and debugging.
- **Notification logs:** All emails (booking confirmations, broadcasts, growth reminders) are logged to `NotificationLog` with status and error messages.
