'use client';

import { useState } from 'react';
import { getBarberEarningsAction, getBarberEarningsCsvAction } from './actions';
import type { BarberEarningRow } from '@/lib/services/reports';
import { startOfMonth, endOfDay, subDays } from 'date-fns';

type Props = {
  initialEarnings: BarberEarningRow[];
  initialFrom: string;
  initialTo: string;
};

export default function ReportsView({ initialEarnings, initialFrom, initialTo }: Props) {
  const [earnings, setEarnings] = useState<BarberEarningRow[]>(initialEarnings);
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const fromDate = new Date(from + 'T00:00:00');
      const toDate = endOfDay(new Date(to + 'T00:00:00'));
      const rows = await getBarberEarningsAction(fromDate, toDate);
      setEarnings(rows);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const setThisMonth = () => {
    const now = new Date();
    setFrom(startOfMonth(now).toISOString().slice(0, 10));
    setTo(endOfDay(now).toISOString().slice(0, 10));
  };

  const setLast30 = () => {
    const now = new Date();
    setFrom(subDays(now, 30).toISOString().slice(0, 10));
    setTo(now.toISOString().slice(0, 10));
  };

  const exportCsv = async () => {
    try {
      const fromDate = new Date(from + 'T00:00:00');
      const toDate = endOfDay(new Date(to + 'T00:00:00'));
      const csv = await getBarberEarningsCsvAction(fromDate, toDate);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `barber-earnings-${from}-${to}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Export failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={setThisMonth}
          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-sm hover:bg-slate-700"
        >
          This month
        </button>
        <button
          type="button"
          onClick={setLast30}
          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-sm hover:bg-slate-700"
        >
          Last 30 days
        </button>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="rounded bg-slate-800 border border-slate-600 text-white px-2 py-1.5 text-sm"
        />
        <span className="text-slate-500">–</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="rounded bg-slate-800 border border-slate-600 text-white px-2 py-1.5 text-sm"
        />
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-sm hover:bg-amber-500 disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Apply'}
        </button>
        <button
          type="button"
          onClick={exportCsv}
          className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 text-sm hover:bg-slate-800"
        >
          Export CSV
        </button>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-slate-400 text-left">
            <tr>
              <th className="p-3">Barber</th>
              <th className="p-3">Completed</th>
              <th className="p-3">Total earnings</th>
            </tr>
          </thead>
          <tbody>
            {earnings.map((row) => (
              <tr key={row.barberProfileId} className="border-t border-slate-800">
                <td className="p-3 text-white">{row.barberName}</td>
                <td className="p-3 text-slate-300">{row.completedCount}</td>
                <td className="p-3 text-amber-400">${row.totalEarnings.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {earnings.length === 0 && (
          <p className="p-6 text-slate-500">No completed appointments in this period.</p>
        )}
      </div>
    </div>
  );
}
