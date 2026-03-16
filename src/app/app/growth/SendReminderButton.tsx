'use client';

import { useState } from 'react';
import { sendReminderAction } from './actions';

export default function SendReminderButton({ customerId, hasEmail }: { customerId: string; hasEmail: boolean }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await sendReminderAction(customerId);
      setSent(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setLoading(false);
    }
  };

  if (!hasEmail) {
    return <span className="text-slate-500 text-xs">No email</span>;
  }
  if (sent) {
    return <span className="text-slate-500 text-xs">Sent</span>;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="text-xs text-amber-400 hover:text-amber-300 disabled:opacity-50"
    >
      {loading ? 'Sending…' : 'Send reminder'}
    </button>
  );
}
