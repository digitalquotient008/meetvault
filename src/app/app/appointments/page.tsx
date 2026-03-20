import Link from 'next/link';
import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AppointmentActions } from '@/components/dashboard/AppointmentActions';
import { fmtDateTime } from '@/lib/format-date';
import { Badge, statusVariant } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { CalendarDays } from 'lucide-react';

const PAGE_SIZE = 50;

function paymentBadge(apt: { payments: { status: string; amount: unknown; type: string }[]; totalAmount: unknown }) {
  const total = Number(apt.totalAmount ?? 0);
  const paid = apt.payments
    .filter((p) => p.status === 'SUCCEEDED')
    .reduce((s, p) => s + Number(p.amount), 0);
  if (paid >= total - 0.01) return { label: 'Paid', variant: 'success' as const };
  if (apt.payments.some((p) => p.status === 'SUCCEEDED' && p.type === 'DEPOSIT')) return { label: 'Deposit', variant: 'warning' as const };
  return { label: 'Unpaid', variant: 'neutral' as const };
}

type Props = { searchParams: Promise<{ page?: string }> };

export default async function AppointmentsPage({ searchParams }: Props) {
  const { shopId } = await requireShopAccess();
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const shop = await prisma.shop.findUnique({ where: { id: shopId }, select: { timezone: true } });
  const tz = shop?.timezone ?? 'America/New_York';

  const [total, appointments] = await Promise.all([
    prisma.appointment.count({ where: { shopId } }),
    prisma.appointment.findMany({
      where: { shopId },
      take: PAGE_SIZE,
      skip,
      orderBy: { startDateTime: 'desc' },
      include: { customer: true, barberProfile: true, payments: true },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Appointments"
        description={`${total} total`}
      />

      {appointments.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="w-6 h-6" />}
          title="No appointments yet"
          description="Appointments will appear here once clients start booking."
        />
      ) : (
        <Table>
          <TableHead>
            <TableHeader>Date / Time</TableHeader>
            <TableHeader>Customer</TableHeader>
            <TableHeader className="hidden md:table-cell">Barber</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader className="hidden sm:table-cell">Payment</TableHeader>
            <TableHeader>Actions</TableHeader>
            <TableHeader className="w-16" />
          </TableHead>
          <TableBody>
            {appointments.map((apt) => {
              const badge = paymentBadge(apt);
              return (
                <TableRow key={apt.id}>
                  <TableCell className="text-white font-medium whitespace-nowrap">{fmtDateTime(apt.startDateTime, tz)}</TableCell>
                  <TableCell className="text-white">{apt.customer.firstName} {apt.customer.lastName}</TableCell>
                  <TableCell className="hidden md:table-cell">{apt.barberProfile.displayName}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(apt.status)} dot>
                      {apt.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <AppointmentActions appointmentId={apt.id} status={apt.status} />
                  </TableCell>
                  <TableCell>
                    <Link href={`/app/appointments/${apt.id}`} className="text-amber-400 hover:text-amber-300 text-xs font-medium">
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <p className="text-slate-500 text-sm">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Button variant="secondary" size="sm" href={`/app/appointments?page=${page - 1}`}>
                Previous
              </Button>
            )}
            {page < totalPages && (
              <Button variant="secondary" size="sm" href={`/app/appointments?page=${page + 1}`}>
                Next
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
