import { notFound } from 'next/navigation';
import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';

type Props = { params: Promise<{ id: string }> };

export default async function CustomerDetailPage({ params }: Props) {
  const { shopId } = await requireShopAccess();
  const { id } = await params;
  const customer = await prisma.customer.findFirst({
    where: { id, shopId },
    include: {
      appointments: { take: 10, orderBy: { startDateTime: 'desc' }, include: { barberProfile: true } },
    },
  });
  if (!customer) notFound();

  return (
    <div className="p-6 lg:p-8">
      <Link href="/app/customers" className="text-sm text-slate-400 hover:text-white mb-4 inline-block">← Customers</Link>
      <h1 className="text-2xl font-bold text-white mb-6">{customer.firstName} {customer.lastName}</h1>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 mb-6">
        <p><span className="text-slate-400">Email:</span> {customer.email ?? '—'}</p>
        <p><span className="text-slate-400">Phone:</span> {customer.phone ?? '—'}</p>
        <p><span className="text-slate-400">Total visits:</span> {customer.totalVisits}</p>
        <p><span className="text-slate-400">Last visit:</span> {customer.lastVisitAt ? new Date(customer.lastVisitAt).toLocaleDateString() : '—'}</p>
      </div>
      <h2 className="text-lg font-semibold text-white mb-3">Recent appointments</h2>
      <ul className="space-y-2">
        {customer.appointments.map((apt) => (
          <li key={apt.id} className="text-slate-300 text-sm">
            {new Date(apt.startDateTime).toLocaleString()} — {apt.barberProfile.displayName} — {apt.status}
          </li>
        ))}
        {customer.appointments.length === 0 && <li className="text-slate-500">No appointments yet.</li>}
      </ul>
    </div>
  );
}
