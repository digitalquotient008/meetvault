import { env } from '@/lib/env';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

const SMS_SEGMENT_LENGTH = 160;
const MAX_SMS_LENGTH = 320; // 2 segments max — keeps cost predictable

/**
 * Truncate SMS body to fit within segment limits.
 * Adds "..." if truncated so the message is clearly cut.
 */
function truncateSmsBody(body: string): string {
  if (body.length <= MAX_SMS_LENGTH) return body;
  return body.slice(0, MAX_SMS_LENGTH - 3) + '...';
}

/**
 * Send an SMS via the Twilio REST API.
 * Uses fetch directly — no `twilio` npm package required.
 * No-ops gracefully if Twilio credentials are not configured.
 * Logs every attempt to NotificationLog for audit.
 * Automatically truncates messages to 2 segments (320 chars) max.
 */
export async function sendSms(params: {
  to: string;
  body: string;
  shopId: string;
  appointmentId?: string;
  customerId?: string;
  templateKey: string;
}) {
  const { to, shopId, appointmentId, customerId, templateKey } = params;
  const body = truncateSmsBody(params.body);

  if (body.length > SMS_SEGMENT_LENGTH) {
    logger.warn('SMS exceeds single segment', {
      shopId,
      templateKey,
      length: body.length,
      segments: Math.ceil(body.length / SMS_SEGMENT_LENGTH),
    });
  }

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
