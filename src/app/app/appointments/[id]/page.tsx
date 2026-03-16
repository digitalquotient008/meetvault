import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import RefundButton from './RefundButton';

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

  return (
    <div className="p-6 lg:p-8">
      <Link href="/app/appointments" className="text-sm text-slate-400 hover:text-white mb-4 inline-block">
        ← Appointments
      </Link>
      <h1 className="text-2xl font-bold text-white mb-6">Appointment</h1>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 mb-6">
        <p><span className="text-slate-400">When:</span> {new Date(appointment.startDateTime).toLocaleString()}</p>
        <p><span className="text-slate-400">Customer:</span> {appointment.customer.firstName} {appointment.customer.lastName}</p>
        <p><span className="text-slate-400">Barber:</span> {appointment.barberProfile.displayName}</p>
        <p><span className="text-slate-400">Status:</span> <span className="text-amber-400">{appointment.status}</span></p>
        <p><span className="text-slate-400">Total:</span> ${Number(appointment.totalAmount ?? 0).toFixed(2)}</p>
      </div>
      <h2 className="text-lg font-semibold text-white mb-3">Payments</h2>
      <div className="space-y-2 mb-6">
        {appointment.payments.length === 0 ? (
          <p className="text-slate-500 text-sm">No payments recorded.</p>
        ) : (
          appointment.payments.map((p) => (
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
