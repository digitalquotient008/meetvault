import { redirect } from 'next/navigation';
import { requireShopAccess } from '@/lib/auth';
import { env } from '@/lib/env';
import { createAccountOnboardingLink } from '@/lib/services/stripe-connect';
import { prisma } from '@/lib/db';

export default async function ConnectRefreshPage() {
  const { shopId } = await requireShopAccess();

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { stripeConnectAccountId: true },
  });

  if (!shop?.stripeConnectAccountId) {
    redirect('/app/payments');
  }

  const baseUrl = env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const { url } = await createAccountOnboardingLink(shopId, baseUrl);

  redirect(url);
}
