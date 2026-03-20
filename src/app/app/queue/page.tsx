import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { listQueueEntries } from '@/lib/services/queue';
import { UserPlus } from 'lucide-react';
import AddWalkInForm from './AddWalkInForm';
import QueueEntryRow from './QueueEntryRow';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, TableHead, TableHeader, TableBody } from '@/components/ui/table';

export default async function QueuePage() {
  const { shopId } = await requireShopAccess();
  const [entries, shop] = await Promise.all([
    listQueueEntries(shopId),
    prisma.shop.findUnique({ where: { id: shopId }, select: { timezone: true } }),
  ]);
  const tz = shop?.timezone ?? 'America/New_York';

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <PageHeader
        title="Walk-in queue"
        description="Manage today's walk-in customers"
        badge={entries.length > 0 ? <Badge>{entries.length} in queue</Badge> : undefined}
      />

      <AddWalkInForm />

      <div className="mt-6">
        {entries.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl">
            <EmptyState
              icon={<UserPlus className="w-6 h-6" />}
              title="Queue is empty"
              description="Add a walk-in customer above to get started."
            />
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableHeader>Name</TableHeader>
              <TableHeader>Arrived</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableHead>
            <tbody className="divide-y divide-slate-800/50">
              {entries.map((entry) => (
                <QueueEntryRow key={entry.id} entry={entry} timezone={tz} />
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}
