import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';
import { requireShopAccess } from '@/lib/auth';
import { createConnectAccount, createAccountOnboardingLink } from '@/lib/services/stripe-connect';

export async function GET() {
  const appUrl = env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  try {
    const { shopId } = await requireShopAccess();

    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { stripeConnectAccountId: true, email: true },
    });

    if (!shop) {
      return NextResponse.redirect(new URL('/app/payments?connect_error=shop-not-found', appUrl));
    }

    if (!shop.stripeConnectAccountId) {
      await createConnectAccount(shopId, shop.email || null);
    }

    const { url } = await createAccountOnboardingLink(shopId, appUrl);
    return NextResponse.redirect(url);
  } catch (err) {
    const status = (err as { statusCode?: number })?.statusCode;
    const msg =
      status === 403
        ? 'stripe-connect-not-enabled'
        : encodeURIComponent(
            (err instanceof Error ? err.message : 'unknown-error').slice(0, 100),
          );
    return NextResponse.redirect(new URL(`/app/payments?connect_error=${msg}`, appUrl));
  }
}
