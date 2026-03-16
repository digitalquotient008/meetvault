'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntentForBookingAction } from '../../actions';

const stripePromise = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

function CheckoutForm({
  shopSlug,
  appointmentId,
  onSuccess,
}: {
  shopSlug: string;
  appointmentId: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);
    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${typeof window !== 'undefined' ? window.location.origin : ''}/book/${shopSlug}/confirm/${appointmentId}`,
          receipt_email: undefined,
        },
      });
      if (submitError) {
        setError(submitError.message ?? 'Payment failed');
      } else {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-500 disabled:opacity-50"
      >
        {loading ? 'Processing…' : 'Pay now'}
      </button>
    </form>
  );
}

export default function PayForm({
  shopSlug,
  appointmentId,
  payType,
}: {
  shopSlug: string;
  appointmentId: string;
  payType: 'DEPOSIT' | 'FULL';
}) {
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      setError('Payments are not configured.');
      return;
    }
    createPaymentIntentForBookingAction(shopSlug, appointmentId, payType)
      .then(({ clientSecret: secret }) => setClientSecret(secret))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to start payment'));
  }, [shopSlug, appointmentId, payType]);

  const onSuccess = () => {
    router.push(`/book/${shopSlug}/confirm/${appointmentId}`);
  };

  if (error) {
    return (
      <div className="bg-slate-800 rounded-lg p-4">
        <p className="text-red-400">{error}</p>
        <a href={`/book/${shopSlug}/confirm/${appointmentId}`} className="text-amber-400 hover:text-amber-300 text-sm mt-2 inline-block">
          Back to confirmation
        </a>
      </div>
    );
  }

  if (!clientSecret || !stripePromise) {
    return <p className="text-slate-400">Loading payment form…</p>;
  }

  const options = { clientSecret, appearance: { theme: 'night' as const } };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm shopSlug={shopSlug} appointmentId={appointmentId} onSuccess={onSuccess} />
    </Elements>
  );
}
