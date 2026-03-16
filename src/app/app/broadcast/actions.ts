'use server';

import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';

export type BroadcastAudience = 'all' | 'recent' | 'dormant';

export type BroadcastResult = {
  sent: number;
  failed: number;
  skippedNoEmail: number;
  skippedOptOut: number;
  errors: string[];
};

export async function getAudienceCounts(): Promise<{
  all: number;
  allWithEmail: number;
  recent: number;
  recentWithEmail: number;
  dormant: number;
  dormantWithEmail: number;
}> {
  const { shopId } = await requireShopAccess();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const [all, allWithEmail, recent, recentWithEmail, dormant, dormantWithEmail] = await Promise.all([
    prisma.customer.count({ where: { shopId } }),
    prisma.customer.count({ where: { shopId, email: { not: null }, marketingOptInEmail: true } }),
    prisma.customer.count({ where: { shopId, lastVisitAt: { gte: thirtyDaysAgo } } }),
    prisma.customer.count({ where: { shopId, lastVisitAt: { gte: thirtyDaysAgo }, email: { not: null }, marketingOptInEmail: true } }),
    prisma.customer.count({ where: { shopId, OR: [{ lastVisitAt: { lt: sixtyDaysAgo } }, { lastVisitAt: null }] } }),
    prisma.customer.count({ where: { shopId, OR: [{ lastVisitAt: { lt: sixtyDaysAgo } }, { lastVisitAt: null }], email: { not: null }, marketingOptInEmail: true } }),
  ]);

  return { all, allWithEmail, recent, recentWithEmail, dormant, dormantWithEmail };
}

export async function sendBroadcast(params: {
  audience: BroadcastAudience;
  subject: string;
  body: string;
}): Promise<BroadcastResult> {
  const { shopId } = await requireShopAccess();

  if (!env.RESEND_API_KEY) {
    throw new Error('Email is not configured. Set RESEND_API_KEY in your environment variables.');
  }

  const shop = await prisma.shop.findUnique({ where: { id: shopId }, select: { name: true, email: true } });
  if (!shop) throw new Error('Shop not found');

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  let whereClause: Parameters<typeof prisma.customer.findMany>[0] = { where: { shopId } };
  if (params.audience === 'recent') {
    whereClause = { where: { shopId, lastVisitAt: { gte: thirtyDaysAgo } } };
  } else if (params.audience === 'dormant') {
    whereClause = { where: { shopId, OR: [{ lastVisitAt: { lt: sixtyDaysAgo } }, { lastVisitAt: null }] } };
  }

  const customers = await prisma.customer.findMany({
    ...whereClause,
    select: { id: true, firstName: true, email: true, marketingOptInEmail: true },
  });

  const { Resend } = await import('resend');
  const resend = new Resend(env.RESEND_API_KEY);
  const fromAddress = shop.email
    ? `${shop.name} <${shop.email}>`
    : `${shop.name} <onboarding@resend.dev>`;

  let sent = 0;
  let failed = 0;
  let skippedNoEmail = 0;
  let skippedOptOut = 0;
  const errors: string[] = [];

  const BATCH_SIZE = 10;
  for (let i = 0; i < customers.length; i += BATCH_SIZE) {
    const batch = customers.slice(i, i + BATCH_SIZE);

    const promises = batch.map(async (c) => {
      if (!c.email) {
        skippedNoEmail++;
        return;
      }
      if (!c.marketingOptInEmail) {
        skippedOptOut++;
        return;
      }

      const personalizedBody = params.body
        .replace(/\{\{first_name\}\}/gi, c.firstName || 'there')
        .replace(/\{\{name\}\}/gi, c.firstName || 'there');

      const personalizedSubject = params.subject
        .replace(/\{\{first_name\}\}/gi, c.firstName || 'there')
        .replace(/\{\{name\}\}/gi, c.firstName || 'there');

      try {
        await resend.emails.send({
          from: fromAddress,
          to: c.email,
          subject: personalizedSubject,
          html: personalizedBody
            .split('\n')
            .map((line) => (line.trim() === '' ? '<br>' : `<p style="margin:0 0 8px 0;color:#333;font-family:sans-serif;">${line}</p>`))
            .join(''),
        });
        sent++;
      } catch (err) {
        failed++;
        if (errors.length < 10) {
          errors.push(`${c.email}: ${err instanceof Error ? err.message : 'Send failed'}`);
        }
      }
    });

    await Promise.all(promises);
  }

  await prisma.notificationLog.create({
    data: {
      shopId,
      channel: 'EMAIL',
      templateKey: `broadcast:${params.audience}`,
      status: failed === 0 ? 'SENT' : 'FAILED',
      errorMessage: errors.length > 0 ? errors.join('; ') : null,
    },
  });

  return { sent, failed, skippedNoEmail, skippedOptOut, errors };
}
