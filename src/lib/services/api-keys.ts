import { prisma } from '@/lib/db';
import { randomBytes, createHash } from 'crypto';

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * Generate a new API key for a shop.
 * Returns the raw key (shown once to the user) and the DB record.
 */
export async function generateApiKey(shopId: string, name = 'Default') {
  const rawKey = `mv_live_${randomBytes(24).toString('hex')}`;
  const keyHash = hashKey(rawKey);
  const keyPrefix = rawKey.slice(0, 16) + '...';

  const apiKey = await prisma.apiKey.create({
    data: { shopId, name, keyHash, keyPrefix },
  });

  return { rawKey, apiKey };
}

/**
 * Validate an API key and return the associated shopId.
 * Updates lastUsedAt on successful validation.
 */
export async function validateApiKey(rawKey: string): Promise<string | null> {
  if (!rawKey.startsWith('mv_live_')) return null;

  const keyHash = hashKey(rawKey);
  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    select: { id: true, shopId: true, revokedAt: true },
  });

  if (!apiKey || apiKey.revokedAt) return null;

  // Update last used (fire and forget)
  prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  }).catch(() => {});

  return apiKey.shopId;
}

/**
 * List all API keys for a shop (never returns the actual key).
 */
export async function listApiKeys(shopId: string) {
  return prisma.apiKey.findMany({
    where: { shopId },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      lastUsedAt: true,
      revokedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Revoke an API key.
 */
export async function revokeApiKey(shopId: string, keyId: string) {
  await prisma.apiKey.updateMany({
    where: { id: keyId, shopId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
