import Link from 'next/link';
import { requireShopAccess } from '@/lib/auth';
import { getDueForRebooking, getDormantCustomers } from '@/lib/services/growth';
import { getShopById } from '@/lib/services/shop';
import { fmtDate } from '@/lib/format-date';
import { TrendingUp, Users } from 'lucide-react';
import SendReminderButton from './SendReminderButton';
import { PageHeader } from '@/components/ui/page-header';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';

export default async function GrowthPage() {
  const { shopId } = await requireShopAccess();
  const [shop, dueForRebooking, dormant] = await Promise.all([
    getShopById(shopId),
    getDueForRebooking(shopId),
    getDormantCustomers(shopId, 60),
  ]);
  const shopSlug = shop?.slug ?? '';
  const tz = shop?.timezone ?? 'America/New_York';

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <PageHeader
        title="Growth"
        description="Re-engage clients and reduce churn"
      />

      <section className="mb-10">
        <div className="flex items-center gap-2.5 mb-1">
          <h2 className="text-lg font-semibold text-white">Due for rebooking</h2>
          {dueForRebooking.length > 0 && <Badge variant="warning">{dueForRebooking.length}</Badge>}
        </div>
        <p className="text-slate-500 text-sm mb-4">
          Customers with a suggested return date in the next 7 days or overdue.
        </p>

        {dueForRebooking.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl">
            <EmptyState
              icon={<TrendingUp className="w-6 h-6" />}
              title="All caught up"
              description="No customers due for rebooking in the next 7 days."
            />
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableHeader>Customer</TableHeader>
              <TableHeader className="hidden sm:table-cell">Suggested return</TableHeader>
              <TableHeader className="hidden md:table-cell">Last visit</TableHeader>
              <TableHeader className="w-20" />
            </TableHead>
            <TableBody>
              {dueForRebooking.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/app/customers/${c.id}`} className="font-medium text-white hover:text-amber-400 transition-colors">
                      {c.firstName} {c.lastName}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {c.nextSuggestedAt ? fmtDate(c.nextSuggestedAt, tz) : '—'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {c.lastVisitAt ? fmtDate(c.lastVisitAt, tz) : '—'}
                  </TableCell>
                  <TableCell>
                    {shopSlug && (
                      <Link href={`/book/${shopSlug}`} className="text-xs text-amber-400 hover:text-amber-300 font-medium">
                        Book
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2.5 mb-1">
          <h2 className="text-lg font-semibold text-white">Dormant clients</h2>
          {dormant.length > 0 && <Badge variant="neutral">{dormant.length}</Badge>}
        </div>
        <p className="text-slate-500 text-sm mb-4">
          Customers who haven&apos;t visited in 60+ days. Send a win-back reminder.
        </p>

        {dormant.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl">
            <EmptyState
              icon={<Users className="w-6 h-6" />}
              title="No dormant clients"
              description="No clients in this segment — great retention!"
            />
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableHeader>Customer</TableHeader>
              <TableHeader className="hidden sm:table-cell">Contact</TableHeader>
              <TableHeader className="hidden md:table-cell">Last visit</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableHead>
            <TableBody>
              {dormant.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/app/customers/${c.id}`} className="font-medium text-white hover:text-amber-400 transition-colors">
                      {c.firstName} {c.lastName}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{c.email ?? c.phone ?? '—'}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {c.lastVisitAt ? fmtDate(c.lastVisitAt, tz) : '—'}
                  </TableCell>
                  <TableCell>
                    <SendReminderButton customerId={c.id} hasEmail={!!c.email} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
