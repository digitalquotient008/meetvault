'use client';

import { useRouter } from 'next/navigation';
import { updateQueueStatusAction } from './actions';
import type { WalkInQueueEntry } from '@prisma/client';

type Props = { entry: WalkInQueueEntry & { customer: { firstName: string; lastName: string } | null } };

export default function QueueEntryRow({ entry }: Props) {
  const router = useRouter();
  const name = entry.customer
    ? `${entry.customer.firstName} ${entry.customer.lastName}`
    : entry.guestName;

  const handleStatus = async (status: 'ASSIGNED' | 'IN_SERVICE' | 'DONE' | 'LEFT') => {
    try {
      await updateQueueStatusAction(entry.id, status);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    }
  };

  return (
    <tr className="border-t border-slate-800">
      <td className="p-3 text-white">{name}</td>
      <td className="p-3 text-slate-400">{new Date(entry.arrivedAt).toLocaleTimeString()}</td>
      <td className="p-3 text-amber-400">{entry.status}</td>
      <td className="p-3">
        <div className="flex flex-wrap gap-1">
          {entry.status === 'WAITING' && (
            <button
              type="button"
              onClick={() => handleStatus('ASSIGNED')}
              className="text-xs px-2 py-1 rounded bg-slate-600 text-white hover:bg-slate-500"
            >
              Assign
            </button>
          )}
          {(entry.status === 'WAITING' || entry.status === 'ASSIGNED') && (
            <button
              type="button"
              onClick={() => handleStatus('IN_SERVICE')}
              className="text-xs px-2 py-1 rounded bg-amber-600 text-white hover:bg-amber-500"
            >
              In service
            </button>
          )}
          {entry.status === 'IN_SERVICE' && (
            <button
              type="button"
              onClick={() => handleStatus('DONE')}
              className="text-xs px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-500"
            >
              Done
            </button>
          )}
          {(entry.status === 'WAITING' || entry.status === 'ASSIGNED' || entry.status === 'IN_SERVICE') && (
            <button
              type="button"
              onClick={() => handleStatus('LEFT')}
              className="text-xs px-2 py-1 rounded border border-slate-600 text-slate-400"
            >
              Left
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
