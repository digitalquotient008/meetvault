# Architecture & Engineering Notes

Running decisions, known limitations, and upgrade paths for future reference.

---

## Rate Limiting

### Current implementation
`src/lib/rate-limit.ts` — in-process sliding-window limiter backed by a module-level `Map`.

Applied to:
- `/api/book/slots` — 60 req / min per IP
- `/api/book/setup-intent` — 10 req / min per IP

### Why it works well enough now
Vercel reuses warm serverless instances. A single user's requests typically land on the same instance, so the in-memory counter fires correctly for normal abuse patterns (bots, accidental hammering from a browser).

### The limitation
Vercel can spin up multiple instances under load. Each instance has its own isolated memory — they do not share the `Map`. A user hitting 3 instances simultaneously could exceed the limit 3× before being blocked.

### When to upgrade
If you see coordinated slot-scraping or setup-intent abuse in production logs, replace `src/lib/rate-limit.ts` with Upstash Redis + `@upstash/ratelimit`:

1. Add Upstash Redis via the Vercel marketplace (free tier available).
2. `npm install @upstash/ratelimit @upstash/redis`
3. Replace the `checkRateLimit` implementation:

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, '1m'),
});

export async function checkRateLimit(key: string): Promise<boolean> {
  const { success } = await ratelimit.limit(key);
  return success;
}
```

4. Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to Vercel env vars (auto-populated by the marketplace integration).

---

## Stripe Architecture

### Two separate Stripe accounts in play

| Account | Purpose | Used for |
|---------|---------|---------|
| **Platform account** | MeetVault's own Stripe account | Card-on-file (SetupIntents for no-show fees), booking deposits via platform |
| **Connected accounts** (Express) | One per shop | Shop payouts — funds flow to the shop's bank via Stripe Connect |

### Card-on-file is on the PLATFORM account
When a customer saves a card at booking time (`/api/book/setup-intent`), the SetupIntent is created on the **platform** Stripe account. The resulting `PaymentMethod` ID is stored in `customer.stripePaymentMethodId`.

This means:
- No-show fee charges (`chargeNoShowFee`) use the platform account + `transfer_data.destination` to route funds to the shop.
- The checkout form (`/app/appointments/[id]/checkout`) uses the same platform PM ID when charging card-on-file.
- `customer.stripeCustomerId` is the **Connect-account** customer (used internally by Stripe Connect). `customer.platformStripeCustomerId` is the **platform** customer.

### If you ever migrate to Connect-native card storage
You would need to clone the PaymentMethod from the platform account to each connected account using `stripe.paymentMethods.create({ customer, payment_method }, { stripeAccount })`. This is a larger migration — keep the current setup unless there's a specific reason to change.

---

## Appointment Status Lifecycle

```
ONLINE booking:
  created → PENDING
  card saved → CONFIRMED
  customer navigates away → PENDING (auto-canceled by cron after 15 min)

STAFF / WALK_IN booking:
  created → CONFIRMED (immediately)

All channels:
  CONFIRMED → IN_PROGRESS (staff clicks Start)
  IN_PROGRESS → COMPLETED (checkout flow or completeWithoutPayment)
  CONFIRMED | IN_PROGRESS → CANCELED (staff cancel or customer cancel via confirmation code)
  CONFIRMED | IN_PROGRESS → NO_SHOW
