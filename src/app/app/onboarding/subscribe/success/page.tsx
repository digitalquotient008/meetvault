import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { syncSubscriptionFromCheckout } from '@/lib/services/subscription';
import Link from 'next/link';

type Props = { searchParams: Promise<{ session_id?: string }> };

export default async function SubscribeSuccessPage({ searchParams }: Props) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { session_id } = await searchParams;

  if (session_id) {
    try {
      await syncSubscriptionFromCheckout(session_id);
    } catch (e) {
      console.error('Failed to sync subscription:', e);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">You&apos;re all set!</h1>
        <p className="text-slate-400 mb-2">
          Your 14-day free trial has started. You won&apos;t be charged until it ends.
        </p>
        <p className="text-slate-500 text-sm mb-8">
          Cancel anytime from Settings → Billing.
        </p>
        <Link
          href="/app"
          className="inline-block bg-amber-500 text-slate-950 px-8 py-4 rounded-xl font-bold text-lg hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
