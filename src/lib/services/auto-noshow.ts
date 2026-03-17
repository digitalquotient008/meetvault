import { prisma } from '@/lib/db';
import { chargeNoShowFee } from '@/lib/services/card-on-file';
import { createAuditLog } from '@/lib/audit';

/**
 * Auto-detects no-shows and charges the card on file.
 *
 * Logic:
 * 1. Find CONFIRMED appointments whose endDateTime is > 30 min in the past
 *    (customer never showed up — appointment was never started or completed).
 * 2. Mark each as NO_SHOW and increment customer.noShowCount.
 * 3. If the shop has a no-show fee configured AND the customer has a card on file,
 *    auto-charge the fee.
 *
 * Called by /api/cron/auto-noshow every 15 minutes.
 * Idempotent: only touches CONFIRMED appointments, and chargeNoShowFee
 * checks noShowFeeCharged flag to prevent double charges.
 */
export async function processAutoNoShows(): Promise<{
  detected: number;
  charged: number;
  chargeErrors: number;
}> {
  const cutoff = new Date(Date.now() - 30 * 60 * 1000); // 30 min grace period

  // Find appointments that should be marked as no-shows:
  // status is still CONFIRMED, and endDateTime has passed + 30 min grace
  const staleAppointments = await prisma.appointment.findMany({
    where: {
      status: 'CONFIRMED',
      endDateTime: { lt: cutoff },
      autoNoShowChargedAt: null,
    },
    include: {
      customer: true,
      shop: {
        select: {
          noShowFeeAmount: true,
          stripeConnectAccountId: true,
          stripeConnectOnboarded: true,
          platformFeePercent: true,
        },
      },
    },
  });

  let detected = 0;
  let charged = 0;
  let chargeErrors = 0;

  for (const apt of staleAppointments) {
    // Mark as NO_SHOW + increment noShowCount
    await prisma.$transaction([
      prisma.appointment.update({
        where: { id: apt.id },
        data: { status: 'NO_SHOW', autoNoShowChargedAt: new Date() },
      }),
      prisma.customer.update({
        where: { id: apt.customerId },
        data: { noShowCount: { increment: 1 } },
      }),
    ]);

    await createAuditLog({
      shopId: apt.shopId,
      entityType: 'Appointment',
      entityId: apt.id,
      action: 'auto_no_show',
      afterJson: JSON.stringify({ status: 'NO_SHOW', auto: true }),
    });

    detected++;

    // Auto-charge no-show fee if configured + customer has card on file
    const hasFee = apt.shop.noShowFeeAmount && Number(apt.shop.noShowFeeAmount) > 0;
    const hasCard = Boolean(apt.customer.stripePaymentMethodId && apt.customer.platformStripeCustomerId);

    if (hasFee && hasCard) {
      try {
        await chargeNoShowFee({
          appointmentId: apt.id,
          shopId: apt.shopId,
        });
        charged++;

        await createAuditLog({
          shopId: apt.shopId,
          entityType: 'Appointment',
          entityId: apt.id,
          action: 'auto_no_show_charged',
          afterJson: JSON.stringify({
            feeAmount: Number(apt.shop.noShowFeeAmount),
          }),
        });
      } catch (err) {
        chargeErrors++;
        console.error(
          `[auto-noshow] Failed to charge no-show fee for appointment ${apt.id}:`,
          err instanceof Error ? err.message : err,
        );
      }
    }
  }

  return { detected, charged, chargeErrors };
}
