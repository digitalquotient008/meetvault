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
| **Platform account** | MeetingVault's own Stripe account | Card-on-file (SetupIntents for no-show fees), booking deposits via platform |
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
