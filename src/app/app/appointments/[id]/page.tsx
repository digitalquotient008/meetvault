import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { fmtDateTime } from '@/lib/format-date';
import RefundButton from './RefundButton';
import NoShowChargeButton from './NoShowChargeButton';
import CancelAppointmentButton from './CancelAppointmentButton';
import { CreditCard } from 'lucide-react';

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
    <div className="p-6 lg:p-8 max-w-3xl">
      <Link href="/app/appointments" className="text-sm text-slate-400 hover:text-white mb-4 inline-block">
        ← Appointments
      </Link>
      <h1 className="text-2xl font-bold text-white mb-6">Appointment</h1>

      {/* Details */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 mb-6">
        <p><span className="text-slate-400">When:</span> <span className="text-white">{fmtDateTime(appointment.startDateTime, tz)}</span></p>
        <p><span className="text-slate-400">Customer:</span> <span className="text-white">{customer.firstName} {customer.lastName}</span></p>
        <p><span className="text-slate-400">Barber:</span> <span className="text-white">{appointment.barberProfile.displayName}</span></p>
        <p>
          <span className="text-slate-400">Status:</span>{' '}
          <span className={appointment.status === 'NO_SHOW' ? 'text-red-400 font-semibold' : 'text-amber-400'}>
            {appointment.status.replace('_', ' ')}
          </span>
        </p>
        <p><span className="text-slate-400">Total:</span> <span className="text-white">${Number(appointment.totalAmount ?? 0).toFixed(2)}</span></p>
        {canCancel && (
          <div className="pt-2 border-t border-slate-800">
            <CancelAppointmentButton appointmentId={appointment.id} totalPaid={totalPaid} />
          </div>
        )}
      </div>

      {/* Card on file */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-slate-400" />
          Card on file
        </h2>
        {hasCardOnFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-6 bg-slate-700 rounded flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-slate-300" />
              </div>
              <span className="text-white text-sm">
                {customer.cardBrand
                  ? customer.cardBrand.charAt(0).toUpperCase() + customer.cardBrand.slice(1)
                  : 'Card'}{' '}
                •••• {customer.cardLastFour}
              </span>
            </div>
            <span className="text-emerald-400 text-xs font-medium">On file</span>
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No card on file for this customer.</p>
        )}

        {/* No-show fee charge section */}
        {appointment.status === 'NO_SHOW' && noShowFeeAmount && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            {noShowFeeCharged ? (
              <p className="text-emerald-400 text-sm font-medium">No-show fee already charged.</p>
            ) : hasCardOnFile ? (
              <NoShowChargeButton
                appointmentId={appointment.id}
                feeAmount={noShowFeeAmount}
              />
            ) : (
              <p className="text-slate-500 text-sm">
                No card on file — cannot charge no-show fee of ${noShowFeeAmount.toFixed(2)}.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Payments */}
      <h2 className="text-lg font-semibold text-white mb-3">Payments</h2>
      <div className="space-y-2 mb-6">
        {appointment.payments.length === 0 ? (
          <p className="text-slate-500 text-sm">No payments recorded.</p>
        ) : (
          appointment.payments.map((p: typeof appointment.payments[number]) => (
            <div
              key={p.id}
              className="flex items-center justify-between bg-slate-800 rounded-lg px-4 py-3 border border-slate-700"
            >
              <div>
                <span className="text-white">{p.type}</span>
                <span className="text-slate-400 ml-2">${Number(p.amount).toFixed(2)}</span>
                <span className={`ml-2 text-xs ${p.status === 'SUCCEEDED' ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {p.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {p.receiptUrl && (
                  <a
                    href={p.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:text-amber-300 text-sm"
                  >
                    Receipt
                  </a>
                )}
                {p.status === 'SUCCEEDED' && p.type !== 'TIP' && (
                  <RefundButton paymentId={p.id} amount={Number(p.amount)} />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
