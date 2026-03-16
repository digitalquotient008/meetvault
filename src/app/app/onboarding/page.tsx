import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getOrCreateUser, getMembershipForUser } from '@/lib/auth';
import OnboardingClient from './OnboardingClient';

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const clerkUser = await currentUser();
  const user = await getOrCreateUser(userId, {
    email: clerkUser?.emailAddresses?.[0]?.emailAddress ?? '',
    firstName: clerkUser?.firstName ?? undefined,
    lastName: clerkUser?.lastName ?? undefined,
  });

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
