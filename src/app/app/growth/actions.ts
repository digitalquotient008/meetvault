'use server';

import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';

export async function sendReminderAction(customerId: string) {
  const { shopId } = await requireShopAccess();
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, shopId },
  });
  if (!customer) throw new Error('Customer not found');
  if (env.RESEND_API_KEY && customer.email) {
    const { Resend } = await import('resend');
    const resend = new Resend(env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'MeetingVault <onboarding@resend.dev>',
      to: customer.email,
      subject: 'We miss you! Book your next visit',
      html: `Hi ${customer.firstName},<br><br>It's been a while since we've seen you. We'd love to have you back — book your next appointment at your convenience.`,
    });
  }
  return { ok: true };
}
