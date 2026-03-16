import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUser, getMembershipForUser } from '@/lib/auth';
import AppSidebar from '@/components/dashboard/AppSidebar';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await getOrCreateUser(userId, {
    email: (sessionClaims?.email as string) ?? '',
    firstName: sessionClaims?.firstName as string | undefined,
    lastName: sessionClaims?.lastName as string | undefined,
  }).catch(() => null);

  if (!user) redirect('/sign-in');

  return (
    <div className="flex min-h-screen bg-slate-950">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
