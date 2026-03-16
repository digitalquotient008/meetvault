import { requireShopAccess } from '@/lib/auth';
import { listQueueEntries } from '@/lib/services/queue';
import AddWalkInForm from './AddWalkInForm';
import QueueEntryRow from './QueueEntryRow';

export default async function QueuePage() {
  const { shopId } = await requireShopAccess();
  const entries = await listQueueEntries(shopId);

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Walk-in queue</h1>
      <AddWalkInForm />
      <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-slate-400 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Arrived</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <QueueEntryRow key={entry.id} entry={entry} />
            ))}
          </tbody>
        </table>
        {entries.length === 0 && (
          <p className="p-6 text-slate-500">No one in the queue. Add a walk-in above.</p>
        )}
      </div>
    </div>
  );
}
