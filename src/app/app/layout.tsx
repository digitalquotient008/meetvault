import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getOrCreateUser, getMembershipForUser, checkSubscriptionStatus } from '@/lib/auth';
import AppSidebar from '@/components/dashboard/AppSidebar';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  // Step 1: Sync Clerk user to DB
  let user;
  try {
    const clerkUser = await currentUser();
    user = await getOrCreateUser(clerkUser?.id ?? userId, {
      email: clerkUser?.emailAddresses?.[0]?.emailAddress ?? '',
      firstName: clerkUser?.firstName ?? undefined,
      lastName: clerkUser?.lastName ?? undefined,
    });
  } catch (e) {
    console.error('Failed to sync user to database:', e);
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-slate-400 text-sm mb-6">
            We couldn&apos;t connect to the database. This is usually temporary. Please try again in a moment.
          </p>
          <a href="/app" className="inline-block bg-amber-500 text-slate-950 px-6 py-3 rounded-xl font-bold hover:bg-amber-400 transition-colors">
            Try again
          </a>
        </div>
      </div>
    );
  }

  // Step 2: Check membership
  const membership = await getMembershipForUser(user.id);

  // No membership = user hasn't completed onboarding yet → full-screen layout
  if (!membership) {
    return (
      <div className="min-h-screen bg-slate-950">
        {children}
      </div>
    );
  }

  // Step 3: Check subscription status
  const subStatus = await checkSubscriptionStatus(membership.shopId);
  const hasActiveSubscription = subStatus === null;

  // No active subscription → full-screen layout (subscribe page will render)
  if (!hasActiveSubscription) {
    return (
      <div className="min-h-screen bg-slate-950">
        {children}
      </div>
    );
  }

  // Step 4: Active subscription → full dashboard with sidebar
  return (
    <div className="flex min-h-screen bg-slate-950">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
