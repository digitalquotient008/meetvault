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

const btnBase = 'text-xs px-2.5 py-1 rounded-lg font-medium transition-colors';

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
    return null;
  }

  if (status === 'PENDING') {
    return <span className="text-slate-500 text-xs italic">Awaiting card</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {error && <span className="w-full text-xs text-red-400 mb-1">{error}</span>}
      {status === 'CONFIRMED' && (
        <button type="button" onClick={() => handle('start')} className={`${btnBase} bg-amber-500/15 text-amber-400 hover:bg-amber-500/25`}>
          Start
        </button>
      )}
      {(status === 'CONFIRMED' || status === 'IN_PROGRESS') && (
        <Link href={`/app/appointments/${appointmentId}/checkout`} className={`${btnBase} bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25`}>
          Checkout
        </Link>
      )}
      {(status === 'CONFIRMED' || status === 'IN_PROGRESS') && (
        <>
          <button type="button" onClick={() => handle('no-show')} className={`${btnBase} bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700`}>
            No-show
          </button>
          <button type="button" onClick={() => handle('cancel')} className={`${btnBase} text-slate-500 hover:text-red-400 hover:bg-red-500/10`}>
            Cancel
          </button>
        </>
      )}
    </div>
  );
}
