import { notFound } from 'next/navigation';
import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { fmtDate, fmtDateTime } from '@/lib/format-date';
import Link from 'next/link';
import { listCustomerNotes } from '@/lib/services/customer-notes';
import AddCustomerNoteForm from './AddCustomerNoteForm';
import CustomerDataActions from './CustomerDataActions';

type Props = { params: Promise<{ id: string }> };

export default async function CustomerDetailPage({ params }: Props) {
  const { shopId } = await requireShopAccess();
  const { id } = await params;
  const customer = await prisma.customer.findFirst({
    where: { id, shopId },
    include: {
      appointments: { take: 20, orderBy: { startDateTime: 'desc' }, include: { barberProfile: true } },
    },
  });
  if (!customer) notFound();

  const [notes, shop] = await Promise.all([
    listCustomerNotes(shopId, id),
    prisma.shop.findUnique({ where: { id: shopId }, select: { timezone: true } }),
  ]);
  const tz = shop?.timezone ?? 'America/New_York';

  return (
    <div className="p-6 lg:p-8">
      <Link href="/app/customers" className="text-sm text-slate-400 hover:text-white mb-4 inline-block">← Customers</Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">{customer.firstName} {customer.lastName}</h1>
        <CustomerDataActions customerId={id} customerName={`${customer.firstName} ${customer.lastName}`} />
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 mb-6">
        <p><span className="text-slate-400">Email:</span> {customer.email ?? '—'}</p>
        <p><span className="text-slate-400">Phone:</span> {customer.phone ?? '—'}</p>
        <p><span className="text-slate-400">Total visits:</span> {customer.totalVisits}</p>
        <p><span className="text-slate-400">Last visit:</span> {customer.lastVisitAt ? fmtDate(customer.lastVisitAt, tz) : '—'}</p>
        <p><span className="text-slate-400">Lifetime value:</span> ${Number(customer.totalSpend).toFixed(2)}</p>
        <p><span className="text-slate-400">No-shows:</span> {customer.noShowCount}</p>
      </div>
      <h2 className="text-lg font-semibold text-white mb-3">Visit timeline</h2>
      <ul className="space-y-2 mb-6">
        {customer.appointments.map((apt) => (
          <li key={apt.id} className="text-slate-300 text-sm flex items-center gap-2">
            <span className="text-slate-500">{fmtDateTime(apt.startDateTime, tz)}</span>
            <span>—</span>
            <span>{apt.barberProfile.displayName}</span>
            <span className="text-amber-400">{apt.status}</span>
          </li>
        ))}
        {customer.appointments.length === 0 && <li className="text-slate-500">No appointments yet.</li>}
      </ul>
      <h2 className="text-lg font-semibold text-white mb-3">Notes</h2>
      <AddCustomerNoteForm customerId={id} />
      <ul className="space-y-2 mt-3">
        {notes.map((note) => (
          <li key={note.id} className="bg-slate-800 rounded-lg p-3 text-sm text-slate-300 border border-slate-700">
            {note.content}
            <span className="text-slate-500 text-xs ml-2">{fmtDateTime(note.createdAt, tz)}</span>
          </li>
        ))}
        {notes.length === 0 && <li className="text-slate-500 text-sm">No notes yet.</li>}
      </ul>
    </div>
  );
}
