import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { listQueueEntries } from '@/lib/services/queue';
import { UserPlus } from 'lucide-react';
import AddWalkInForm from './AddWalkInForm';
import QueueEntryRow from './QueueEntryRow';

export default async function QueuePage() {
  const { shopId } = await requireShopAccess();
  const [entries, shop] = await Promise.all([
    listQueueEntries(shopId),
    prisma.shop.findUnique({ where: { id: shopId }, select: { timezone: true } }),
  ]);
  const tz = shop?.timezone ?? 'America/New_York';

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Walk-in queue</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage today&apos;s walk-in customers</p>
        </div>
        {entries.length > 0 && (
          <span className="text-slate-500 text-sm">{entries.length} in queue</span>
        )}
      </div>

      <AddWalkInForm />

      <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {entries.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-slate-400 font-medium mb-1">Queue is empty</p>
            <p className="text-slate-500 text-sm">Add a walk-in customer above to get started.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Arrived</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {entries.map((entry) => (
                <QueueEntryRow key={entry.id} entry={entry} timezone={tz} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
