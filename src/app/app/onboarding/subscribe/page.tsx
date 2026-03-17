import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getOrCreateUser, getMembershipForUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import SubscribeClient from './SubscribeClient';

export default async function SubscribePage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const clerkUser = await currentUser();
  const user = await getOrCreateUser(userId, {
    email: clerkUser?.emailAddresses?.[0]?.emailAddress ?? '',
    firstName: clerkUser?.firstName ?? undefined,
    lastName: clerkUser?.lastName ?? undefined,
  });

  const membership = await getMembershipForUser(user.id);
  if (!membership) redirect('/app/onboarding');

  // If already subscribed, go to dashboard
  const shop = await prisma.shop.findUnique({
    where: { id: membership.shopId },
    select: { subscriptionStatus: true, name: true },
  });

  if (shop?.subscriptionStatus === 'active' || shop?.subscriptionStatus === 'trialing') {
    redirect('/app');
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Start your free trial</h1>
          <p className="text-slate-400 text-sm">
            Add a card to activate your 14-day free trial. You won&apos;t be charged until the trial ends.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-6">
          <div className="text-center mb-6">
            <p className="text-4xl font-bold text-white">$25<span className="text-lg text-slate-400 font-normal">/mo</span></p>
            <p className="text-slate-500 text-sm mt-1">after 14-day free trial</p>
          </div>

          <div className="space-y-3 mb-8 text-sm">
            {['Online booking & scheduling', 'Deposits & no-show protection', 'Client CRM & history', 'Appointment reminders (email + SMS)', 'Walk-in queue & waitlist', 'Revenue reports & growth tools'].map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-300">{f}</span>
              </div>
            ))}
          </div>

          <SubscribeClient
            shopId={membership.shopId}
            ownerEmail={user.email}
          />
        </div>

        <div className="text-center space-y-2">
          <p className="text-slate-500 text-xs">Cancel anytime before the trial ends — you won&apos;t be charged.</p>
          <p className="text-slate-600 text-xs">Payments processed securely by Stripe.</p>
        </div>
      </div>
    </div>
  );
}
