import { requireShopAccess } from '@/lib/auth';
import { getBarberEarnings } from '@/lib/services/reports';
import { startOfMonth, endOfDay } from 'date-fns';
import ReportsView from './ReportsView';
import { PageHeader } from '@/components/ui/page-header';

export default async function ReportsPage() {
  const { shopId } = await requireShopAccess();
  const now = new Date();
  const from = startOfMonth(now);
  const to = endOfDay(now);
  const earnings = await getBarberEarnings(shopId, from, to);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <PageHeader title="Reports" description="Revenue and earnings breakdown" />
      <ReportsView
        initialEarnings={earnings}
        initialFrom={from.toISOString().slice(0, 10)}
        initialTo={to.toISOString().slice(0, 10)}
      />
    </div>
  );
}
