import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';
import { markPaymentAsSucceeded, markPaymentAsFailed } from '@/lib/services/payments';
import { attachPaymentMethodToCustomer } from '@/lib/services/customer-stripe';
import { createAuditLog } from '@/lib/audit';

export async function POST(request: NextRequest) {
  const webhookSecret = env.STRIPE_CONNECT_WEBHOOK_SECRET;
  const stripeSecret = env.STRIPE_SECRET_KEY;
  if (!webhookSecret || !stripeSecret) {
    return NextResponse.json({ error: 'Stripe Connect webhook not configured' }, { status: 500 });
  }

  let body: string;
  try {
    body = await request.text();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = new Stripe(stripeSecret, { apiVersion: '2025-02-24.acacia' });
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Webhook signature verification failed' },
      { status: 400 },
    );
  }

  // `event.account` identifies the connected shop's Stripe account
  const connectedAccountId = event.account;

  try {
    switch (event.type) {
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        if (account.charges_enabled) {
          // Mark shop as onboarded
          await prisma.shop.updateMany({
            where: { stripeConnectAccountId: account.id },
            data: { stripeConnectOnboarded: true },
          });
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const { shopId, customerId } = pi.metadata ?? {};

        await markPaymentAsSucceeded(pi.id, connectedAccountId ?? undefined);

        // Attach PaymentMethod to customer for card-on-file
        if (shopId && customerId && connectedAccountId) {
          await attachPaymentMethodToCustomer({
            shopId,
            customerId,
            stripePaymentIntentId: pi.id,
            stripeConnectAccountId: connectedAccountId,
          }).catch((err) => {
            // Non-fatal — card attachment failure should not break payment recording
            console.error('Failed to attach payment method to customer:', err);
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        await markPaymentAsFailed(pi.id);
        break;
      }

      case 'payout.paid': {
        const payout = event.data.object as Stripe.Payout;
        if (connectedAccountId) {
          const shop = await prisma.shop.findFirst({
            where: { stripeConnectAccountId: connectedAccountId },
            select: { id: true },
          });
          if (shop) {
            await createAuditLog({
              shopId: shop.id,
              entityType: 'Payout',
              entityId: payout.id,
              action: 'paid',
              afterJson: JSON.stringify({
                amount: payout.amount / 100,
                currency: payout.currency,
                status: payout.status,
              }),
            });
          }
        }
        break;
      }

      case 'payout.failed': {
        const payout = event.data.object as Stripe.Payout;
        if (connectedAccountId) {
          const shop = await prisma.shop.findFirst({
            where: { stripeConnectAccountId: connectedAccountId },
            select: { id: true },
          });
          if (shop) {
            await createAuditLog({
              shopId: shop.id,
              entityType: 'Payout',
              entityId: payout.id,
              action: 'failed',
              afterJson: JSON.stringify({
                amount: payout.amount / 100,
                failureCode: payout.failure_code,
                failureMessage: payout.failure_message,
              }),
            });
          }
        }
        break;
      }
    }
  } catch (err) {
    console.error(`Connect webhook error [${event.type}]:`, err);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
