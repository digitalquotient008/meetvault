'use client';

import { useRouter } from 'next/navigation';
import { updateAppointmentStatusAction } from '@/app/app/actions';
import type { AppointmentStatus } from '@prisma/client';

type Props = {
  appointmentId: string;
  status: AppointmentStatus;
};

export function AppointmentActions({ appointmentId, status }: Props) {
  const router = useRouter();

  const handle = async (action: 'start' | 'complete' | 'cancel' | 'no-show') => {
    try {
      await updateAppointmentStatusAction(appointmentId, action);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    }
  };

  if (status === 'CANCELED' || status === 'COMPLETED' || status === 'NO_SHOW') {
    return <span className="text-slate-500 text-xs">{status}</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {status === 'CONFIRMED' && (
        <button
          type="button"
          onClick={() => handle('start')}
          className="text-xs px-2 py-1 rounded bg-amber-600 text-white hover:bg-amber-500"
        >
          Start
        </button>
      )}
      {(status === 'CONFIRMED' || status === 'IN_PROGRESS') && (
        <button
          type="button"
          onClick={() => handle('complete')}
          className="text-xs px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-500"
        >
          Complete
        </button>
      )}
      {(status === 'CONFIRMED' || status === 'IN_PROGRESS') && (
        <>
          <button
            type="button"
            onClick={() => handle('no-show')}
            className="text-xs px-2 py-1 rounded bg-slate-600 text-white hover:bg-slate-500"
          >
            No-show
          </button>
          <button
            type="button"
            onClick={() => handle('cancel')}
            className="text-xs px-2 py-1 rounded border border-slate-600 text-slate-400 hover:bg-slate-800"
          >
            Cancel
          </button>
        </>
      )}
    </div>
  );
}
