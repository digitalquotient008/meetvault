'use client';

import { useState } from 'react';
import { updateNoShowFeeAction } from './actions';

export default function NoShowFeeForm({
  shopId,
  currentFee,
  currentRequired,
}: {
  shopId: string;
  currentFee: number | null;
  currentRequired: boolean;
}) {
  const [fee, setFee] = useState(currentFee?.toFixed(2) ?? '');
  const [required, setRequired] = useState(currentRequired);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await updateNoShowFeeAction(shopId, {
        noShowFeeAmount: fee ? parseFloat(fee) : null,
        cardRequiredForBooking: required,
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
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          No-show fee amount
        </label>
        <div className="relative w-40">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-7 pr-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
          />
        </div>
        <p className="text-slate-500 text-xs mt-1.5">
          Leave blank to disable no-show fees.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={required}
          onClick={() => setRequired((v) => !v)}
          className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${
            required ? 'bg-amber-500' : 'bg-slate-700'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              required ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        <span className="text-slate-300 text-sm">
          Require card to complete booking
        </span>
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
