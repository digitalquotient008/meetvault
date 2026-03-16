'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { refundPaymentAction } from './actions';

export default function RefundButton({ paymentId, amount }: { paymentId: string; amount: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRefund = async () => {
    if (!confirm('Refund this payment?')) return;
    setLoading(true);
    try {
      await refundPaymentAction(paymentId, undefined, 'Refund from dashboard');
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Refund failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleRefund}
      disabled={loading}
      className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
    >
      {loading ? 'Refunding…' : `Refund $${amount.toFixed(2)}`}
    </button>
  );
}
