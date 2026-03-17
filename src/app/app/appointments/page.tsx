import Link from 'next/link';
import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AppointmentActions } from '@/components/dashboard/AppointmentActions';
import { fmtDateTime } from '@/lib/format-date';

const PAGE_SIZE = 50;

function paymentBadge(apt: { payments: { status: string; amount: unknown; type: string }[]; totalAmount: unknown }) {
  const total = Number(apt.totalAmount ?? 0);
  const paid = apt.payments
    .filter((p) => p.status === 'SUCCEEDED')
    .reduce((s, p) => s + Number(p.amount), 0);
  if (paid >= total - 0.01) return { label: 'Paid', className: 'text-emerald-400' };
  if (apt.payments.some((p) => p.status === 'SUCCEEDED' && p.type === 'DEPOSIT')) return { label: 'Deposit', className: 'text-amber-400' };
  return { label: 'Unpaid', className: 'text-slate-400' };
}

function statusColor(status: string): string {
  switch (status) {
    case 'CONFIRMED':   return 'text-amber-400';
    case 'PENDING':     return 'text-slate-400';
    case 'IN_PROGRESS': return 'text-sky-400';
    case 'COMPLETED':   return 'text-emerald-400';
    case 'CANCELED':
    case 'NO_SHOW':     return 'text-red-400';
    default:            return 'text-slate-400';
  }
}

type Props = { searchParams: Promise<{ page?: string }> };

export default async function AppointmentsPage({ searchParams }: Props) {
  const { shopId } = await requireShopAccess();
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const shop = await prisma.shop.findUnique({ where: { id: shopId }, select: { timezone: true } });
  const tz = shop?.timezone ?? 'America/New_York';

  const [total, appointments] = await Promise.all([
    prisma.appointment.count({ where: { shopId } }),
    prisma.appointment.findMany({
      where: { shopId },
      take: PAGE_SIZE,
      skip,
      orderBy: { startDateTime: 'desc' },
      include: { customer: true, barberProfile: true, payments: true },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Appointments</h1>
        <p className="text-slate-400 text-sm">{total} total</p>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-slate-400 text-left">
            <tr>
              <th className="p-3">Date / Time</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Barber</th>
              <th className="p-3">Status</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Actions</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((apt) => {
              const badge = paymentBadge(apt);
              return (
                <tr key={apt.id} className="border-t border-slate-800">
                  <td className="p-3 text-white">{fmtDateTime(apt.startDateTime, tz)}</td>
                  <td className="p-3 text-slate-300">{apt.customer.firstName} {apt.customer.lastName}</td>
                  <td className="p-3 text-slate-300">{apt.barberProfile.displayName}</td>
                  <td className="p-3">
                    <span className={statusColor(apt.status)}>
                      {apt.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3"><span className={badge.className}>{badge.label}</span></td>
                  <td className="p-3">
                    <AppointmentActions appointmentId={apt.id} status={apt.status} />
                  </td>
                  <td className="p-3">
                    <Link href={`/app/appointments/${apt.id}`} className="text-amber-400 hover:text-amber-300 text-xs">
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {appointments.length === 0 && <p className="p-6 text-slate-500">No appointments yet.</p>}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-slate-400 text-sm">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/app/appointments?page=${page - 1}`}
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 text-sm"
              >
                ← Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/app/appointments?page=${page + 1}`}
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 text-sm"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
