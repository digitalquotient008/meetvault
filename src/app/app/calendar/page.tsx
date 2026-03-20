import Link from 'next/link';
import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getAppointmentsForShop } from '@/lib/services/appointment';
import { startOfDayInTz, endOfDayInTz, fmtTime } from '@/lib/format-date';
import { AppointmentActions } from '@/components/dashboard/AppointmentActions';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Badge, statusVariant } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Calendar as CalendarIcon } from 'lucide-react';

export default async function CalendarPage() {
  const { shopId } = await requireShopAccess();
  const shop = await prisma.shop.findUnique({ where: { id: shopId }, select: { timezone: true } });
  const tz = shop?.timezone ?? 'America/New_York';

  const todayStart = startOfDayInTz(tz);
  const todayEnd = endOfDayInTz(tz);
  const appointments = await getAppointmentsForShop(shopId, todayStart, todayEnd);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <PageHeader
        title="Calendar"
        description={`Today's appointments (${appointments.length})`}
      />

      {appointments.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CalendarIcon className="w-6 h-6" />}
            title="No appointments today"
            description="Your schedule is clear. Appointments will appear here as clients book."
          />
        </Card>
      ) : (
        <Card padding="none">
          <div className="divide-y divide-slate-800/50">
            {appointments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-800/20 transition-colors">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span className="text-white font-semibold text-sm w-16 shrink-0">{fmtTime(apt.startDateTime, tz)}</span>
                  <div className="h-8 w-px bg-slate-800 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{apt.customer.firstName} {apt.customer.lastName}</p>
                    <p className="text-slate-500 text-xs truncate">{apt.barberProfile.displayName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={statusVariant(apt.status)} dot>
                    {apt.status.replace('_', ' ')}
                  </Badge>
                  <AppointmentActions appointmentId={apt.id} status={apt.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
