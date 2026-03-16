import Link from 'next/link';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getConnectAccountStatus, markShopOnboarded } from '@/lib/services/stripe-connect';

export default async function ConnectReturnPage() {
  const { shopId } = await requireShopAccess();

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { stripeConnectAccountId: true, stripeConnectOnboarded: true },
  });

  let onboarded = shop?.stripeConnectOnboarded ?? false;

  // Verify live with Stripe in case the webhook hasn't fired yet
  if (!onboarded && shop?.stripeConnectAccountId) {
    const { chargesEnabled } = await getConnectAccountStatus(shop.stripeConnectAccountId);
    if (chargesEnabled) {
      await markShopOnboarded(shopId);
      onboarded = true;
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-6">
        {onboarded ? (
          <>
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">You&apos;re all set!</h1>
              <p className="text-slate-400">
                Your Stripe account is connected. You can now accept payments and request
                payouts directly to your bank.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/app/payments"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold py-3 rounded-xl transition-colors"
              >
                Go to Payments
              </Link>
              <Link
                href="/app"
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <AlertCircle className="w-16 h-16 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Setup incomplete</h1>
              <p className="text-slate-400">
                Your Stripe account setup isn&apos;t complete yet. Please finish the onboarding
                process to start accepting payments.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/app/payments"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold py-3 rounded-xl transition-colors"
              >
                Complete Setup
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
