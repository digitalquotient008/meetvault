import { prisma } from '@/lib/db';
import { Decimal } from '@prisma/client/runtime/library';
import { addMinutes, addDays } from 'date-fns';
import { randomBytes } from 'crypto';
import { createAuditLog } from '@/lib/audit';

function generateConfirmationCode(): string {
  return randomBytes(4).toString('hex').toUpperCase();
}

export async function createAppointment(params: {
  shopId: string;
  customerId: string;
  barberProfileId: string;
  serviceId: string;
  startDateTime: Date;
  channel?: 'ONLINE' | 'STAFF' | 'WALK_IN';
}) {
  const { shopId, customerId, barberProfileId, serviceId, startDateTime, channel = 'ONLINE' } = params;

  const [service, barber] = await Promise.all([
    prisma.service.findFirst({ where: { id: serviceId, shopId, isActive: true } }),
    prisma.barberProfile.findFirst({ where: { id: barberProfileId, shopId, isBookable: true } }),
  ]);
  if (!service || !barber) throw new Error('Service or barber not found');

  const bufferBefore = barber.serviceBufferBeforeMin ?? 0;
  const bufferAfter = barber.serviceBufferAfterMin ?? 0;
  const start = addMinutes(startDateTime, bufferBefore);
  const end = addMinutes(start, service.durationMin + bufferAfter);

  const confirmationCode = generateConfirmationCode();

  const appointment = await prisma.$transaction(async (tx) => {
    const overlapping = await tx.appointment.findFirst({
      where: {
        barberProfileId,
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
        OR: [
          { startDateTime: { lt: end }, endDateTime: { gt: start } },
        ],
      },
    });
    if (overlapping) throw new Error('This time slot is no longer available. Please choose another.');

    const apt = await tx.appointment.create({
      data: {
        shopId,
        customerId,
        barberProfileId,
        startDateTime: start,
        endDateTime: end,
        status: 'CONFIRMED',
        channel,
        confirmationCode,
        subtotal: service.price,
        totalAmount: service.price,
        depositAmount: null,
        balanceDue: service.price,
      },
    });
    await tx.appointmentService.create({
      data: {
        appointmentId: apt.id,
        serviceId: service.id,
        serviceNameSnapshot: service.name,
        durationMinSnapshot: service.durationMin,
        priceSnapshot: service.price,
      },
    });
    await tx.customer.update({
      where: { id: customerId },
      data: {
        lastVisitAt: new Date(),
        totalVisits: { increment: 1 },
      },
    });
    return apt;
  });

  const result = await prisma.appointment.findUnique({
    where: { id: appointment.id },
    include: {
      customer: true,
      barberProfile: true,
      appointmentServices: true,
      shop: true,
    },
  });
  if (result) {
    await createAuditLog({
      shopId,
      entityType: 'Appointment',
      entityId: result.id,
      action: 'created',
      afterJson: JSON.stringify({ status: result.status, confirmationCode: result.confirmationCode }),
    });
  }
  return result;
}

export async function getAppointmentsForShop(shopId: string, from: Date, to: Date) {
  return prisma.appointment.findMany({
    where: {
      shopId,
      startDateTime: { gte: from },
      endDateTime: { lte: to },
      status: { not: 'CANCELED' },
    },
    include: {
      customer: true,
      barberProfile: true,
      appointmentServices: true,
    },
    orderBy: { startDateTime: 'asc' },
  });
}

export async function checkInAppointment(shopId: string, appointmentId: string) {
  const apt = await prisma.appointment.findFirst({
    where: { id: appointmentId, shopId, status: 'CONFIRMED' },
  });
  if (!apt) throw new Error('Appointment not found or not confirmable');
  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'IN_PROGRESS' },
  });
}

export async function startAppointment(shopId: string, appointmentId: string) {
  const apt = await prisma.appointment.findFirst({
    where: { id: appointmentId, shopId, status: { in: ['CONFIRMED'] } },
  });
  if (!apt) throw new Error('Appointment not found');
  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'IN_PROGRESS' },
  });
}

export async function completeAppointment(shopId: string, appointmentId: string) {
  const apt = await prisma.appointment.findFirst({
    where: { id: appointmentId, shopId, status: { in: ['CONFIRMED', 'IN_PROGRESS'] } },
  });
  if (!apt) throw new Error('Appointment not found');
  const updated = await prisma.$transaction(async (tx) => {
    const apt = await tx.appointment.update({
      where: { id: appointmentId },
      data: { status: 'COMPLETED' },
    });
    await tx.customer.update({
      where: { id: apt.customerId },
      data: {
        lastVisitAt: new Date(),
        totalSpend: { increment: apt.totalAmount ?? apt.subtotal ?? 0 },
        nextSuggestedAt: addDays(new Date(), 30),
      },
    });
    return apt;
  });
  await createAuditLog({
    shopId,
    entityType: 'Appointment',
    entityId: appointmentId,
    action: 'completed',
    afterJson: JSON.stringify({ status: 'COMPLETED' }),
  });
  return prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { customer: true, barberProfile: true },
  });
}

export async function cancelAppointment(shopId: string, appointmentId: string) {
  const apt = await prisma.appointment.findFirst({
    where: { id: appointmentId, shopId },
  });
  if (!apt) throw new Error('Appointment not found');
  if (apt.status === 'CANCELED') return apt;
  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'CANCELED' },
  });
  await createAuditLog({
    shopId,
    entityType: 'Appointment',
    entityId: appointmentId,
    action: 'canceled',
    afterJson: JSON.stringify({ status: 'CANCELED' }),
  });
  return updated;
}

export async function markNoShowAppointment(shopId: string, appointmentId: string) {
  const apt = await prisma.appointment.findFirst({
    where: { id: appointmentId, shopId, status: { in: ['CONFIRMED', 'IN_PROGRESS'] } },
  });
  if (!apt) throw new Error('Appointment not found');
  await prisma.$transaction([
    prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'NO_SHOW' },
    }),
    prisma.customer.update({
      where: { id: apt.customerId },
      data: { noShowCount: { increment: 1 } },
    }),
  ]);
  await createAuditLog({
    shopId,
    entityType: 'Appointment',
    entityId: appointmentId,
    action: 'no_show',
    afterJson: JSON.stringify({ status: 'NO_SHOW' }),
  });
  return prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { customer: true, barberProfile: true },
  });
}
