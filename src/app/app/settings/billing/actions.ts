'use server';

import { requireShopAccess } from '@/lib/auth';
import {
  createBillingPortalSession,
  cancelSubscription,
  resumeSubscription,
} from '@/lib/services/subscription';

export async function openBillingPortalAction() {
  const { shopId } = await requireShopAccess(['OWNER']);
  const { url } = await createBillingPortalSession(shopId);
  return { url };
}

export async function cancelSubscriptionAction() {
  const { shopId } = await requireShopAccess(['OWNER']);
  await cancelSubscription(shopId);
}

export async function resumeSubscriptionAction() {
  const { shopId } = await requireShopAccess(['OWNER']);
  await resumeSubscription(shopId);
}
