import Link from 'next/link';
import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AppointmentActions } from '@/components/dashboard/AppointmentActions';

function paymentBadge(apt: { payments: { status: string; amount: unknown; type: string }[]; totalAmount: unknown }) {
  const total = Number(apt.totalAmount ?? 0);
  const paid = apt.payments
    .filter((p) => p.status === 'SUCCEEDED')
    .reduce((s, p) => s + Number(p.amount), 0);
  if (paid >= total - 0.01) return { label: 'Paid', className: 'text-emerald-400' };
  if (apt.payments.some((p) => p.status === 'SUCCEEDED' && p.type === 'DEPOSIT')) return { label: 'Deposit', className: 'text-amber-400' };
  return { label: 'Unpaid', className: 'text-slate-400' };
}

export default async function AppointmentsPage() {
  const { shopId } = await requireShopAccess();
  const appointments = await prisma.appointment.findMany({
    where: { shopId },
    take: 50,
    orderBy: { startDateTime: 'desc' },
    include: { customer: true, barberProfile: true, payments: true },
  });

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Appointments</h1>
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
                  <td className="p-3 text-white">{new Date(apt.startDateTime).toLocaleString()}</td>
                  <td className="p-3 text-slate-300">{apt.customer.firstName} {apt.customer.lastName}</td>
                  <td className="p-3 text-slate-300">{apt.barberProfile.displayName}</td>
                  <td className="p-3"><span className="text-amber-400">{apt.status}</span></td>
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
    </div>
  );
}
