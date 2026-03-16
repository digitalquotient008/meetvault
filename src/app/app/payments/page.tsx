import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  getAccountBalance,
  getPayoutHistory,
  getConnectAccountStatus,
  markShopOnboarded,
  clearShopConnectAccount,
} from '@/lib/services/stripe-connect';
import type Stripe from 'stripe';
import {
  ConnectButton,
  StripeDashboardButton,
  RequestPayoutButton,
} from './PaymentsClient';

function payoutStatusBadge(status: string) {
  if (status === 'paid') return 'text-emerald-400 bg-emerald-500/10';
  if (status === 'pending' || status === 'in_transit') return 'text-amber-400 bg-amber-500/10';
  return 'text-red-400 bg-red-500/10';
}

function bankLabel(destination: Stripe.Payout['destination']): string {
  if (!destination || typeof destination === 'string') return '—';
  const ba = destination as Stripe.BankAccount;
  if (ba.last4) return `••••${ba.last4}`;
  return '—';
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ setup?: string }>;
}) {
  const { shopId } = await requireShopAccess();
  const { setup } = await searchParams;

  let shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: {
      stripeConnectAccountId: true,
      stripeConnectOnboarded: true,
      platformFeePercent: true,
    },
  });

  let onboarded = shop?.stripeConnectOnboarded ?? false;

  // Verify live with Stripe if DB says not onboarded
  if (!onboarded && shop?.stripeConnectAccountId) {
    const status = await getConnectAccountStatus(shop.stripeConnectAccountId);
    if (status.forbidden) {
      // Stored account ID belongs to a different Stripe key — clear it so the shop can reconnect
      await clearShopConnectAccount(shopId);
      shop = { ...shop!, stripeConnectAccountId: null, stripeConnectOnboarded: false };
    } else if (status.chargesEnabled) {
      await markShopOnboarded(shopId);
      onboarded = true;
    }
  }

  let balance: { available: number; pending: number; currency: string } | null = null;
  let payouts: Stripe.Payout[] = [];
  let stripeError: string | null = null;

  if (onboarded && shop?.stripeConnectAccountId) {
    try {
      [balance, payouts] = await Promise.all([
        getAccountBalance(shop.stripeConnectAccountId),
        getPayoutHistory(shop.stripeConnectAccountId),
      ]);
    } catch {
      stripeError = 'Unable to load balance from Stripe. Please try again shortly.';
    }
  }

  const notConnected = !shop?.stripeConnectAccountId;
  const notOnboarded = shop?.stripeConnectAccountId && !onboarded;

  return (
    <div className="p-6 lg:p-8 max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Payments</h1>
        <p className="text-slate-400 mt-1 text-sm">Manage your Stripe account and payouts</p>
      </div>

      {setup === 'required' && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-amber-300 text-sm">
          Connect your Stripe account to start accepting payments and enable checkout.
        </div>
      )}

      {/* Connect Status Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold text-lg">Stripe Account</h2>
            {notConnected && (
              <p className="text-slate-400 text-sm mt-1">
                Connect your bank account to accept card payments.
              </p>
            )}
            {notOnboarded && (
              <p className="text-slate-400 text-sm mt-1">
                Your setup is incomplete. Click below to finish onboarding.
              </p>
            )}
            {onboarded && (
              <p className="text-emerald-400 text-sm mt-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                Active — accepting payments
              </p>
            )}
          </div>
          {onboarded && <StripeDashboardButton />}
        </div>

        {(notConnected || notOnboarded) && <ConnectButton />}
      </div>

      {stripeError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {stripeError}
        </div>
      )}

      {/* Balance Cards */}
      {onboarded && balance && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <p className="text-slate-400 text-sm">Available balance</p>
            <p className="text-3xl font-bold text-emerald-400">
              ${(balance.available / 100).toFixed(2)}
            </p>
            <p className="text-slate-500 text-xs">Ready to withdraw</p>
            <RequestPayoutButton availableCents={balance.available} />
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <p className="text-slate-400 text-sm">Pending balance</p>
            <p className="text-3xl font-bold text-amber-400">
              ${(balance.pending / 100).toFixed(2)}
            </p>
            <p className="text-slate-500 text-xs">Typically available in 2 business days</p>
          </div>
        </div>
      )}

      {/* Payouts Table */}
      {onboarded && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="text-white font-semibold">Payout history</h2>
          </div>
          {payouts.length === 0 ? (
            <p className="text-slate-500 text-sm p-6">No payouts yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs border-b border-slate-800">
                  <th className="text-left px-6 py-3 font-medium">Date</th>
                  <th className="text-left px-6 py-3 font-medium">Amount</th>
                  <th className="text-left px-6 py-3 font-medium">Status</th>
                  <th className="text-left px-6 py-3 font-medium">Bank</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout.id} className="border-b border-slate-800/50 last:border-0">
                    <td className="px-6 py-3 text-slate-300">
                      {new Date(payout.created * 1000).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-3 text-white font-medium">
                      ${(payout.amount / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${payoutStatusBadge(payout.status)}`}
                      >
                        {payout.status === 'in_transit' ? 'In transit' : payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-400">{bankLabel(payout.destination)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
