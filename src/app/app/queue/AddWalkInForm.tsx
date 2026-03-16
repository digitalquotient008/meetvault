'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addWalkInAction } from './actions';

export default function AddWalkInForm() {
  const router = useRouter();
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = guestName.trim();
    if (!name) return;
    setLoading(true);
    try {
      await addWalkInAction(name);
      setGuestName('');
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={guestName}
        onChange={(e) => setGuestName(e.target.value)}
        placeholder="Guest name"
        className="flex-1 max-w-xs rounded-lg bg-slate-800 border border-slate-600 text-white px-3 py-2"
      />
      <button
        type="submit"
        disabled={loading || !guestName.trim()}
        className="px-4 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-500 disabled:opacity-50"
      >
        {loading ? 'Adding…' : 'Add walk-in'}
      </button>
    </form>
  );
}
