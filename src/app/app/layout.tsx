import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
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

  let dbError: string | null = null;

  try {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? '';
    const firstName = clerkUser?.firstName ?? undefined;
    const lastName = clerkUser?.lastName ?? undefined;

    const user = await getOrCreateUser(userId, { email, firstName, lastName });

    // Check subscription status — skip for onboarding routes
    const headersList = await headers();
    const pathname = headersList.get('x-next-pathname') ?? '';
    const isOnboardingRoute = pathname.startsWith('/app/onboarding');

    if (!isOnboardingRoute) {
      const membership = await getMembershipForUser(user.id);
      if (membership) {
        const subStatus = await checkSubscriptionStatus(membership.shopId);
        if (subStatus !== null) {
          // Subscription not active — redirect to subscribe page
          redirect('/app/onboarding/subscribe');
        }
      }
    }
  } catch (e) {
    // redirect() throws a special error — re-throw it
    if (e instanceof Error && e.message === 'NEXT_REDIRECT') throw e;
    console.error('Failed to sync user to database:', e);
    dbError = e instanceof Error ? e.message : 'Unknown database error';
  }

  if (dbError) {
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
          <a
            href="/app"
            className="inline-block bg-amber-500 text-slate-950 px-6 py-3 rounded-xl font-bold hover:bg-amber-400 transition-colors"
          >
            Try again
          </a>
          <details className="mt-6 text-left">
            <summary className="text-xs text-slate-600 cursor-pointer hover:text-slate-400">Technical details</summary>
            <pre className="mt-2 text-xs text-red-400/70 bg-slate-950 rounded-lg p-3 overflow-auto max-h-32">{dbError}</pre>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
