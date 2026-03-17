'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateAppointmentStatusAction } from '@/app/app/actions';
import type { AppointmentStatus } from '@prisma/client';

type Props = {
  appointmentId: string;
  status: AppointmentStatus;
};

export function AppointmentActions({ appointmentId, status }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handle = async (action: 'start' | 'complete' | 'cancel' | 'no-show') => {
    setError(null);
    try {
      await updateAppointmentStatusAction(appointmentId, action);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  };

  if (status === 'CANCELED' || status === 'COMPLETED' || status === 'NO_SHOW') {
    return <span className="text-slate-500 text-xs">{status.replace('_', ' ')}</span>;
  }

  if (status === 'PENDING') {
    return <span className="text-slate-400 text-xs italic">Awaiting card</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {error && (
        <span className="w-full text-xs text-red-400 mb-1">{error}</span>
      )}
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
        <Link
          href={`/app/appointments/${appointmentId}/checkout`}
          className="text-xs px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-500"
        >
          Checkout
        </Link>
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
