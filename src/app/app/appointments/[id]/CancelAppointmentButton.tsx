'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';
import { cancelAppointmentByStaffAction } from './actions';

export default function CancelAppointmentButton({
  appointmentId,
  totalPaid,
}: {
  appointmentId: string;
  totalPaid: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async (refund: boolean) => {
    setLoading(true);
    setError(null);
    try {
      await cancelAppointmentByStaffAction(appointmentId, refund);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-slate-400 hover:text-red-400 text-sm transition-colors"
      >
        <XCircle className="w-4 h-4" />
        Cancel appointment
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-white font-bold text-lg">Cancel appointment</h3>
            <p className="text-slate-400 text-sm">
              {totalPaid > 0
                ? `This customer has paid $${totalPaid.toFixed(2)}. Would you like to refund them?`
                : 'No payments were made. Cancel this appointment?'}
            </p>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="space-y-2">
              {totalPaid > 0 && (
                <button
                  type="button"
                  onClick={() => handleCancel(true)}
                  disabled={loading}
                  className="w-full bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                >
                  {loading ? 'Processing…' : `Cancel & refund $${totalPaid.toFixed(2)}`}
                </button>
              )}
              <button
                type="button"
                onClick={() => handleCancel(false)}
                disabled={loading}
                className="w-full bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
              >
                {loading ? 'Processing…' : totalPaid > 0 ? 'Cancel without refund' : 'Yes, cancel'}
              </button>
              <button
                type="button"
                onClick={() => { setOpen(false); setError(null); }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-xl transition-colors text-sm"
              >
                Keep appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
