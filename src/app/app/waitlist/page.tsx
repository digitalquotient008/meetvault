import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { listWaitlistEntries } from '@/lib/services/waitlist';
import { fmtDateTime } from '@/lib/format-date';
import { ClipboardList } from 'lucide-react';

export default async function WaitlistPage() {
  const { shopId } = await requireShopAccess();
  const [entries, shop] = await Promise.all([
    listWaitlistEntries(shopId),
    prisma.shop.findUnique({ where: { id: shopId }, select: { timezone: true } }),
  ]);
  const tz = shop?.timezone ?? 'America/New_York';

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Waitlist</h1>
          <p className="text-slate-400 text-sm mt-0.5">Customers waiting for availability</p>
        </div>
        {entries.length > 0 && (
          <span className="text-slate-500 text-sm">{entries.length} waiting</span>
        )}
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {entries.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-slate-400 font-medium mb-1">No one on the waitlist</p>
            <p className="text-slate-500 text-sm">Customers who request to be waitlisted will appear here.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Preferred</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-white">
                    {entry.customer.firstName} {entry.customer.lastName}
                  </td>
                  <td className="px-4 py-3.5 text-slate-400">
                    {entry.customer.email ?? entry.customer.phone ?? '—'}
                  </td>
                  <td className="px-4 py-3.5 text-slate-400">
                    {entry.preferredServiceId ? 'Service' : '—'}{entry.preferredBarberProfileId ? ' · Barber' : ''}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full text-xs font-medium">
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500">{fmtDateTime(entry.createdAt, tz)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
