import { prisma } from '@/lib/db';
import { env } from '@/lib/env';
import {
  sendAppointmentReminder,
  buildReminderSmsBody,
  buildEmailData,
} from '@/lib/services/email-notifications';
import { sendSms } from '@/lib/services/sms';
import { APP_URL } from '@/lib/constants';

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

/**
 * Sends a "Your trial ends in 2 days" email to shop owners
 * whose trialEndsAt is within the next 46–50 hours.
 * Uses NotificationLog with templateKey 'trial_ending' to prevent duplicates.
 */
export async function sendTrialEndingReminders(): Promise<number> {
  if (!env.RESEND_API_KEY) return 0;

  const now = new Date();
  const windowFrom = new Date(now.getTime() + 46 * 60 * 60 * 1000);
  const windowTo = new Date(now.getTime() + 50 * 60 * 60 * 1000);

  const shops = await prisma.shop.findMany({
    where: {
      subscriptionStatus: 'trialing',
      trialEndsAt: { gte: windowFrom, lte: windowTo },
    },
    select: {
      id: true,
      name: true,
      email: true,
      memberships: {
        where: { role: 'OWNER', isActive: true },
        include: { user: true },
        take: 1,
      },
    },
  });

  let sent = 0;

  for (const shop of shops) {
    // Check if already sent
    const alreadySent = await prisma.notificationLog.findFirst({
      where: { shopId: shop.id, templateKey: 'trial_ending' },
    });
    if (alreadySent) continue;

    const ownerEmail = shop.memberships[0]?.user?.email ?? shop.email;
    if (!ownerEmail) continue;

    const { Resend } = await import('resend');
    const resend = new Resend(env.RESEND_API_KEY);

    try {
      await resend.emails.send({
        from: 'MeetingVault <onboarding@resend.dev>',
        to: ownerEmail,
        subject: `Your MeetingVault trial ends in 2 days`,
        html: `
          <div style="max-width:520px;margin:0 auto;padding:32px 16px;font-family:-apple-system,sans-serif;">
            <h1 style="font-size:22px;color:#fff;">Your trial ends soon</h1>
            <p style="color:#94a3b8;">Hey! Your 14-day MeetingVault trial for <strong>${shop.name}</strong> ends in 2 days.</p>
            <p style="color:#94a3b8;">After the trial, your card will be charged $25/month. If you'd like to cancel, you can do so from Settings → Billing before the trial ends.</p>
            <a href="${APP_URL}/app/settings/billing" style="display:inline-block;background:#f59e0b;color:#0f172a;padding:14px 28px;border-radius:10px;font-weight:700;text-decoration:none;margin-top:16px;">Manage subscription</a>
          </div>
        `,
      });

      await prisma.notificationLog.create({
        data: {
          shopId: shop.id,
          channel: 'EMAIL',
          templateKey: 'trial_ending',
          status: 'SENT',
          sentAt: new Date(),
        },
      });
      sent++;
    } catch {
      await prisma.notificationLog.create({
        data: {
          shopId: shop.id,
          channel: 'EMAIL',
          templateKey: 'trial_ending',
          status: 'FAILED',
        },
      }).catch(() => {});
    }
  }

  return sent;
}
