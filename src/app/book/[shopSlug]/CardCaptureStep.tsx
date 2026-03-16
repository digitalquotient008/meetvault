'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ShieldCheck } from 'lucide-react';
import { saveCardAction } from './actions';

const stripePromise =
  typeof window !== 'undefined' && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    : null;

function CardForm({
  appointmentId,
  clientSecret,
  onSaved,
  onSkip,
}: {
  appointmentId: string;
  clientSecret: string;
  onSaved: () => void;
  onSkip: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const { error: stripeError, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (stripeError) {
      setError(stripeError.message ?? 'Failed to save card');
      setLoading(false);
      return;
    }

    if (setupIntent?.status === 'succeeded') {
      try {
        await saveCardAction({ appointmentId, setupIntentId: setupIntent.id });
        onSaved();
      } catch {
        setError('Card saved with Stripe but failed to record. You can skip.');
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#f1f5f9',
                '::placeholder': { color: '#64748b' },
              },
              invalid: { color: '#f87171' },
            },
          }}
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold py-3 rounded-xl transition-colors"
      >
        {loading ? 'Saving…' : 'Save card & confirm booking'}
      </button>
      <button
        type="button"
        onClick={onSkip}
        className="w-full py-2.5 text-slate-400 hover:text-white text-sm transition-colors"
      >
        Skip — book without saving card
      </button>
    </form>
  );
}

export default function CardCaptureStep({
  appointmentId,
  noShowFeeAmount,
  cardRequired,
  onDone,
}: {
  appointmentId: string;
  noShowFeeAmount: number | null;
  cardRequired: boolean;
  onDone: () => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/book/setup-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.clientSecret) setClientSecret(data.clientSecret);
        else setLoadError(data.error ?? 'Failed to initialize');
      })
      .catch(() => setLoadError('Failed to connect'));
  }, [appointmentId]);

  if (saved) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-white font-semibold">Card saved!</p>
        <p className="text-slate-400 text-sm text-center">Your booking is confirmed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Save a card on file</h2>
        <p className="text-slate-400 text-sm mt-1">
          {cardRequired
            ? 'A card on file is required to complete your booking.'
            : 'Optionally save a card to guarantee your appointment.'}
        </p>
      </div>

      {/* Policy banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-200/80">
          {noShowFeeAmount
            ? `Your card will NOT be charged today. A $${noShowFeeAmount.toFixed(2)} no-show fee may be applied if you miss your appointment without canceling.`
            : 'Your card will NOT be charged today. It may be used to cover a no-show fee if you miss your appointment without canceling.'}
        </div>
      </div>

      {loadError && (
        <div className="space-y-3">
          <p className="text-red-400 text-sm">{loadError}</p>
          {!cardRequired && (
            <button
              type="button"
              onClick={onDone}
              className="w-full py-2.5 text-slate-400 hover:text-white text-sm transition-colors"
            >
              Skip — book without saving card
            </button>
          )}
        </div>
      )}

      {!loadError && !clientSecret && (
        <p className="text-slate-400 text-sm">Loading secure form…</p>
      )}

      {clientSecret && stripePromise && (
        <Elements
          stripe={stripePromise}
          options={{ appearance: { theme: 'night' } }}
        >
          <CardForm
            appointmentId={appointmentId}
            clientSecret={clientSecret}
            onSaved={() => { setSaved(true); setTimeout(onDone, 1500); }}
            onSkip={cardRequired ? undefined! : onDone}
          />
        </Elements>
      )}
    </div>
  );
}
