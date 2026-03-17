'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  openBillingPortalAction,
  cancelSubscriptionAction,
  resumeSubscriptionAction,
} from './actions';

export default function BillingActions({
  shopId,
  status,
  hasSubscription,
}: {
  shopId: string;
  status: string;
  hasSubscription: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isActive = status === 'active' || status === 'trialing';

  const handlePortal = async () => {
    setLoading('portal');
    setError(null);
    try {
      const { url } = await openBillingPortalAction();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open portal');
      setLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure? Your subscription will remain active until the end of the billing period.')) return;
    setLoading('cancel');
    setError(null);
    try {
      await cancelSubscriptionAction();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel');
    } finally {
      setLoading(null);
    }
  };

  const handleResume = async () => {
    setLoading('resume');
    setError(null);
    try {
      await resumeSubscriptionAction();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {hasSubscription && (
          <button
            type="button"
            onClick={handlePortal}
            disabled={loading !== null}
            className="px-5 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            {loading === 'portal' ? 'Opening...' : 'Manage payment method'}
          </button>
        )}

        {isActive && hasSubscription && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading !== null}
            className="px-5 py-2.5 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/10 disabled:opacity-50 transition-colors"
          >
            {loading === 'cancel' ? 'Canceling...' : 'Cancel subscription'}
          </button>
        )}

        {status === 'canceled' && hasSubscription && (
          <button
            type="button"
            onClick={handleResume}
            disabled={loading !== null}
            className="px-5 py-2.5 bg-amber-500 text-slate-950 rounded-xl text-sm font-bold hover:bg-amber-400 disabled:opacity-50 transition-colors"
          >
            {loading === 'resume' ? 'Resuming...' : 'Resume subscription'}
          </button>
        )}
      </div>
    </div>
  );
}
