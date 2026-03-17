import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { fmtDateTime } from '@/lib/format-date';
import CheckoutForm from './CheckoutForm';

type Props = { params: Promise<{ id: string }> };

export default async function CheckoutPage({ params }: Props) {
  const { shopId } = await requireShopAccess();
  const { id } = await params;

  const [appointment, shop] = await Promise.all([
    prisma.appointment.findFirst({
      where: { id, shopId },
      include: {
        customer: true,
        barberProfile: true,
        appointmentServices: true,
        payments: { where: { status: 'SUCCEEDED', NOT: { type: 'TIP' } } },
      },
    }),
    prisma.shop.findUnique({
      where: { id: shopId },
      select: { timezone: true, tippingEnabled: true },
    }),
  ]);

  if (!appointment) notFound();

  if (['COMPLETED', 'CANCELED', 'NO_SHOW'].includes(appointment.status)) {
    redirect(`/app/appointments/${id}`);
  }

  const tz = shop?.timezone ?? 'America/New_York';

  // Calculate balance still owed after any deposits
  const subtotalCents = Math.round(Number(appointment.totalAmount ?? 0) * 100);
  const depositPaidCents = appointment.payments.reduce(
    (s, p) => s + Math.round(Number(p.amount) * 100),
    0,
  );
  const balanceDueCents = Math.max(0, subtotalCents - depositPaidCents);

  // Card on file is stored on the PLATFORM account (from SetupIntent at booking)
  const cardOnFile =
    appointment.customer.stripePaymentMethodId
      ? {
          paymentMethodId: appointment.customer.stripePaymentMethodId,
          brand: appointment.customer.cardBrand,
          lastFour: appointment.customer.cardLastFour,
        }
      : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href={`/app/appointments/${id}`} className="text-sm text-slate-400 hover:text-white">
            ← Back to appointment
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white">Checkout</h1>
            <p className="text-slate-400 text-sm mt-1">{fmtDateTime(appointment.startDateTime, tz)}</p>
          </div>

          <CheckoutForm
            appointmentId={id}
            customerName={`${appointment.customer.firstName} ${appointment.customer.lastName}`}
            serviceName={appointment.appointmentServices[0]?.serviceNameSnapshot ?? 'Service'}
            barberName={appointment.barberProfile.displayName}
            subtotalCents={subtotalCents}
            balanceDueCents={balanceDueCents}
            tippingEnabled={shop?.tippingEnabled ?? true}
            cardOnFile={cardOnFile}
          />
        </div>
      </div>
    </div>
  );
}
