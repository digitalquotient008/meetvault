'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addCustomerNoteAction } from '@/app/app/actions';

export default function AddCustomerNoteForm({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      await addCustomerNoteAction(customerId, trimmed);
      setContent('');
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a note…"
        className="flex-1 rounded-lg bg-slate-800 border border-slate-600 text-white px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-500 disabled:opacity-50"
      >
        {loading ? 'Adding…' : 'Add'}
      </button>
    </form>
  );
}
