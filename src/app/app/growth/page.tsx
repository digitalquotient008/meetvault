import Link from 'next/link';
import { requireShopAccess } from '@/lib/auth';
import { getDueForRebooking, getDormantCustomers } from '@/lib/services/growth';
import { getShopById } from '@/lib/services/shop';
import SendReminderButton from './SendReminderButton';

export default async function GrowthPage() {
  const { shopId } = await requireShopAccess();
  const [shop, dueForRebooking, dormant] = await Promise.all([
    getShopById(shopId),
    getDueForRebooking(shopId),
    getDormantCustomers(shopId, 60),
  ]);
  const shopSlug = shop?.slug ?? '';

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Growth</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">Due for rebooking</h2>
        <p className="text-slate-400 text-sm mb-3">
          Customers with a suggested return date in the next 7 days or overdue.
        </p>
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-slate-400 text-left">
              <tr>
                <th className="p-3">Customer</th>
                <th className="p-3">Suggested return</th>
                <th className="p-3">Last visit</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {dueForRebooking.map((c) => (
                <tr key={c.id} className="border-t border-slate-800">
                  <td className="p-3 text-white">
                    <Link href={`/app/customers/${c.id}`} className="text-amber-400 hover:text-amber-300">
                      {c.firstName} {c.lastName}
                    </Link>
                  </td>
                  <td className="p-3 text-slate-300">
                    {c.nextSuggestedAt ? new Date(c.nextSuggestedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="p-3 text-slate-400">
                    {c.lastVisitAt ? new Date(c.lastVisitAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="p-3">
                    {shopSlug && (
                      <Link href={`/book/${shopSlug}`} className="text-xs text-amber-400 hover:text-amber-300">
                        Book
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {dueForRebooking.length === 0 && (
            <p className="p-6 text-slate-500">No customers due for rebooking in the next 7 days.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Dormant clients (60+ days)</h2>
        <p className="text-slate-400 text-sm mb-3">
          Customers who haven’t visited in 60+ days. Send a win-back reminder.
        </p>
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-slate-400 text-left">
              <tr>
                <th className="p-3">Customer</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Last visit</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dormant.map((c) => (
                <tr key={c.id} className="border-t border-slate-800">
                  <td className="p-3 text-white">
                    <Link href={`/app/customers/${c.id}`} className="text-amber-400 hover:text-amber-300">
                      {c.firstName} {c.lastName}
                    </Link>
                  </td>
                  <td className="p-3 text-slate-400">{c.email ?? c.phone ?? '—'}</td>
                  <td className="p-3 text-slate-400">
                    {c.lastVisitAt ? new Date(c.lastVisitAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="p-3">
                    <SendReminderButton customerId={c.id} hasEmail={!!c.email} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {dormant.length === 0 && (
            <p className="p-6 text-slate-500">No dormant clients in this segment.</p>
          )}
        </div>
      </section>
    </div>
  );
}
