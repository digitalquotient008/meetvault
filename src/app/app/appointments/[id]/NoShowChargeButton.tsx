'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { chargeNoShowFeeAction } from './actions';

export default function NoShowChargeButton({
  appointmentId,
  feeAmount,
}: {
  appointmentId: string;
  feeAmount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCharge = async () => {
    setLoading(true);
    setError(null);
    try {
      await chargeNoShowFeeAction(appointmentId);
      setSuccess(true);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Charge failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <span className="text-emerald-400 text-sm font-medium">No-show fee charged ✓</span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
      >
        <AlertTriangle className="w-4 h-4" />
        Charge no-show fee (${feeAmount.toFixed(2)})
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">Charge no-show fee?</h3>
                <p className="text-slate-400 text-sm">
                  ${feeAmount.toFixed(2)} will be charged to the card on file.
                </p>
              </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setOpen(false); setError(null); }}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-xl transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCharge}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
              >
                {loading ? 'Charging…' : 'Confirm charge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
