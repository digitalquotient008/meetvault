'use server';

import { requireShopAccess } from '@/lib/auth';
import { generateApiKey, revokeApiKey, listApiKeys } from '@/lib/services/api-keys';
import { revalidatePath } from 'next/cache';

export async function generateApiKeyAction(name?: string) {
  const { shopId } = await requireShopAccess();
  const { rawKey, apiKey } = await generateApiKey(shopId, name || 'Default');
  revalidatePath('/app/settings/api');
  return { rawKey, id: apiKey.id, keyPrefix: apiKey.keyPrefix };
}

export async function revokeApiKeyAction(keyId: string) {
  const { shopId } = await requireShopAccess();
  await revokeApiKey(shopId, keyId);
  revalidatePath('/app/settings/api');
  return { ok: true };
}

export async function listApiKeysAction() {
  const { shopId } = await requireShopAccess();
  return listApiKeys(shopId);
}
