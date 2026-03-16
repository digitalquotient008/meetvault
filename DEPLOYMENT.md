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
| `STRIPE_WEBHOOK_SECRET` | Yes (payments) | Stripe dashboard → Webhooks → platform webhook signing secret |
| `STRIPE_CONNECT_WEBHOOK_SECRET` | Yes (Connect) | Stripe dashboard → Webhooks → Connect webhook signing secret (see Stripe Connect setup below) |
| `PLATFORM_FEE_PERCENT` | Yes (Connect) | Platform fee % taken per transaction (e.g. `0.5` for 0.5%). Defaults to `0`. |
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

## Stripe Connect setup

MeetingVault uses **Stripe Connect Express** so each barbershop receives payouts directly to their bank account. You need to register **two** separate webhook endpoints in the Stripe dashboard:

### 1. Platform webhook (existing)
- **URL:** `https://your-domain.com/api/stripe/webhook`
- **Events:** `payment_intent.succeeded`, `payment_intent.payment_failed`
- Copy the signing secret → set as `STRIPE_WEBHOOK_SECRET`

### 2. Connect webhook (new)
- **URL:** `https://your-domain.com/api/stripe/connect-webhook`
- **Listen to:** Select **"Events on connected accounts"** (the toggle in Stripe's webhook config)
- **Events:** `account.updated`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `payout.paid`, `payout.failed`
- Copy the signing secret → set as `STRIPE_CONNECT_WEBHOOK_SECRET`

> **Important:** `NEXT_PUBLIC_APP_URL` must be the full production URL (e.g. `https://www.meetvault.app`) — it is used to generate the Stripe Connect onboarding return/refresh URLs. On Vercel, set this explicitly in the project environment variables.

### Stripe Connect onboarding flow (for shops)
1. Shop owner navigates to `/app/payments`
2. Clicks **"Connect Stripe account"** → redirected to Stripe-hosted onboarding
3. After completing onboarding, Stripe redirects to `/app/connect/return`
4. The `account.updated` webhook also marks the shop as onboarded automatically

### Local development with Stripe CLI
```bash
# Forward platform events
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Forward Connect events (separate terminal)
stripe listen --forward-connect-to localhost:3000/api/stripe/connect-webhook
```

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
