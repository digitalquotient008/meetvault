import { requireShopAccess } from '@/lib/auth';
import { listWaitlistEntries } from '@/lib/services/waitlist';

export default async function WaitlistPage() {
  const { shopId } = await requireShopAccess();
  const entries = await listWaitlistEntries(shopId);

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Waitlist</h1>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-slate-400 text-left">
            <tr>
              <th className="p-3">Customer</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Preferred</th>
              <th className="p-3">Status</th>
              <th className="p-3">Added</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-t border-slate-800">
                <td className="p-3 text-white">
                  {entry.customer.firstName} {entry.customer.lastName}
                </td>
                <td className="p-3 text-slate-400">
                  {entry.customer.email ?? entry.customer.phone ?? '—'}
                </td>
                <td className="p-3 text-slate-400">
                  {entry.preferredServiceId ? 'Service' : '—'} {entry.preferredBarberProfileId ? '· Barber' : ''}
                </td>
                <td className="p-3 text-amber-400">{entry.status}</td>
                <td className="p-3 text-slate-500">{new Date(entry.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 && (
          <p className="p-6 text-slate-500">No one on the waitlist.</p>
        )}
      </div>
    </div>
  );
}
