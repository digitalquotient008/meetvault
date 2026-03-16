'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, DollarSign, AlertCircle } from 'lucide-react';
import { createConnectAccountAction, createInstantPayoutAction } from '../connect/actions';
import { createStripeDashboardLinkAction } from './actions';

export function ConnectButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const { onboardingUrl } = await createConnectAccountAction();
      window.location.href = onboardingUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start onboarding');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleConnect}
        disabled={loading}
        className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold px-5 py-2.5 rounded-xl transition-colors"
      >
        {loading ? 'Redirecting to Stripe…' : 'Connect Stripe account'}
      </button>
      {error && (
        <p className="text-red-400 text-sm flex items-center gap-1">
          <AlertCircle className="w-4 h-4" /> {error}
        </p>
      )}
    </div>
  );
}

export function StripeDashboardButton() {
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    setLoading(true);
    try {
      const { url } = await createStripeDashboardLinkAction();
      window.open(url, '_blank');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleOpen}
      disabled={loading}
      className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
    >
      <ExternalLink className="w-4 h-4" />
      {loading ? 'Opening…' : 'Stripe Dashboard'}
    </button>
  );
}

export function RequestPayoutButton({
  availableCents,
}: {
  availableCents: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxDollars = availableCents / 100;
  const inputDollars = parseFloat(amount) || 0;
  const isValid = inputDollars >= 1 && inputDollars <= maxDollars;

  const handlePayout = async () => {
    if (!isValid) return;
    setLoading(true);
    setError(null);
    try {
      await createInstantPayoutAction(Math.round(inputDollars * 100));
      setOpen(false);
      setAmount('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={availableCents < 100}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold px-4 py-2 rounded-xl transition-colors text-sm"
      >
        <DollarSign className="w-4 h-4" />
        Request payout
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-white font-bold text-lg">Request payout</h3>
            <p className="text-slate-400 text-sm">
              Available: <span className="text-white">${maxDollars.toFixed(2)}</span>
            </p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                min="1"
                max={maxDollars}
                step="0.01"
                placeholder={maxDollars.toFixed(2)}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-7 pr-4 py-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setAmount(maxDollars.toFixed(2))}
              className="text-amber-400 hover:text-amber-300 text-xs"
            >
              Withdraw all available
            </button>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePayout}
                disabled={!isValid || loading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors"
              >
                {loading ? 'Requesting…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
