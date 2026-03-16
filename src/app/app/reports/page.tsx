import { requireShopAccess } from '@/lib/auth';
import { getBarberEarnings } from '@/lib/services/reports';
import { startOfMonth, endOfDay, subDays } from 'date-fns';
import ReportsView from './ReportsView';

export default async function ReportsPage() {
  const { shopId } = await requireShopAccess();
  const now = new Date();
  const from = startOfMonth(now);
  const to = endOfDay(now);
  const earnings = await getBarberEarnings(shopId, from, to);

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Reports</h1>
      <ReportsView
        initialEarnings={earnings}
        initialFrom={from.toISOString().slice(0, 10)}
        initialTo={to.toISOString().slice(0, 10)}
      />
    </div>
  );
}
