import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getOrCreateUser, getMembershipForUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { startOfDayInTz, endOfDayInTz } from '@/lib/format-date';
import Link from 'next/link';
import { Calendar, Scissors, Users } from 'lucide-react';

export default async function AppDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const clerkUser = await currentUser();
  const user = await getOrCreateUser(userId, {
    email: clerkUser?.emailAddresses?.[0]?.emailAddress ?? '',
    firstName: clerkUser?.firstName ?? undefined,
    lastName: clerkUser?.lastName ?? undefined,
  });

  const membership = await getMembershipForUser(user.id);
  if (!membership) {
    redirect('/app/onboarding');
  }

  const shop = await prisma.shop.findUnique({
    where: { id: membership.shopId },
    include: {
      _count: {
        select: { services: true, barberProfiles: true, customers: true },
      },
    },
  });
  if (!shop) redirect('/app/onboarding');

  const tz = shop.timezone ?? 'America/New_York';
  const todayStart = startOfDayInTz(tz);
  const todayEnd = endOfDayInTz(tz);

  const todayAppointments = await prisma.appointment.count({
    where: {
      shopId: shop.id,
      startDateTime: { gte: todayStart, lte: todayEnd },
      status: { not: 'CANCELED' },
    },
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{shop.name}</h1>
        <p className="text-slate-400 mt-1">Dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Calendar className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{todayAppointments}</p>
              <p className="text-sm text-slate-400">Today&apos;s appointments</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Scissors className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{shop._count.services}</p>
              <p className="text-sm text-slate-400">Services</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{shop._count.barberProfiles}</p>
              <p className="text-sm text-slate-400">Staff</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{shop._count.customers}</p>
              <p className="text-sm text-slate-400">Customers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Your booking link</h2>
        <p className="text-slate-400 text-sm mb-4">
          Share this link so clients can book online. White-labeled to your shop.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <code className="bg-slate-800 px-3 py-2 rounded-lg text-amber-400 text-sm break-all">
            {process.env.NEXT_PUBLIC_APP_URL || ''}/book/{shop.slug}
          </code>
          <Link
            href={`/book/${shop.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-amber-400 hover:text-amber-300"
          >
            Open booking page →
          </Link>
        </div>
      </div>
    </div>
  );
}
