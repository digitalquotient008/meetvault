import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUser, getMembershipForUser } from '@/lib/auth';
import OnboardingClient from './OnboardingClient';

export default async function OnboardingPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await getOrCreateUser(userId, {
    email: (sessionClaims?.email as string) ?? '',
    firstName: sessionClaims?.firstName as string | undefined,
    lastName: sessionClaims?.lastName as string | undefined,
  }).catch(() => null);
  if (!user) redirect('/sign-in');

  const membership = await getMembershipForUser(user.id);
  if (membership) redirect('/app');

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Set up your shop</h1>
      <p className="text-slate-400 mb-8">
        Create your shop profile, add services and staff, and get your booking link.
      </p>
      <OnboardingClient userId={user.id} />
    </div>
  );
}
