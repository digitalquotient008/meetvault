import { prisma } from '@/lib/db';
import {
  sendAppointmentReminder,
  buildReminderSmsBody,
  buildEmailData,
} from '@/lib/services/email-notifications';
import { sendSms } from '@/lib/services/sms';

/**
 * Finds CONFIRMED appointments that are due for a 24-hour or 1-hour reminder
 * and sends email + SMS (if phone on file and Twilio configured).
 *
 * Called by /api/cron/send-reminders every 15 minutes.
 *
 * Idempotent: uses reminder24hSentAt / reminder1hSentAt to avoid duplicates.
 */
export async function sendDueReminders(): Promise<{
  sent24h: number;
  sent1h: number;
}> {
  const now = new Date();
  let sent24h = 0;
  let sent1h = 0;

  // ── 24-hour reminders ──
  // Find CONFIRMED appointments starting in the next 22–26 hours
  // that haven't had a 24h reminder sent yet.
  // The 22–26 hour window ensures the cron (every 15 min) doesn't miss anyone.
  const window24hFrom = new Date(now.getTime() + 22 * 60 * 60 * 1000);
  const window24hTo = new Date(now.getTime() + 26 * 60 * 60 * 1000);

  const due24h = await prisma.appointment.findMany({
    where: {
      status: 'CONFIRMED',
      startDateTime: { gte: window24hFrom, lte: window24hTo },
      reminder24hSentAt: null,
    },
    include: {
      customer: true,
      barberProfile: true,
      appointmentServices: true,
      shop: true,
    },
  });

  for (const apt of due24h) {
    const emailData = buildEmailData(apt);

    // Send email
    await sendAppointmentReminder(emailData, 24).catch(() => {});

    // Send SMS if customer has phone
    if (apt.customer.phone) {
      const smsBody = buildReminderSmsBody(emailData, 24);
      await sendSms({
        to: apt.customer.phone,
        body: smsBody,
        shopId: apt.shopId,
        appointmentId: apt.id,
        customerId: apt.customer.id,
        templateKey: 'reminder_24h_sms',
      }).catch(() => {});
    }

    // Mark as sent
    await prisma.appointment.update({
      where: { id: apt.id },
      data: { reminder24hSentAt: now },
    });
    sent24h++;
  }

  // ── 1-hour reminders ──
  // Find CONFIRMED appointments starting in the next 45–75 minutes
  // that haven't had a 1h reminder sent yet.
  const window1hFrom = new Date(now.getTime() + 45 * 60 * 1000);
  const window1hTo = new Date(now.getTime() + 75 * 60 * 1000);

  const due1h = await prisma.appointment.findMany({
    where: {
      status: 'CONFIRMED',
      startDateTime: { gte: window1hFrom, lte: window1hTo },
      reminder1hSentAt: null,
    },
    include: {
      customer: true,
      barberProfile: true,
      appointmentServices: true,
      shop: true,
    },
  });

  for (const apt of due1h) {
    const emailData = buildEmailData(apt);

    // Send email
    await sendAppointmentReminder(emailData, 1).catch(() => {});

    // Send SMS if customer has phone
    if (apt.customer.phone) {
      const smsBody = buildReminderSmsBody(emailData, 1);
      await sendSms({
        to: apt.customer.phone,
        body: smsBody,
        shopId: apt.shopId,
        appointmentId: apt.id,
        customerId: apt.customer.id,
        templateKey: 'reminder_1h_sms',
      }).catch(() => {});
    }

    // Mark as sent
    await prisma.appointment.update({
      where: { id: apt.id },
      data: { reminder1hSentAt: now },
    });
    sent1h++;
  }

  return { sent24h, sent1h };
}
