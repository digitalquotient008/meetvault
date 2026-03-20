import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { listWaitlistEntries } from '@/lib/services/waitlist';
import { fmtDateTime } from '@/lib/format-date';
import { ClipboardList } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';

export default async function WaitlistPage() {
  const { shopId } = await requireShopAccess();
  const [entries, shop] = await Promise.all([
    listWaitlistEntries(shopId),
    prisma.shop.findUnique({ where: { id: shopId }, select: { timezone: true } }),
  ]);
  const tz = shop?.timezone ?? 'America/New_York';

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <PageHeader
        title="Waitlist"
        description="Customers waiting for availability"
        badge={entries.length > 0 ? <Badge>{entries.length} waiting</Badge> : undefined}
      />

      {entries.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl">
          <EmptyState
            icon={<ClipboardList className="w-6 h-6" />}
            title="No one on the waitlist"
            description="Customers who request to be waitlisted will appear here."
          />
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableHeader>Customer</TableHeader>
            <TableHeader className="hidden sm:table-cell">Contact</TableHeader>
            <TableHeader className="hidden md:table-cell">Preferred</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader className="hidden sm:table-cell">Added</TableHeader>
          </TableHead>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-white font-medium">
                  {entry.customer.firstName} {entry.customer.lastName}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {entry.customer.email ?? entry.customer.phone ?? '—'}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {entry.preferredServiceId ? 'Service' : '—'}{entry.preferredBarberProfileId ? ' · Barber' : ''}
                </TableCell>
                <TableCell>
                  <Badge variant="warning">{entry.status}</Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-slate-500">
                  {fmtDateTime(entry.createdAt, tz)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
