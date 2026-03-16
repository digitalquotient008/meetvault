import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getOrCreateUser, getMembershipForUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { startOfDayInTz, endOfDayInTz, fmtTime } from '@/lib/format-date';
import { APP_URL } from '@/lib/constants';
import Link from 'next/link';
import {
  Calendar,
  Scissors,
  Users,
  TrendingUp,
  ArrowUpRight,
  Clock,
  ExternalLink,
  Copy,
  UserPlus,
  ClipboardList,
  DollarSign,
} from 'lucide-react';
import CopyBookingLink from '@/components/dashboard/CopyBookingLink';

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
  if (!membership) redirect('/app/onboarding');

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

  const [todayAppointmentCount, todayAppointments, pendingCount, recentRevenue] = await Promise.all([
    prisma.appointment.count({
      where: {
        shopId: shop.id,
        startDateTime: { gte: todayStart, lte: todayEnd },
        status: { not: 'CANCELED' },
      },
    }),
    prisma.appointment.findMany({
      where: {
        shopId: shop.id,
        startDateTime: { gte: todayStart, lte: todayEnd },
        status: { not: 'CANCELED' },
      },
      include: { customer: true, barberProfile: true, appointmentServices: true },
      orderBy: { startDateTime: 'asc' },
      take: 10,
    }),
    prisma.appointment.count({
      where: {
        shopId: shop.id,
        status: 'PENDING',
      },
    }),
    prisma.payment.aggregate({
      where: {
        shopId: shop.id,
        status: 'SUCCEEDED',
        createdAt: { gte: todayStart, lte: todayEnd },
      },
      _sum: { amount: true },
    }),
  ]);

  const todayRevenue = Number(recentRevenue._sum.amount ?? 0);
  const firstName = user.firstName || 'there';

  const statusColor: Record<string, string> = {
    CONFIRMED: 'bg-emerald-500/20 text-emerald-400',
    PENDING: 'bg-amber-500/20 text-amber-400',
    IN_PROGRESS: 'bg-blue-500/20 text-blue-400',
    COMPLETED: 'bg-slate-700/50 text-slate-400',
    NO_SHOW: 'bg-red-500/20 text-red-400',
  };

  const bookingUrl = `${APP_URL}/book/${shop.slug}`;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          Hey {firstName} 👋
        </h1>
        <p className="text-slate-400 mt-1">
          Here&apos;s what&apos;s happening at <span className="text-white font-medium">{shop.name}</span> today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link
          href="/app/calendar"
          className="group bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-5 hover:border-amber-500/40 transition-all hover:shadow-lg hover:shadow-amber-500/5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-amber-500/15 rounded-xl">
              <Calendar className="w-5 h-5 text-amber-400" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-amber-500/40 group-hover:text-amber-400 transition-colors" />
          </div>
          <p className="text-3xl font-bold text-white">{todayAppointmentCount}</p>
          <p className="text-sm text-slate-400 mt-0.5">Today&apos;s appointments</p>
        </Link>

        <Link
          href="/app/services"
          className="group bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-5 hover:border-emerald-500/40 transition-all hover:shadow-lg hover:shadow-emerald-500/5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-emerald-500/15 rounded-xl">
              <Scissors className="w-5 h-5 text-emerald-400" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-emerald-500/40 group-hover:text-emerald-400 transition-colors" />
          </div>
          <p className="text-3xl font-bold text-white">{shop._count.services}</p>
          <p className="text-sm text-slate-400 mt-0.5">Active services</p>
        </Link>

        <Link
          href="/app/customers"
          className="group bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-5 hover:border-blue-500/40 transition-all hover:shadow-lg hover:shadow-blue-500/5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-blue-500/15 rounded-xl">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-blue-500/40 group-hover:text-blue-400 transition-colors" />
          </div>
          <p className="text-3xl font-bold text-white">{shop._count.customers}</p>
          <p className="text-sm text-slate-400 mt-0.5">Total customers</p>
        </Link>

        <Link
          href="/app/reports"
          className="group bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-2xl p-5 hover:border-purple-500/40 transition-all hover:shadow-lg hover:shadow-purple-500/5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-purple-500/15 rounded-xl">
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-purple-500/40 group-hover:text-purple-400 transition-colors" />
          </div>
          <p className="text-3xl font-bold text-white">${todayRevenue.toFixed(2)}</p>
          <p className="text-sm text-slate-400 mt-0.5">Today&apos;s revenue</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">Today&apos;s schedule</h2>
              {pendingCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-amber-500/15 text-amber-400 text-xs font-medium rounded-full">
                  {pendingCount} pending
                </span>
              )}
            </div>
            <Link href="/app/calendar" className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1">
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {todayAppointments.length > 0 ? (
            <div className="divide-y divide-slate-800/80">
              {todayAppointments.map((apt) => {
                const serviceName = apt.appointmentServices[0]?.serviceNameSnapshot ?? '—';
                const colorClass = statusColor[apt.status] || 'bg-slate-700/50 text-slate-400';
                const now = new Date();
                const isNext = apt.startDateTime > now && apt.status !== 'COMPLETED';

                return (
                  <Link
                    key={apt.id}
                    href={`/app/appointments/${apt.id}`}
                    className={`flex items-center gap-4 px-6 py-4 hover:bg-slate-800/50 transition-colors group ${
                      isNext ? 'bg-amber-500/[0.03]' : ''
                    }`}
                  >
                    <div className="shrink-0 w-16 text-center">
                      <p className="text-sm font-semibold text-white">{fmtTime(apt.startDateTime, tz)}</p>
                    </div>
                    <div className="h-10 w-px bg-slate-800 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {apt.customer.firstName} {apt.customer.lastName}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {serviceName} · {apt.barberProfile.displayName}
                      </p>
                    </div>
                    <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                      {apt.status.replace('_', ' ')}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors shrink-0" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <Calendar className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No appointments scheduled for today.</p>
              <Link href="/app/calendar" className="text-amber-400 text-sm mt-2 inline-block hover:text-amber-300">
                View calendar →
              </Link>
            </div>
          )}
        </div>

        {/* Right Column — Quick Actions + Booking Link */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Quick actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/app/appointments"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-center group"
              >
                <ClipboardList className="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                <span className="text-xs font-medium text-slate-300">Appointments</span>
              </Link>
              <Link
                href="/app/queue"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-center group"
              >
                <UserPlus className="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                <span className="text-xs font-medium text-slate-300">Walk-in</span>
              </Link>
              <Link
                href="/app/growth"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-center group"
              >
                <TrendingUp className="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                <span className="text-xs font-medium text-slate-300">Growth</span>
              </Link>
              <Link
                href="/app/reports"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-center group"
              >
                <DollarSign className="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                <span className="text-xs font-medium text-slate-300">Reports</span>
              </Link>
            </div>
          </div>

          {/* Booking Link */}
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <ExternalLink className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Booking link</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Share with clients so they can book online.
            </p>
            <div className="bg-slate-950/50 rounded-lg px-3 py-2.5 mb-3">
              <code className="text-amber-400 text-xs break-all">{bookingUrl}</code>
            </div>
            <div className="flex gap-2">
              <CopyBookingLink url={bookingUrl} />
              <Link
                href={`/book/${shop.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-800 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open
              </Link>
            </div>
          </div>

          {/* Staff Overview */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Team</h3>
              <Link href="/app/staff" className="text-xs text-amber-400 hover:text-amber-300">
                Manage →
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg">
                <Users className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{shop._count.barberProfiles}</p>
                <p className="text-xs text-slate-500">Active staff members</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
