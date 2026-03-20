import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { CreditCard } from 'lucide-react';
import BillingActions from './BillingActions';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function BillingPage() {
  const { shopId, role } = await requireShopAccess();
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: {
      subscriptionStatus: true,
      trialEndsAt: true,
      stripeSubscriptionId: true,
      stripeCustomerId: true,
    },
  });

  const status = shop?.subscriptionStatus ?? 'none';
  const trialEndsAt = shop?.trialEndsAt;
  const isTrialing = status === 'trialing';
  const isActive = status === 'active';
  const isCanceled = status === 'canceled';
  const isPastDue = status === 'past_due';

  const badgeMap: Record<string, { text: string; variant: 'warning' | 'success' | 'danger' | 'neutral' }> = {
    trialing: { text: 'Free trial', variant: 'warning' },
    active: { text: 'Active', variant: 'success' },
    past_due: { text: 'Past due', variant: 'danger' },
    canceled: { text: 'Canceled', variant: 'neutral' },
    unpaid: { text: 'Unpaid', variant: 'danger' },
  };

  const badge = badgeMap[status] ?? { text: status, variant: 'neutral' as const };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-8">
      <PageHeader title="Billing" description="Manage your subscription and payment method" />

      <Card padding="none">
        <div className="px-6 py-4 border-b border-slate-800/50 flex items-center justify-between">
          <h2 className="text-white font-semibold">Subscription</h2>
          <Badge variant={badge.variant} dot>{badge.text}</Badge>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4 text-slate-500" />
              </div>
              <span className="text-slate-400 text-sm">Plan</span>
            </div>
            <span className="text-white text-sm font-medium">MeetVault Starter — $25/mo</span>
          </div>

          {isTrialing && trialEndsAt && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
              <p className="text-amber-300 text-sm">
                Your free trial ends on{' '}
                <span className="font-semibold">
                  {trialEndsAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                . You&apos;ll be charged $25/mo after that.
              </p>
            </div>
          )}

          {isPastDue && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-red-300 text-sm">
                Your payment failed. Please update your payment method to continue using MeetVault.
              </p>
            </div>
          )}

          {isCanceled && (
            <div className="bg-slate-800 rounded-xl px-4 py-3">
              <p className="text-slate-400 text-sm">
                Your subscription has been canceled. Subscribe again to restore access.
              </p>
            </div>
          )}
        </div>
      </Card>

      {role === 'OWNER' && shop?.stripeCustomerId && (
        <BillingActions
          shopId={shopId}
          status={status}
          hasSubscription={!!shop.stripeSubscriptionId}
        />
      )}
    </div>
  );
}
