'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { cancelAppointmentAsCustomerAction } from './actions';
import type { RefundPreview } from '@/lib/services/cancellation';

export default function CancelConfirmClient({
  appointmentId,
  confirmationCode,
  shopName,
  preview,
  appointmentSummary,
}: {
  appointmentId: string;
  confirmationCode: string;
  shopName: string;
  preview: RefundPreview;
  appointmentSummary: string; // e.g. "Mon Jan 6 at 2:00 PM · Fade Cut · John"
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RefundPreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await cancelAppointmentAsCustomerAction(appointmentId, confirmationCode);
      setResult(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancellation failed');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
          <CheckCircle className="w-7 h-7 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Appointment canceled</h2>
        <p className="text-slate-400 text-sm">{result.reason}</p>
        {result.refundAmount > 0 && (
          <p className="text-emerald-400 text-sm font-medium">
            A refund of ${result.refundAmount.toFixed(2)} will appear on your card in 5–10 business days.
          </p>
        )}
        <a href={`/book/${encodeURIComponent(shopName)}`} className="inline-block text-amber-400 hover:text-amber-300 text-sm mt-2">
          Book again →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Cancel appointment</h2>
        <p className="text-slate-400 text-sm">{appointmentSummary}</p>
      </div>

      {/* Refund preview */}
      <div className={`rounded-xl p-4 border space-y-1 ${
        preview.withinWindow
          ? 'bg-red-500/10 border-red-500/20'
          : 'bg-emerald-500/10 border-emerald-500/20'
      }`}>
        {preview.withinWindow ? (
          <div className="flex gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm text-red-200/80">{preview.reason}</div>
          </div>
        ) : (
          <div className="flex gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-200/80">{preview.reason}</div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex gap-2 text-red-400 text-sm">
          <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
        >
          Keep appointment
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors"
        >
          {loading ? 'Canceling…' : 'Yes, cancel'}
        </button>
      </div>
    </div>
  );
}
