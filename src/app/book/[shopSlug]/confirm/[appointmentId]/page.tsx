import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { fmtDateTime } from '@/lib/format-date';

type Props = {
  params: Promise<{ shopSlug: string; appointmentId: string }>;
};

export default async function ConfirmPage({ params }: Props) {
  const { shopSlug, appointmentId } = await params;
  const shop = await prisma.shop.findUnique({ where: { slug: shopSlug } });
  if (!shop) notFound();

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, shopId: shop.id },
    include: {
      customer: true,
      barberProfile: true,
      appointmentServices: true,
      payments: true,
    },
  });
  if (!appointment) notFound();

  const hasDepositPaid = appointment.payments.some(
    (p) => p.type === 'DEPOSIT' && p.status === 'SUCCEEDED'
  );
  const hasFullPaid = appointment.payments.some(
    (p) => (p.type === 'FULL' || p.type === 'DEPOSIT') && p.status === 'SUCCEEDED'
  );
  const showPayDeposit = shop.depositRequired && !hasDepositPaid && !hasFullPaid;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">You&apos;re booked</h1>
        <p className="text-slate-400 mb-6">
          Your appointment at {shop.name} is confirmed.
        </p>
        <div className="bg-slate-800 rounded-lg p-4 text-left space-y-2 text-sm mb-4">
          <p><span className="text-slate-500">Confirmation:</span> <span className="text-amber-400 font-mono">{appointment.confirmationCode}</span></p>
          <p><span className="text-slate-500">When:</span> {fmtDateTime(appointment.startDateTime, shop.timezone)}</p>
          <p><span className="text-slate-500">With:</span> {appointment.barberProfile.displayName}</p>
          <p><span className="text-slate-500">Service:</span> {appointment.appointmentServices[0]?.serviceNameSnapshot ?? '—'}</p>
        </div>
        {showPayDeposit && (
          <Link
            href={`/book/${shop.slug}/pay/${appointmentId}?type=deposit`}
            className="inline-block w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-500 mb-4"
          >
            Pay deposit
          </Link>
        )}
        <Link
          href={`/book/${shop.slug}`}
          className="inline-block text-amber-400 hover:text-amber-300 font-medium"
        >
          Book another →
        </Link>
        <div className="mt-4 pt-4 border-t border-slate-800">
          <Link
            href={`/book/${shop.slug}/cancel/${appointmentId}?code=${appointment.confirmationCode}`}
            className="text-slate-500 hover:text-slate-400 text-sm"
          >
            Need to cancel? Click here
          </Link>
        </div>
      </div>
    </div>
  );
}
