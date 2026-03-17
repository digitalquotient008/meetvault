import { env } from '@/lib/env';
import { prisma } from '@/lib/db';

/**
 * Send an SMS via the Twilio REST API.
 * Uses fetch directly — no `twilio` npm package required.
 * No-ops gracefully if Twilio credentials are not configured.
 * Logs every attempt to NotificationLog for audit.
 */
export async function sendSms(params: {
  to: string;
  body: string;
  shopId: string;
  appointmentId?: string;
  customerId?: string;
  templateKey: string;
}) {
  const { to, body, shopId, appointmentId, customerId, templateKey } = params;

  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_PHONE_NUMBER) {
    return; // Twilio not configured — skip silently
  }

  const accountSid = env.TWILIO_ACCOUNT_SID;

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(`${accountSid}:${env.TWILIO_AUTH_TOKEN}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: to,
          From: env.TWILIO_PHONE_NUMBER,
          Body: body,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message ?? `Twilio API error ${response.status}`);
    }

    await prisma.notificationLog.create({
      data: {
        shopId,
        appointmentId: appointmentId ?? null,
        customerId: customerId ?? null,
        channel: 'SMS',
        templateKey,
        status: 'SENT',
        providerMessageId: data.sid ?? null,
        sentAt: new Date(),
      },
    }).catch(() => {});
  } catch (err) {
    await prisma.notificationLog.create({
      data: {
        shopId,
        appointmentId: appointmentId ?? null,
        customerId: customerId ?? null,
        channel: 'SMS',
        templateKey,
        status: 'FAILED',
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
      },
    }).catch(() => {});
  }
}
