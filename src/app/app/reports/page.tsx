import { requireShopAccess } from '@/lib/auth';

export default async function ReportsPage() {
  await requireShopAccess();

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Reports</h1>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <p className="text-slate-400">Daily sales, no-shows, and barber leaderboard coming in Phase 2–3.</p>
      </div>
    </div>
  );
}
