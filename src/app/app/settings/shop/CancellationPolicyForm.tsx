'use client';

import { useState } from 'react';
import { updateCancellationPolicyAction } from './actions';

const FEE_TYPES = [
  { value: 'NONE', label: 'No fee — always full refund within window' },
  { value: 'DEPOSIT_FORFEIT', label: 'Forfeit deposit — keep deposit, refund rest' },
  { value: 'FIXED_FEE', label: 'Fixed fee — charge a set dollar amount' },
  { value: 'PERCENT_OF_TOTAL', label: 'Percent of total — charge a % of the booking' },
] as const;

export default function CancellationPolicyForm({
  shopId,
  current,
}: {
  shopId: string;
  current: {
    cancellationWindowHours: number | null;
    cancellationFeeType: string | null;
    cancellationFeeValue: number | null;
    cancellationPolicy: string | null;
  };
}) {
  const [windowHours, setWindowHours] = useState(
    current.cancellationWindowHours?.toString() ?? '',
  );
  const [feeType, setFeeType] = useState<string>(current.cancellationFeeType ?? 'NONE');
  const [feeValue, setFeeValue] = useState(current.cancellationFeeValue?.toFixed(2) ?? '');
  const [policyText, setPolicyText] = useState(current.cancellationPolicy ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showFeeValue = feeType === 'FIXED_FEE' || feeType === 'PERCENT_OF_TOTAL';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await updateCancellationPolicyAction(shopId, {
        cancellationWindowHours: windowHours ? parseInt(windowHours) : null,
        cancellationFeeType: feeType as 'NONE' | 'DEPOSIT_FORFEIT' | 'FIXED_FEE' | 'PERCENT_OF_TOTAL',
        cancellationFeeValue: feeValue ? parseFloat(feeValue) : null,
        cancellationPolicy: policyText || null,
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {/* Window */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Free cancellation window
        </label>
        <div className="flex items-center gap-3">
          <div className="relative w-28">
            <input
              type="number"
              min="0"
              placeholder="24"
              value={windowHours}
              onChange={(e) => setWindowHours(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <span className="text-slate-400 text-sm">hours before appointment</span>
        </div>
        <p className="text-slate-500 text-xs mt-1.5">
          Customers who cancel at least this many hours before their appointment receive a full refund. Leave blank to always allow free cancellation.
        </p>
      </div>

      {/* Fee type — only matters inside window */}
      {windowHours && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Fee if canceled within window
          </label>
          <div className="space-y-2">
            {FEE_TYPES.map((ft) => (
              <label key={ft.value} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="feeType"
                  value={ft.value}
                  checked={feeType === ft.value}
                  onChange={(e) => setFeeType(e.target.value)}
                  className="mt-0.5 accent-amber-500"
                />
                <span className="text-slate-300 text-sm">{ft.label}</span>
              </label>
            ))}
          </div>

          {showFeeValue && (
            <div className="mt-3 flex items-center gap-3">
              <div className="relative w-28">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {feeType === 'PERCENT_OF_TOTAL' ? '%' : '$'}
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={feeValue}
                  onChange={(e) => setFeeValue(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-7 pr-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <span className="text-slate-400 text-sm">
                {feeType === 'PERCENT_OF_TOTAL' ? 'of booking total' : 'flat fee'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Policy text shown to customers */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Cancellation policy (shown to customers)
        </label>
        <textarea
          rows={3}
          placeholder="e.g. Free cancellation up to 24 hours before your appointment. Late cancellations forfeit the deposit."
          value={policyText}
          onChange={(e) => setPolicyText(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 resize-none text-sm"
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {saved && <p className="text-emerald-400 text-sm">Saved!</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
      >
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}
