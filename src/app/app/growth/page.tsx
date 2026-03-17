import Link from 'next/link';
import { requireShopAccess } from '@/lib/auth';
import { getDueForRebooking, getDormantCustomers } from '@/lib/services/growth';
import { getShopById } from '@/lib/services/shop';
import { fmtDate } from '@/lib/format-date';
import { TrendingUp, Users } from 'lucide-react';
import SendReminderButton from './SendReminderButton';

export default async function GrowthPage() {
  const { shopId } = await requireShopAccess();
  const [shop, dueForRebooking, dormant] = await Promise.all([
    getShopById(shopId),
    getDueForRebooking(shopId),
    getDormantCustomers(shopId, 60),
  ]);
  const shopSlug = shop?.slug ?? '';
  const tz = shop?.timezone ?? 'America/New_York';

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Growth</h1>
        <p className="text-slate-400 text-sm mt-0.5">Re-engage clients and reduce churn</p>
      </div>

      <section className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg font-semibold text-white">Due for rebooking</h2>
          {dueForRebooking.length > 0 && (
            <span className="px-2 py-0.5 bg-amber-500/15 text-amber-400 text-xs font-medium rounded-full">
              {dueForRebooking.length}
            </span>
          )}
        </div>
        <p className="text-slate-500 text-sm mb-3">
          Customers with a suggested return date in the next 7 days or overdue.
        </p>
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {dueForRebooking.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-5 h-5 text-slate-500" />
              </div>
              <p className="text-slate-500 text-sm">No customers due for rebooking in the next 7 days.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-800">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Suggested return</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Last visit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {dueForRebooking.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <Link href={`/app/customers/${c.id}`} className="font-medium text-amber-400 hover:text-amber-300">
                        {c.firstName} {c.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">
                      {c.nextSuggestedAt ? fmtDate(c.nextSuggestedAt, tz) : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400">
                      {c.lastVisitAt ? fmtDate(c.lastVisitAt, tz) : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      {shopSlug && (
                        <Link href={`/book/${shopSlug}`} className="text-xs text-amber-400 hover:text-amber-300 font-medium">
                          Book →
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg font-semibold text-white">Dormant clients</h2>
          {dormant.length > 0 && (
            <span className="px-2 py-0.5 bg-slate-700 text-slate-400 text-xs font-medium rounded-full">
              {dormant.length}
            </span>
          )}
        </div>
        <p className="text-slate-500 text-sm mb-3">
          Customers who haven&apos;t visited in 60+ days. Send a win-back reminder.
        </p>
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {dormant.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-5 h-5 text-slate-500" />
              </div>
              <p className="text-slate-500 text-sm">No dormant clients in this segment.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-800">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Last visit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {dormant.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <Link href={`/app/customers/${c.id}`} className="font-medium text-amber-400 hover:text-amber-300">
                        {c.firstName} {c.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400">{c.email ?? c.phone ?? '—'}</td>
                    <td className="px-4 py-3.5 text-slate-400">
                      {c.lastVisitAt ? fmtDate(c.lastVisitAt, tz) : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <SendReminderButton customerId={c.id} hasEmail={!!c.email} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
