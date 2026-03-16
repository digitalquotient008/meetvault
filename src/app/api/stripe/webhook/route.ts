import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { env } from '@/lib/env';
import { markPaymentAsSucceeded } from '@/lib/services/payments';

export async function POST(request: NextRequest) {
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
  const stripeSecret = env.STRIPE_SECRET_KEY;
  if (!webhookSecret || !stripeSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
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
      { status: 400 }
    );
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent;
    try {
      await markPaymentAsSucceeded(pi.id);
    } catch (e) {
      console.error('Failed to mark payment succeeded:', e);
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
