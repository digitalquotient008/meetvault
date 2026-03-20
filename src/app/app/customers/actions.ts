'use server';

import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createAuditLog } from '@/lib/audit';
import { revalidatePath } from 'next/cache';

/**
 * GDPR-compliant customer data deletion.
 *
 * Anonymizes the customer record instead of hard-deleting so that
 * appointment history and financial records remain intact for accounting.
 * Personal identifiers (name, email, phone, notes, card info) are wiped.
 */
export async function deleteCustomerDataAction(customerId: string) {
  const { shopId } = await requireShopAccess();

  const customer = await prisma.customer.findFirst({
    where: { id: customerId, shopId },
  });
  if (!customer) throw new Error('Customer not found');

  await prisma.$transaction(async (tx) => {
    // Anonymize customer record — keep the row for FK integrity
    await tx.customer.update({
      where: { id: customerId },
      data: {
        firstName: 'Deleted',
        lastName: 'User',
        email: null,
        phone: null,
        notes: null,
        stripeCustomerId: null,
        platformStripeCustomerId: null,
        stripePaymentMethodId: null,
        cardLastFour: null,
        cardBrand: null,
        favoriteBarberProfileId: null,
      },
    });

    // Delete all customer notes
    await tx.customerNote.deleteMany({
      where: { customerId, shopId },
    });
  });

  await createAuditLog({
    shopId,
    entityType: 'Customer',
    entityId: customerId,
    action: 'data_deleted',
    afterJson: JSON.stringify({ reason: 'GDPR deletion request' }),
  });

  revalidatePath('/app/customers');
  return { ok: true };
}

/**
 * GDPR-compliant customer data export.
 *
 * Returns all data associated with a customer in a structured format.
 */
export async function exportCustomerDataAction(customerId: string) {
  const { shopId } = await requireShopAccess();

  const customer = await prisma.customer.findFirst({
    where: { id: customerId, shopId },
    include: {
      customerNotes: true,
      appointments: {
        include: {
          appointmentServices: true,
          payments: { include: { refunds: true } },
        },
      },
    },
  });
  if (!customer) throw new Error('Customer not found');

  // Strip internal IDs and return human-readable data
  return {
    personalInfo: {
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      notes: customer.notes,
      createdAt: customer.createdAt.toISOString(),
    },
    visitHistory: {
      totalVisits: customer.totalVisits,
      totalSpend: Number(customer.totalSpend),
      lastVisitAt: customer.lastVisitAt?.toISOString() ?? null,
      noShowCount: customer.noShowCount,
    },
    notes: customer.customerNotes.map((n) => ({
      content: n.content,
      createdAt: n.createdAt.toISOString(),
    })),
    appointments: customer.appointments.map((apt) => ({
      date: apt.startDateTime.toISOString(),
      status: apt.status,
      services: apt.appointmentServices.map((s) => ({
        name: s.serviceNameSnapshot,
        price: Number(s.priceSnapshot),
        duration: s.durationMinSnapshot,
      })),
      totalAmount: Number(apt.totalAmount),
      payments: apt.payments.map((p) => ({
        amount: Number(p.amount),
        type: p.type,
        status: p.status,
        date: p.createdAt.toISOString(),
        refunds: p.refunds.map((r) => ({
          amount: Number(r.amount),
          reason: r.reason,
          date: r.createdAt.toISOString(),
        })),
      })),
    })),
    exportedAt: new Date().toISOString(),
  };
}
