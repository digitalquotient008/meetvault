'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard } from 'lucide-react';
import {
  createCheckoutPaymentIntentAction,
  completeCheckoutAction,
  completeWithoutPaymentAction,
} from './actions';

const stripePromise =
  typeof window !== 'undefined' && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    : null;

const TIP_PRESETS = [
  { label: '15%', pct: 15 },
  { label: '20%', pct: 20 },
  { label: '25%', pct: 25 },
];

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

type CardOnFile = {
  paymentMethodId: string;
  brand: string | null;
  lastFour: string | null;
} | null;

// Inner form — uses Stripe hooks, must be inside <Elements>
function PaymentForm({
  appointmentId,
  totalChargeCents,
  tipCents,
  cardOnFile,
  onSuccess,
}: {
  appointmentId: string;
  totalChargeCents: number;
  tipCents: number;
  cardOnFile: CardOnFile;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [useNewCard, setUseNewCard] = useState(!cardOnFile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCharge = async () => {
    if (!stripe) return;
    setLoading(true);
    setError(null);

    try {
      const { clientSecret } = await createCheckoutPaymentIntentAction({
        appointmentId,
        tipCents,
      });

      let result;
      if (!useNewCard && cardOnFile) {
        // Customer is present — confirm with stored payment method
        result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: cardOnFile.paymentMethodId,
        });
      } else {
        const cardElement = elements?.getElement(CardElement);
        if (!cardElement) throw new Error('Card element not mounted');
        result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: cardElement },
        });
      }

      if (result.error) {
        setError(result.error.message ?? 'Payment failed');
        return;
      }

      if (result.paymentIntent?.status === 'succeeded') {
        await completeCheckoutAction({ appointmentId, tipCents });
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Payment method selector */}
      {cardOnFile && (
        <div className="space-y-2">
          <p className="text-slate-300 text-sm font-medium">Payment method</p>
          <button
            type="button"
            onClick={() => setUseNewCard(false)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-sm transition-colors ${
              !useNewCard
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-slate-700 bg-slate-800 hover:border-slate-600'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                !useNewCard ? 'border-amber-500' : 'border-slate-500'
              }`}
            >
              {!useNewCard && <div className="w-2 h-2 rounded-full bg-amber-500" />}
            </div>
            <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-slate-300">
              {cardOnFile.brand
                ? cardOnFile.brand.charAt(0).toUpperCase() + cardOnFile.brand.slice(1)
                : 'Card'}{' '}
              ••••{cardOnFile.lastFour}
            </span>
            <span className="ml-auto text-emerald-400 text-xs font-medium">On file</span>
          </button>
          <button
            type="button"
            onClick={() => setUseNewCard(true)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-sm transition-colors ${
              useNewCard
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-slate-700 bg-slate-800 hover:border-slate-600'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                useNewCard ? 'border-amber-500' : 'border-slate-500'
              }`}
            >
              {useNewCard && <div className="w-2 h-2 rounded-full bg-amber-500" />}
            </div>
            <span className="text-slate-300">New card</span>
          </button>
        </div>
      )}

      {/* Card element — shown when entering new card */}
      {useNewCard && (
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
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="button"
        onClick={handleCharge}
        disabled={loading || !stripe}
        className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold py-3.5 rounded-xl transition-colors text-lg"
      >
        {loading ? 'Processing…' : `Charge ${fmt(totalChargeCents)}`}
      </button>
    </div>
  );
}

export default function CheckoutForm({
  appointmentId,
  customerName,
  serviceName,
  barberName,
  subtotalCents,
  balanceDueCents,
  tippingEnabled,
  cardOnFile,
}: {
  appointmentId: string;
  customerName: string;
  serviceName: string;
  barberName: string;
  subtotalCents: number;
  balanceDueCents: number;
  tippingEnabled: boolean;
  cardOnFile: CardOnFile;
}) {
  const router = useRouter();
  const [tipPct, setTipPct] = useState<number | 'custom' | null>(null);
  const [customTip, setCustomTip] = useState('');
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const tipCents =
    tipPct === null
      ? 0
      : tipPct === 'custom'
        ? Math.round((parseFloat(customTip) || 0) * 100)
        : Math.round((subtotalCents * tipPct) / 100);

  const totalChargeCents = balanceDueCents + tipCents;

  const handleSuccess = () => {
    setDone(true);
    setTimeout(() => {
      router.push(`/app/appointments/${appointmentId}`);
      router.refresh();
    }, 1200);
  };

  const handleCompleteNoCharge = async () => {
    setCompleting(true);
    setError(null);
    try {
      await completeWithoutPaymentAction(appointmentId);
      handleSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete');
      setCompleting(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-white text-lg font-semibold">Done!</p>
        <p className="text-slate-400 text-sm">Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Service summary */}
      <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700 space-y-1">
        <p className="text-white font-semibold">{serviceName}</p>
        <p className="text-slate-400 text-sm">{barberName} · {customerName}</p>
        <div className="flex justify-between text-sm pt-1">
          <span className="text-slate-400">Service total</span>
          <span className="text-white">{fmt(subtotalCents)}</span>
        </div>
        {balanceDueCents < subtotalCents && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Deposit paid</span>
            <span className="text-emerald-400">−{fmt(subtotalCents - balanceDueCents)}</span>
          </div>
        )}
        {tipCents > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Tip</span>
            <span className="text-white">{fmt(tipCents)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-white pt-2 border-t border-slate-700">
          <span>Balance due</span>
          <span className="text-xl">{fmt(totalChargeCents)}</span>
        </div>
      </div>

      {/* Tip selection */}
      {tippingEnabled && (
        <div>
          <p className="text-slate-300 text-sm font-medium mb-3">Add a tip?</p>
          <div className="grid grid-cols-3 gap-2">
            {TIP_PRESETS.map((p) => (
              <button
                key={p.pct}
                type="button"
                onClick={() => { setTipPct(p.pct); setCustomTip(''); }}
                className={`py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                  tipPct === p.pct
                    ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
                }`}
              >
                {p.label}
                <span className="block text-xs font-normal text-slate-400 mt-0.5">
                  {fmt(Math.round((subtotalCents * p.pct) / 100))}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setTipPct('custom')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                tipPct === 'custom'
                  ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
              }`}
            >
              Custom
            </button>
            <button
              type="button"
              onClick={() => { setTipPct(null); setCustomTip(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                tipPct === null
                  ? 'border-slate-600 bg-slate-700 text-slate-300'
                  : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
              }`}
            >
              No tip
            </button>
          </div>
          {tipPct === 'custom' && (
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={customTip}
                onChange={(e) => setCustomTip(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-7 pr-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                autoFocus
              />
            </div>
          )}
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Payment */}
      {totalChargeCents >= 50 ? (
        stripePromise ? (
          <Elements stripe={stripePromise} options={{ appearance: { theme: 'night' } }}>
            <PaymentForm
              appointmentId={appointmentId}
              totalChargeCents={totalChargeCents}
              tipCents={tipCents}
              cardOnFile={cardOnFile}
              onSuccess={handleSuccess}
            />
          </Elements>
        ) : (
          <p className="text-red-400 text-sm">Stripe is not configured.</p>
        )
      ) : (
        <button
          type="button"
          onClick={handleCompleteNoCharge}
          disabled={completing}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors text-lg"
        >
          {completing ? 'Completing…' : 'Complete appointment'}
        </button>
      )}
    </div>
  );
}
