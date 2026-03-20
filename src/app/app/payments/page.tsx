import { redirect } from 'next/navigation';
import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getAccountBalance, getPayoutHistory } from '@/lib/services/stripe-connect';
import type Stripe from 'stripe';
import {
  ConnectButton,
  StripeDashboardButton,
  RequestPayoutButton,
} from './PaymentsClient';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';

function payoutBadgeVariant(status: string) {
  if (status === 'paid') return 'success' as const;
  if (status === 'pending' || status === 'in_transit') return 'warning' as const;
  return 'danger' as const;
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
  searchParams: Promise<{ setup?: string; connect_error?: string }>;
}) {
  let shopId: string;
  try {
    ({ shopId } = await requireShopAccess());
  } catch {
    redirect('/app/onboarding');
  }
  const { setup, connect_error } = await searchParams;

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: {
      stripeConnectAccountId: true,
      stripeConnectOnboarded: true,
      platformFeePercent: true,
    },
  });

  const onboarded = shop?.stripeConnectOnboarded ?? false;
  const notConnected = !shop?.stripeConnectAccountId;
  const notOnboarded = !!shop?.stripeConnectAccountId && !onboarded;

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

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Payments"
        description="Manage your Stripe account and payouts"
      />

      {setup === 'required' && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-amber-300 text-sm">
          Connect your Stripe account to start accepting payments and enable checkout.
        </div>
      )}

      {connect_error === 'stripe-connect-not-enabled' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-sm">
          Stripe Connect is not enabled on your account. Visit{' '}
          <a href="https://dashboard.stripe.com/connect/accounts/overview" target="_blank" rel="noreferrer" className="underline">
            dashboard.stripe.com → Connect
          </a>{' '}
          to activate it, then try again.
        </div>
      )}

      {connect_error && connect_error !== 'stripe-connect-not-enabled' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-sm">
          Failed to connect Stripe account: {decodeURIComponent(connect_error)}
        </div>
      )}

      {/* Connect Status */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold text-lg">Stripe Account</h2>
            {notConnected && <p className="text-slate-400 text-sm mt-1">Connect your bank account to accept card payments.</p>}
            {notOnboarded && <p className="text-slate-400 text-sm mt-1">Your setup is incomplete. Click below to finish onboarding.</p>}
            {onboarded && (
              <p className="text-sm mt-1 flex items-center gap-2">
                <Badge variant="success" dot>Active — accepting payments</Badge>
              </p>
            )}
          </div>
          {onboarded && <StripeDashboardButton />}
        </div>
        {(notConnected || notOnboarded) && <div className="mt-4"><ConnectButton /></div>}
      </Card>

      {stripeError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-sm">{stripeError}</div>
      )}

      {/* Balance */}
      {onboarded && balance && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <p className="text-slate-500 text-xs uppercase tracking-wider font-medium">Available balance</p>
            <p className="text-3xl font-bold text-emerald-400 mt-2">${(balance.available / 100).toFixed(2)}</p>
            <p className="text-slate-500 text-xs mt-1 mb-4">Ready to withdraw</p>
            <RequestPayoutButton availableCents={balance.available} />
          </Card>
          <Card>
            <p className="text-slate-500 text-xs uppercase tracking-wider font-medium">Pending balance</p>
            <p className="text-3xl font-bold text-amber-400 mt-2">${(balance.pending / 100).toFixed(2)}</p>
            <p className="text-slate-500 text-xs mt-1">Typically available in 2 business days</p>
          </Card>
        </div>
      )}

      {/* Payouts */}
      {onboarded && (
        <>
          <h2 className="text-white font-semibold text-lg">Payout history</h2>
          {payouts.length === 0 ? (
            <Card><p className="text-slate-500 text-sm text-center py-4">No payouts yet.</p></Card>
          ) : (
            <Table>
              <TableHead>
                <TableHeader>Date</TableHeader>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader className="hidden sm:table-cell">Bank</TableHeader>
              </TableHead>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>
                      {new Date(payout.created * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-white font-medium">${(payout.amount / 100).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={payoutBadgeVariant(payout.status)}>
                        {payout.status === 'in_transit' ? 'In transit' : payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{bankLabel(payout.destination)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}
    </div>
  );
}
