'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Smartphone } from 'lucide-react';
import {
  checkoutAppointmentAction,
  createCheckoutPaymentIntentAction,
} from './actions';

const stripePromise =
  typeof window !== 'undefined' && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    : null;

const TIP_OPTIONS = [
  { label: '15%', value: 15 },
  { label: '20%', value: 20 },
  { label: '25%', value: 25 },
];

type CardOnFile = { brand: string; last4: string; id: string } | null;

type AppointmentData = {
  id: string;
  subtotal: number | null;
  totalAmount: number | null;
  appointmentServices: { serviceNameSnapshot: string; priceSnapshot: number }[];
  customer: { firstName: string; lastName: string };
  barberProfile: { displayName: string };
};

function NewCardForm({
  appointmentId,
  totalCents,
  tipCents,
  onSuccess,
}: {
  appointmentId: string;
  totalCents: number;
  tipCents: number;
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
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (submitError) {
        setError(submitError.message ?? 'Payment failed');
        return;
      }

      if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
        // Tell server to complete the appointment
        await checkoutAppointmentAction({
          appointmentId,
          tipCents,
          paymentMethodId: paymentIntent.payment_method as string | undefined ?? undefined,
        });
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
        className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold py-3 rounded-xl transition-colors text-lg"
      >
        {loading
          ? 'Processing…'
          : `Charge $${(totalCents / 100).toFixed(2)}`}
      </button>
    </form>
  );
}

function NewCardWrapper({
  appointmentId,
  totalCents,
  tipCents,
  onSuccess,
}: {
  appointmentId: string;
  totalCents: number;
  tipCents: number;
  onSuccess: () => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (totalCents < 50) return;
    createCheckoutPaymentIntentAction(appointmentId, totalCents)
      .then(({ clientSecret: cs }) => setClientSecret(cs))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load payment'));
  }, [appointmentId, totalCents]);

  if (error) return <p className="text-red-400 text-sm">{error}</p>;
  if (!clientSecret || !stripePromise) {
    return <p className="text-slate-400 text-sm">Loading payment form…</p>;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret, appearance: { theme: 'night' } }}
    >
      <NewCardForm
        appointmentId={appointmentId}
        totalCents={totalCents}
        tipCents={tipCents}
        onSuccess={onSuccess}
      />
    </Elements>
  );
}

