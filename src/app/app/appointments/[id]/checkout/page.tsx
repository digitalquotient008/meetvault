import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getCustomerDefaultPaymentMethod } from '@/lib/services/customer-stripe';
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
        payments: true,
      },
    }),
    prisma.shop.findUnique({
      where: { id: shopId },
      select: {
        timezone: true,
        stripeConnectAccountId: true,
        stripeConnectOnboarded: true,
        tippingEnabled: true,
      },
    }),
  ]);

  if (!appointment) notFound();

  // Already done
  if (['COMPLETED', 'CANCELED', 'NO_SHOW'].includes(appointment.status)) {
    redirect(`/app/appointments/${id}`);
  }

  // Connect not set up
  if (!shop?.stripeConnectAccountId || !shop.stripeConnectOnboarded) {
    redirect('/app/payments?setup=required');
  }

  const tz = shop.timezone ?? 'America/New_York';

  // Card on file
  let cardOnFile: { brand: string; last4: string; id: string } | null = null;
  if (appointment.customer.stripeCustomerId) {
    const pm = await getCustomerDefaultPaymentMethod(
      appointment.customer.stripeCustomerId,
      shop.stripeConnectAccountId,
    );
    if (pm?.card) {
      cardOnFile = { brand: pm.card.brand, last4: pm.card.last4, id: pm.id };
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link
            href={`/app/appointments/${id}`}
            className="text-sm text-slate-400 hover:text-white"
          >
            ← Back to appointment
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white">Checkout</h1>
            <p className="text-slate-400 text-sm mt-1">
              {fmtDateTime(appointment.startDateTime, tz)}
            </p>
          </div>

          <CheckoutForm
            appointment={{
              id: appointment.id,
              subtotal: appointment.subtotal ? Number(appointment.subtotal) : null,
              totalAmount: appointment.totalAmount ? Number(appointment.totalAmount) : null,
              appointmentServices: appointment.appointmentServices.map((s) => ({
                serviceNameSnapshot: s.serviceNameSnapshot,
                priceSnapshot: Number(s.priceSnapshot),
              })),
              customer: {
                firstName: appointment.customer.firstName,
                lastName: appointment.customer.lastName,
              },
              barberProfile: { displayName: appointment.barberProfile.displayName },
            }}
            cardOnFile={cardOnFile}
            tippingEnabled={shop.tippingEnabled}
          />
        </div>
      </div>
    </div>
  );
}