```

### Customer stats are deferred for ONLINE bookings
`customer.totalVisits` and `customer.lastVisitAt` are **not** updated at appointment creation for ONLINE channel. They are updated in `saveCardAction` when the appointment is promoted PENDING → CONFIRMED. This prevents abandoned bookings from inflating customer stats.

For STAFF / WALK_IN channels, stats are updated immediately at creation since the appointment is CONFIRMED from the start.

---

## Expired PENDING Cleanup

PENDING appointments are cleaned up via a Vercel cron job:

- **Route:** `GET /api/cron/cleanup-pending`
- **Schedule:** every 15 minutes (`*/15 * * * *` in `vercel.json`)
- **Logic:** `updateMany { status: PENDING, createdAt < 15 min ago } → CANCELED`
- **Protection:** `Authorization: Bearer <CRON_SECRET>` header — set `CRON_SECRET` in Vercel environment variables

The same 15-minute window is applied in `getAvailableSlots` to filter out stale PENDING appointments from the slot conflict check, so slots are freed in real time without waiting for the cron.

### Generating a CRON_SECRET
```bash
openssl rand -hex 32
```
Set the output as `CRON_SECRET` in your Vercel project environment variables.

---

## Cancellation Refund Logic

Implemented in `src/lib/services/cancellation.ts` as a pure function (`computeRefundPreview`) + executor (`cancelWithRefund`).

### Policy types

| Policy | Within window | Outside window |
|--------|--------------|----------------|
| `NONE` | Full refund | Full refund |
| `DEPOSIT_FORFEIT` | Deposit kept, balance refunded | Full refund |
| `FIXED_FEE` | Fixed dollar fee deducted | Full refund |
| `PERCENT_OF_TOTAL` | % of total deducted | Full refund |

Staff cancellations always get a full refund regardless of window.

### Key invariant — DEPOSIT_FORFEIT multi-payment case
When a customer has paid both a deposit and a balance payment, the forfeit drains from the deposit payment first (by skipping it). `remainingForfeit` is decremented by the skipped deposit amount before processing balance payments, so the forfeit is never double-counted.

---

## Stripe Connect — `createConnectAccount`

The `stripe.accounts.list(limit: 100)` fallback that previously searched for an orphaned account was removed. The shop DB record (`shop.stripeConnectAccountId`) is the authoritative source.

If a database loss ever orphans a Stripe Express account:
1. Go to the Stripe dashboard → Connect → Accounts
2. Find the account by the shop's email or metadata
3. Manually update `shop.stripeConnectAccountId` in the database to re-link it

---

## Appointments Pagination

`/app/appointments` paginates at 50 rows per page via `?page=N` query param.

The `total` count and `appointments` records are fetched in parallel (`Promise.all`). If you add filters (by status, date range, barber) in the future, pass the same `where` clause to both the `count` and `findMany` calls.

---

## Lifecycle Email System

`src/lib/services/lifecycle-emails.ts` — full user journey email sequence.

### Immediate triggers (event-driven)

| Email | Trigger | Template key |
|-------|---------|-------------|
| Welcome | Shop created in onboarding | `welcome` |
| Trial started | Stripe Checkout completes | `trial_started` |
| Subscription active | Trial → active (webhook) | `subscription_active` |

### Drip sequence (cron-driven, every 15 min)

| Email | When | Template key | Goal |
|-------|------|-------------|------|
| Feature highlight | Day 3 | `trial_day3` | Push deposit setup |
| Mid-trial check-in | Day 7 | `trial_day7` | Engagement, support offer |
| Urgency nudge | Day 10 | `trial_day10` | 4 days left, value recap |
| Trial ending | Day 12 | `trial_ending` | Payment reminder |
| Trial expired | After day 14 (if not converted) | `trial_expired` | Win-back with 30-day data retention |

### Idempotency
Every email checks `NotificationLog` for the `templateKey + shopId` combination before sending. Safe to run repeatedly — each email is sent exactly once per shop.

### Existing transactional emails (in email-notifications.ts)
- `booking_confirmed_client` / `booking_confirmed_shop`
- `booking_canceled_client` / `booking_canceled_shop`
- `booking_completed_client`
- `reminder_24h_client` / `reminder_1h_client` (+ SMS variants)

---

## Automated Appointment Reminders

### How it works
A Vercel cron job (`/api/cron/send-reminders`, every 15 minutes) sends two reminders per appointment:

| Reminder | Window | Template keys |
|----------|--------|---------------|
| **24-hour** | 22–26 hours before `startDateTime` | `reminder_24h_client` (email), `reminder_24h_sms` (SMS) |
| **1-hour** | 45–75 minutes before `startDateTime` | `reminder_1h_client` (email), `reminder_1h_sms` (SMS) |

### Idempotency
Each appointment has `reminder24hSentAt` and `reminder1hSentAt` timestamps. The cron only processes appointments where the relevant field is `null`, then sets it immediately after sending. This prevents duplicate reminders if the cron fires multiple times within the window.

### Channels
- **Email** — always sent via Resend (if `RESEND_API_KEY` is set and customer has email)
- **SMS** — sent via Twilio (if `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` are set and customer has phone)
- Both channels gracefully no-op if credentials are missing

### Adding Twilio
1. Sign up at https://console.twilio.com
2. Get a phone number with SMS capability
3. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` in Vercel env vars
4. `npm install twilio`

