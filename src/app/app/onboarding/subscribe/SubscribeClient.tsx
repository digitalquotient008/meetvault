'use client';

import { useState } from 'react';
import { startSubscriptionAction } from '../actions';

export default function SubscribeClient({
  shopId,
  ownerEmail,
}: {
  shopId: string;
  ownerEmail: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const { url } = await startSubscriptionAction(shopId, ownerEmail);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
      )}
      <button
        type="button"
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full bg-amber-500 text-slate-950 py-4 rounded-xl font-bold text-lg hover:bg-amber-400 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/20"
      >
        {loading ? 'Redirecting to Stripe...' : 'Start 14-Day Free Trial'}
      </button>
    </>
  );
}