export default function CheckoutForm({
  appointment,
  cardOnFile,
  tippingEnabled,
}: {
  appointment: AppointmentData;
  cardOnFile: CardOnFile;
  tippingEnabled: boolean;
}) {
  const router = useRouter();
  const subtotalCents = Math.round(Number(appointment.subtotal ?? appointment.totalAmount ?? 0) * 100);

  const [tipType, setTipType] = useState<number | 'custom' | 'skip'>('skip');
  const [customTip, setCustomTip] = useState('');
  const [paymentMode, setPaymentMode] = useState<'card-on-file' | 'new-card'>(
    cardOnFile ? 'card-on-file' : 'new-card',
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const tipCents: number = (() => {
    if (!tippingEnabled || tipType === 'skip') return 0;
    if (tipType === 'custom') {
      const val = parseFloat(customTip);
      return isNaN(val) ? 0 : Math.round(val * 100);
    }
    return Math.round((subtotalCents * tipType) / 100);
  })();

  const totalCents = subtotalCents + tipCents;
  const serviceName =
    appointment.appointmentServices[0]?.serviceNameSnapshot ?? 'Service';

  const handleCardOnFileCharge = async () => {
    setLoading(true);
    setError(null);
    try {
      await checkoutAppointmentAction({ appointmentId: appointment.id, tipCents });
      setSuccess(true);
      setTimeout(() => router.push(`/app/appointments/${appointment.id}`), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Charge failed');
    } finally {
      setLoading(false);
    }
  };

  const handleNewCardSuccess = () => {
    setSuccess(true);
    setTimeout(() => router.push(`/app/appointments/${appointment.id}`), 1500);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-white text-lg font-semibold">Payment complete!</p>
        <p className="text-slate-400 text-sm">Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Service Summary */}
      <div className="bg-slate-800/60 rounded-xl p-4 space-y-1 border border-slate-700">
        <p className="text-white font-semibold">{serviceName}</p>
        <p className="text-slate-400 text-sm">
          {appointment.barberProfile.displayName} ·{' '}
          {appointment.customer.firstName} {appointment.customer.lastName}
        </p>
        <p className="text-slate-300 text-sm">
          Subtotal:{' '}
          <span className="text-white font-medium">${(subtotalCents / 100).toFixed(2)}</span>
        </p>
      </div>

      {/* Tip Selection */}
      {tippingEnabled && (
        <div>
          <p className="text-slate-300 text-sm font-medium mb-3">Add a tip?</p>
          <div className="grid grid-cols-5 gap-2">
            {TIP_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTipType(opt.value)}
                className={`py-2.5 rounded-lg text-sm font-semibold transition-colors border ${
                  tipType === opt.value
                    ? 'bg-amber-500 border-amber-500 text-slate-950'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-amber-500/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setTipType('custom')}
              className={`py-2.5 rounded-lg text-sm font-semibold transition-colors border ${
                tipType === 'custom'
                  ? 'bg-amber-500 border-amber-500 text-slate-950'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-amber-500/50'
              }`}
            >
              Custom
            </button>
            <button
              type="button"
              onClick={() => setTipType('skip')}
              className={`py-2.5 rounded-lg text-sm font-semibold transition-colors border col-span-5 mt-1 ${
                tipType === 'skip'
                  ? 'bg-slate-700 border-slate-600 text-slate-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              No tip
            </button>
          </div>

          {tipType === 'custom' && (
            <div className="mt-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={customTip}
                  onChange={(e) => setCustomTip(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-7 pr-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Total */}
      <div className="flex items-center justify-between bg-slate-800/40 rounded-xl px-4 py-3 border border-slate-700">
        <span className="text-slate-400">Total</span>
        <div className="text-right">
          <span className="text-white font-bold text-xl">${(totalCents / 100).toFixed(2)}</span>
          {tipCents > 0 && (
            <p className="text-slate-400 text-xs">
              incl. ${(tipCents / 100).toFixed(2)} tip
            </p>
          )}
        </div>
      </div>

      {/* Payment Method Selection */}
      {cardOnFile && (
        <div className="space-y-2">
          <p className="text-slate-300 text-sm font-medium">Payment method</p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setPaymentMode('card-on-file')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                paymentMode === 'card-on-file'
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-600'
              }`}
            >
              <CreditCard className="w-5 h-5 text-slate-400 shrink-0" />
              <span className="text-white text-sm">
                {cardOnFile.brand.charAt(0).toUpperCase() + cardOnFile.brand.slice(1)} ending{' '}
                {cardOnFile.last4}
              </span>
              <span className="ml-auto text-xs text-slate-500">Card on file</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMode('new-card')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                paymentMode === 'new-card'
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-600'
              }`}
            >
              <Smartphone className="w-5 h-5 text-slate-400 shrink-0" />
              <span className="text-white text-sm">New card</span>
            </button>
          </div>
        </div>
      )}

      {/* Charge button or new card form */}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {paymentMode === 'card-on-file' && cardOnFile ? (
        <button
          type="button"
          onClick={handleCardOnFileCharge}
          disabled={loading || totalCents < 50}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold py-3.5 rounded-xl transition-colors text-lg"
        >
          {loading ? 'Charging…' : `Charge $${(totalCents / 100).toFixed(2)}`}
        </button>
      ) : (
        <NewCardWrapper
          appointmentId={appointment.id}
          totalCents={totalCents}
          tipCents={tipCents}
          onSuccess={handleNewCardSuccess}
        />
      )}
    </div>
  );
}