---

## Auto No-Show Detection & Charging

### How it works
A Vercel cron job (`/api/cron/auto-noshow`, every 15 minutes) automatically detects no-shows:

1. Finds `CONFIRMED` appointments whose `endDateTime` is > 30 minutes in the past
2. Marks each as `NO_SHOW` + increments `customer.noShowCount`
3. If the shop has `noShowFeeAmount` configured AND the customer has a card on file, auto-charges the fee via `chargeNoShowFee()`
4. Sets `autoNoShowChargedAt` to prevent re-processing

### Safety
- Only touches `CONFIRMED` appointments (not `IN_PROGRESS`, `COMPLETED`, etc.)
- 30-minute grace period after `endDateTime` before marking as no-show
- `chargeNoShowFee()` checks `noShowFeeCharged` flag to prevent double charges
- Each charge creates an audit log entry (`auto_no_show` + `auto_no_show_charged`)
- If the Stripe charge fails, the appointment is still marked as NO_SHOW — the shop can retry manually from the appointment detail page

---

## Cron Jobs Summary

All cron jobs run every 15 minutes and are protected by the same `CRON_SECRET` header.

| Route | Purpose |
|-------|---------|
| `/api/cron/cleanup-pending` | Cancel PENDING appointments older than 15 min |
| `/api/cron/send-reminders` | Send 24h + 1h email/SMS reminders + trial-ending emails |
| `/api/cron/auto-noshow` | Detect no-shows, mark status, auto-charge fee |

---

## Subscription & Billing

### Trial model
Card-upfront, charge-after-trial. When a shop owner completes onboarding, they're redirected to Stripe Checkout with `trial_period_days: 14`. The card is saved immediately, but the first $25/mo charge happens only after 14 days.

### Flow
```
Sign up → Clerk auth → Onboarding (shop, services, staff, hours) →
Stripe Checkout (subscription, 14-day trial) →
/app/onboarding/subscribe/success → syncSubscriptionFromCheckout() →
Dashboard unlocked
```

### Access gating
`src/app/app/layout.tsx` checks `shop.subscriptionStatus` on every page load. If the status is not `trialing` or `active`, the user is redirected to `/app/onboarding/subscribe`. Onboarding routes are exempt from this gate.

### Subscription lifecycle (webhook-driven)
The platform Stripe webhook (`/api/stripe/webhook`) handles:
- `customer.subscription.created` / `updated` → sync `subscriptionStatus` + `trialEndsAt`
- `customer.subscription.deleted` → mark `canceled`

### Trial-ending reminder
The `/api/cron/send-reminders` cron sends a "Your trial ends in 2 days" email to shop owners whose `trialEndsAt` is ~48 hours away. Uses `NotificationLog` with `templateKey: 'trial_ending'` to prevent duplicates.

### Billing settings
`/app/settings/billing` shows subscription status, trial end date, and action buttons:
- "Manage payment method" → Stripe Customer Portal
- "Cancel subscription" → `cancel_at_period_end: true` (keeps access until end of period)
- "Resume subscription" → reverses cancellation

### Schema fields (on Shop)
| Field | Type | Purpose |
|-------|------|---------|
| `stripeSubscriptionId` | String? | Stripe subscription ID |
| `stripeCustomerId` | String? | Stripe customer for billing |
| `subscriptionStatus` | String? | `trialing`, `active`, `past_due`, `canceled`, `unpaid` |
| `trialEndsAt` | DateTime? | When the 14-day trial ends |

### Price configuration
Set `STRIPE_PRICE_ID` in env to use a pre-existing Stripe price. If not set, the system auto-creates a "MeetVault Starter" product with a $25/mo recurring price.
