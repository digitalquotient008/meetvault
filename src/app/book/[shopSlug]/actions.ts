'use server';

import { createOrFindCustomer } from '@/lib/services/customer';
import { createAppointment } from '@/lib/services/appointment';

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
