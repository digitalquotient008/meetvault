import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { fmtDateTime } from '@/lib/format-date';
import RefundButton from './RefundButton';
import NoShowChargeButton from './NoShowChargeButton';
import CancelAppointmentButton from './CancelAppointmentButton';
import { CreditCard } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge, statusVariant } from '@/components/ui/badge';

const CANCELABLE_STATUSES = ['PENDING', 'CONFIRMED', 'IN_PROGRESS'];

type Props = { params: Promise<{ id: string }> };

export default async function AppointmentDetailPage({ params }: Props) {
  const { shopId } = await requireShopAccess();
  const { id } = await params;
  const appointment = await prisma.appointment.findFirst({
    where: { id, shopId },
    include: {
      customer: true,
      barberProfile: true,
      appointmentServices: true,
      payments: true,
    },
  });
  if (!appointment) notFound();

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { timezone: true, noShowFeeAmount: true },
  });
  const tz = shop?.timezone ?? 'America/New_York';

  const { customer } = appointment;
  const hasCardOnFile = Boolean(customer.stripePaymentMethodId);
  const totalPaid = appointment.payments
    .filter((p) => p.status === 'SUCCEEDED' && p.type !== 'TIP')
    .reduce((s, p) => s + Number(p.amount), 0);
  const canCancel = CANCELABLE_STATUSES.includes(appointment.status);
  const noShowFeeAmount = shop?.noShowFeeAmount ? Number(shop.noShowFeeAmount) : null;
  const noShowFeeCharged = appointment.noShowFeeCharged;

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <Link href="/app/appointments" className="text-sm text-slate-400 hover:text-white mb-4 inline-block transition-colors">
        ← Appointments
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-white">Appointment</h1>
        <Badge variant={statusVariant(appointment.status)} dot>
          {appointment.status.replace('_', ' ')}
        </Badge>
      </div>

      {/* Details */}
      <Card className="mb-6">
        <div className="space-y-3">
          {[
            { label: 'When', value: fmtDateTime(appointment.startDateTime, tz) },
            { label: 'Customer', value: `${customer.firstName} ${customer.lastName}` },
            { label: 'Barber', value: appointment.barberProfile.displayName },
            { label: 'Service', value: appointment.appointmentServices[0]?.serviceNameSnapshot ?? '—' },
            { label: 'Total', value: `$${Number(appointment.totalAmount ?? 0).toFixed(2)}` },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-1">
              <span className="text-slate-500 text-sm">{label}</span>
              <span className="text-white text-sm font-medium">{value}</span>
            </div>
          ))}
        </div>
        {canCancel && (
          <div className="pt-4 mt-4 border-t border-slate-800/50">
            <CancelAppointmentButton appointmentId={appointment.id} totalPaid={totalPaid} />
          </div>
        )}
      </Card>

      {/* Card on file */}
      <Card className="mb-6">
        <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-slate-500" />
          Card on file
        </h2>
        {hasCardOnFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-6 bg-slate-800 rounded flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-slate-400" />
              </div>
              <span className="text-white text-sm">
                {customer.cardBrand
                  ? customer.cardBrand.charAt(0).toUpperCase() + customer.cardBrand.slice(1)
                  : 'Card'}{' '}
                •••• {customer.cardLastFour}
              </span>
            </div>
            <Badge variant="success" dot>On file</Badge>
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No card on file for this customer.</p>
        )}

        {appointment.status === 'NO_SHOW' && noShowFeeAmount && (
          <div className="mt-4 pt-4 border-t border-slate-800/50">
            {noShowFeeCharged ? (
              <Badge variant="success" dot>No-show fee charged</Badge>
            ) : hasCardOnFile ? (
              <NoShowChargeButton appointmentId={appointment.id} feeAmount={noShowFeeAmount} />
            ) : (
              <p className="text-slate-500 text-sm">
                No card on file — cannot charge no-show fee of ${noShowFeeAmount.toFixed(2)}.
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Payments */}
      <h2 className="text-base font-semibold text-white mb-3">Payments</h2>
      {appointment.payments.length === 0 ? (
        <p className="text-slate-500 text-sm">No payments recorded.</p>
      ) : (
        <div className="space-y-2">
          {appointment.payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4">
              <div className="flex items-center gap-3">
                <Badge variant={p.status === 'SUCCEEDED' ? 'success' : p.status === 'FAILED' ? 'danger' : 'neutral'}>
                  {p.type}
                </Badge>
                <span className="text-white font-medium text-sm">${Number(p.amount).toFixed(2)}</span>
                <Badge variant={p.status === 'SUCCEEDED' ? 'success' : 'neutral'} dot>
                  {p.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {p.receiptUrl && (
                  <a href={p.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 text-xs font-medium">
                    Receipt
                  </a>
                )}
                {p.status === 'SUCCEEDED' && p.type !== 'TIP' && (
                  <RefundButton paymentId={p.id} amount={Number(p.amount)} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
