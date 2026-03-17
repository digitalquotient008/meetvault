import { env } from '@/lib/env';
import { prisma } from '@/lib/db';

/**
 * Send an SMS via Twilio.
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

  try {
    // Lazy-import twilio to avoid crashing if not installed
    const twilio = (await import('twilio')).default;
    const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

    const message = await client.messages.create({
      body,
      from: env.TWILIO_PHONE_NUMBER,
      to,
    });

    await prisma.notificationLog.create({
      data: {
        shopId,
        appointmentId: appointmentId ?? null,
        customerId: customerId ?? null,
        channel: 'SMS',
        templateKey,
        status: 'SENT',
        providerMessageId: message.sid,
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
