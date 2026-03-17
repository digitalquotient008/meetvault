'use server';

import { createOrFindCustomer } from '@/lib/services/customer';
import { createAppointment } from '@/lib/services/appointment';
import { createPaymentIntentForAppointment } from '@/lib/services/payments';
import { addWaitlistEntry } from '@/lib/services/waitlist';
import { saveCardFromSetupIntent } from '@/lib/services/card-on-file';
import {
  sendBookingConfirmationToClient,
  sendBookingNotificationToShop,
  buildEmailData,
} from '@/lib/services/email-notifications';
import { prisma } from '@/lib/db';

export async function createPaymentIntentForBookingAction(
  shopSlug: string,
  appointmentId: string,
  type: 'DEPOSIT' | 'FULL'
) {
  const shop = await prisma.shop.findUnique({ where: { slug: shopSlug } });
  if (!shop) throw new Error('Shop not found');
  return createPaymentIntentForAppointment({ shopId: shop.id, appointmentId, type });
}

export async function joinWaitlistAction(
  shopSlug: string,
  data: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    preferredServiceId?: string;
    preferredBarberProfileId?: string;
    notes?: string;
  }
) {
  const shop = await prisma.shop.findUnique({ where: { slug: shopSlug } });
  if (!shop) throw new Error('Shop not found');
  const customer = await createOrFindCustomer(shop.id, {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
  });
  return addWaitlistEntry(shop.id, customer.id, {
    preferredServiceId: data.preferredServiceId ?? null,
    preferredBarberProfileId: data.preferredBarberProfileId ?? null,
    notes: data.notes ?? null,
  });
}

export async function bookAppointmentAction(params: {
  shopId: string;
  barberProfileId: string;
  serviceId: string;
  startDateTime: Date | string;
  customer: { firstName: string; lastName: string; email?: string; phone?: string };
}) {
  const startDateTime = typeof params.startDateTime === 'string' ? new Date(params.startDateTime) : params.startDateTime;
  const customer = await createOrFindCustomer(params.shopId, {
    firstName: params.customer.firstName,
    lastName: params.customer.lastName,
    email: params.customer.email,
    phone: params.customer.phone,
  });

  const appointment = await createAppointment({
    shopId: params.shopId,
    customerId: customer.id,
    barberProfileId: params.barberProfileId,
    serviceId: params.serviceId,
    startDateTime,
  });

  return appointment;
}

export async function saveCardAction(params: {
  appointmentId: string;
  setupIntentId: string;
}) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: params.appointmentId },
    select: { customerId: true, shopId: true, status: true },
  });
  if (!appointment) throw new Error('Appointment not found');

  // Save card details to customer record
  await saveCardFromSetupIntent({
    customerId: appointment.customerId,
    shopId: appointment.shopId,
    setupIntentId: params.setupIntentId,
  });

  // Promote PENDING → CONFIRMED now that card is saved
  if (appointment.status === 'PENDING') {
    await prisma.appointment.update({
      where: { id: params.appointmentId },
      data: { status: 'CONFIRMED' },
    });

    // Now that the booking is confirmed, record the visit on the customer record.
    // (totalVisits was intentionally NOT incremented at appointment creation for
    // ONLINE bookings to avoid counting abandoned/pending bookings.)
    await prisma.customer.update({
      where: { id: appointment.customerId },
      data: { totalVisits: { increment: 1 } },
    });

    // Send confirmation emails (skipped at booking time for ONLINE/PENDING)
    const full = await prisma.appointment.findUnique({
      where: { id: params.appointmentId },
      include: { customer: true, barberProfile: true, appointmentServices: true, shop: true },
    });
    if (full) {
      const emailData = buildEmailData(full);
      sendBookingConfirmationToClient(emailData).catch(() => {});
      sendBookingNotificationToShop(emailData).catch(() => {});
    }
  }
}

/**
 * Cancels a PENDING appointment when the customer goes back during card entry.
 * Only works on PENDING — safe to call; won't touch already-confirmed appointments.
 */
export async function cancelPendingAppointmentAction(appointmentId: string) {
  await prisma.appointment.updateMany({
    where: { id: appointmentId, status: 'PENDING' },
    data: { status: 'CANCELED', canceledAt: new Date() },
  });
}
