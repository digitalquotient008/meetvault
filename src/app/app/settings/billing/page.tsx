import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { CreditCard } from 'lucide-react';
import BillingActions from './BillingActions';

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

  const statusLabel: Record<string, { text: string; color: string }> = {
    trialing: { text: 'Free trial', color: 'text-amber-400 bg-amber-500/10' },
    active: { text: 'Active', color: 'text-emerald-400 bg-emerald-500/10' },
    past_due: { text: 'Past due', color: 'text-red-400 bg-red-500/10' },
    canceled: { text: 'Canceled', color: 'text-slate-400 bg-slate-700/50' },
    unpaid: { text: 'Unpaid', color: 'text-red-400 bg-red-500/10' },
  };

  const badge = statusLabel[status] ?? { text: status, color: 'text-slate-400 bg-slate-700/50' };

  return (
    <div className="p-6 lg:p-8 max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage your subscription and payment method</p>
      </div>

      {/* Subscription status card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">Subscription</h2>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badge.color}`}>
              {badge.text}
            </span>
          </div>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4 text-slate-400" />
              </div>
              <span className="text-slate-400 text-sm">Plan</span>
            </div>
            <span className="text-white text-sm font-medium">
              MeetVault Starter — $25/mo
            </span>
          </div>

          {isTrialing && trialEndsAt && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
              <p className="text-amber-300 text-sm">
                Your free trial ends on{' '}
                <span className="font-semibold">
                  {trialEndsAt.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                . You&apos;ll be charged $25/mo after that.
              </p>
            </div>
          )}

          {isPastDue && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <p className="text-red-300 text-sm">
                Your payment failed. Please update your payment method to continue using MeetVault.
              </p>
            </div>
          )}

          {isCanceled && (
            <div className="bg-slate-800 rounded-lg px-4 py-3">
              <p className="text-slate-400 text-sm">
                Your subscription has been canceled. Subscribe again to restore access.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
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
