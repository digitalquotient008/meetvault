import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';
import { verifyCronAuth } from '@/lib/cron-auth';
import { acquireCronLock, releaseCronLock } from '@/lib/cron-lock';
import { logger } from '@/lib/logger';

/**
 * Nightly payment reconciliation cron.
 *
 * Cross-checks PENDING payments in our DB against Stripe's actual state.
 * If Stripe says a PaymentIntent succeeded but our webhook never fired
 * (or failed), this job corrects the DB record.
 *
 * Runs daily at 4am UTC (see vercel.json → crons).
 */
export async function GET(request: NextRequest) {
  const authError = verifyCronAuth(request);
  if (authError) return authError;

  const lock = await acquireCronLock('reconcile-payments', 300);
  if (!lock) {
    logger.warn('Cron skipped — already running', { cron: 'reconcile-payments' });
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      logger.warn('Stripe not configured, skipping reconciliation', { cron: 'reconcile-payments' });
      return NextResponse.json({ ok: true, skipped: true, reason: 'no-stripe' });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' });

    // Find payments that have been PENDING for more than 1 hour
    const staleThreshold = new Date(Date.now() - 60 * 60 * 1000);
    const pendingPayments = await prisma.payment.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: staleThreshold },
        stripePaymentIntentId: { not: null },
      },
      take: 50, // Process in batches to avoid timeout
    });

    let reconciled = 0;
    let failed = 0;
    let unchanged = 0;

    for (const payment of pendingPayments) {
      try {
        const pi = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId!);

        if (pi.status === 'succeeded' && payment.status === 'PENDING') {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'SUCCEEDED' },
          });
          reconciled++;
          logger.info('Payment reconciled', {
            cron: 'reconcile-payments',
            paymentId: payment.id,
            stripeStatus: pi.status,
          });
        } else if (pi.status === 'canceled' || pi.status === 'requires_payment_method') {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'FAILED' },
          });
          failed++;
        } else {
          unchanged++;
        }
      } catch (err) {
        logger.error('Reconciliation error for payment', {
          cron: 'reconcile-payments',
          paymentId: payment.id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    logger.info('Payment reconciliation completed', {
      cron: 'reconcile-payments',
      checked: pendingPayments.length,
      reconciled,
      failed,
      unchanged,
    });

    return NextResponse.json({
      ok: true,
      checked: pendingPayments.length,
      reconciled,
      failed,
      unchanged,
    });
  } catch (err) {
    logger.error('Payment reconciliation failed', {
      cron: 'reconcile-payments',
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: 'Reconciliation failed' }, { status: 500 });
  } finally {
    await releaseCronLock('reconcile-payments', lock);
  }
}
