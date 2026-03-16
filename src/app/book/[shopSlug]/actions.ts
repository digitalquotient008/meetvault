'use server';

import { createOrFindCustomer } from '@/lib/services/customer';
import { createAppointment } from '@/lib/services/appointment';
import { createPaymentIntentForAppointment } from '@/lib/services/payments';
import { addWaitlistEntry } from '@/lib/services/waitlist';
import { saveCardFromSetupIntent } from '@/lib/services/card-on-file';
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
    select: { customerId: true, shopId: true },
  });
  if (!appointment) throw new Error('Appointment not found');

  await saveCardFromSetupIntent({
    customerId: appointment.customerId,
    shopId: appointment.shopId,
    setupIntentId: params.setupIntentId,
  });
}
