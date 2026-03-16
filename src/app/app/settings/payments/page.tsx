import Link from 'next/link';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';
import { ConnectButton } from '../../payments/PaymentsClient';

export default async function PaymentSettingsPage() {
  const { shopId } = await requireShopAccess();

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: {
      stripeConnectAccountId: true,
      stripeConnectOnboarded: true,
      platformFeePercent: true,
      tippingEnabled: true,
    },
  });
  if (!shop) return null;

  const platformFeeDisplay = Number(shop.platformFeePercent ?? env.PLATFORM_FEE_PERCENT ?? 0).toFixed(2);
  const accountMasked = shop.stripeConnectAccountId
    ? `acct_••••${shop.stripeConnectAccountId.slice(-4)}`
    : null;

  return (
    <div className="p-6 lg:p-8 max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Payment settings</h1>
        <p className="text-slate-400 mt-1 text-sm">Manage your Stripe Connect account and payment configuration</p>
      </div>

      {/* Stripe Connect Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-white font-semibold">Stripe Connect</h2>

        <div className="flex items-center gap-3">
          {shop.stripeConnectOnboarded ? (
            <>
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-white text-sm font-medium">Connected</p>
                {accountMasked && (
                  <p className="text-slate-500 text-xs font-mono">{accountMasked}</p>
                )}
              </div>
            </>
          ) : shop.stripeConnectAccountId ? (
            <>
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-white text-sm font-medium">Setup incomplete</p>
                <p className="text-slate-500 text-xs">Finish onboarding to start accepting payments</p>
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-slate-500 shrink-0" />
              <div>
                <p className="text-slate-400 text-sm">Not connected</p>
              </div>
            </>
          )}
        </div>

        {!shop.stripeConnectOnboarded && <ConnectButton />}

        {shop.stripeConnectOnboarded && (
          <Link
            href="/app/payments"
            className="inline-flex text-amber-400 hover:text-amber-300 text-sm"
          >
            View balance and payouts →
          </Link>
        )}
      </div>

      {/* Platform Fee */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <h2 className="text-white font-semibold">Platform fee</h2>
        <div className="flex items-center justify-between">
          <p className="text-slate-400 text-sm">Per-transaction fee (deducted by MeetingVault)</p>
          <span className="text-white font-mono text-lg">{platformFeeDisplay}%</span>
        </div>
        <p className="text-slate-500 text-xs">
          This fee is applied on top of Stripe&apos;s processing fee for each payment.
        </p>
      </div>

      {/* Tipping */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold">Tipping</h2>
            <p className="text-slate-400 text-sm mt-1">
              Allow clients to add a tip during checkout
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              shop.tippingEnabled
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            {shop.tippingEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <p className="text-slate-500 text-xs">
          To change this setting, update it in your shop settings.
        </p>
      </div>
    </div>
  );
}
