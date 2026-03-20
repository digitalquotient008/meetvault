import { Redis } from '@upstash/redis';

/**
 * Simple feature flag system backed by Upstash Redis.
 *
 * Flags are stored as Redis hash keys under "feature-flags".
 * Each flag is a string value: "true" | "false" | percentage (e.g. "25").
 *
 * Usage:
 *   if (await isFeatureEnabled('new-checkout-flow')) { ... }
 *   if (await isFeatureEnabled('gradual-rollout', shopId)) { ... }
 *
 * Managing flags (via Upstash console or CLI):
 *   HSET feature-flags new-checkout-flow true
 *   HSET feature-flags gradual-rollout 25        ← 25% of shops
 *   HDEL feature-flags new-checkout-flow          ← remove flag
 */

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const HASH_KEY = 'feature-flags';

/**
 * Check if a feature flag is enabled.
 *
 * @param flag  Flag name (e.g. 'new-checkout-flow')
 * @param entityId  Optional entity ID for percentage-based rollouts.
 *                  A consistent hash determines if this entity is in the rollout.
 * @returns true if enabled, false if disabled or flag doesn't exist
 */
export async function isFeatureEnabled(
  flag: string,
  entityId?: string,
): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false; // No Redis = all flags off (safe default)

  try {
    const value = await redis.hget<string>(HASH_KEY, flag);
    if (!value) return false;

    // Boolean flags
    if (value === 'true') return true;
    if (value === 'false') return false;

    // Percentage rollout (e.g. "25" = 25% of entities)
    const percent = parseInt(value, 10);
    if (!isNaN(percent) && entityId) {
      // Simple consistent hash: use entity ID to deterministically place in 0-99
      const hash = simpleHash(entityId);
      return (hash % 100) < percent;
    }

    return false;
  } catch {
    return false; // Redis error = flag off (fail safe)
  }
}

/**
 * Get all feature flags (for admin/debug purposes).
 */
export async function getAllFeatureFlags(): Promise<Record<string, string>> {
  const redis = getRedis();
  if (!redis) return {};

  try {
    const flags = await redis.hgetall<Record<string, string>>(HASH_KEY);
    return flags ?? {};
  } catch {
    return {};
  }
}

/**
 * Set a feature flag value.
 */
export async function setFeatureFlag(flag: string, value: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.hset(HASH_KEY, { [flag]: value });
}

/**
 * Delete a feature flag.
 */
export async function deleteFeatureFlag(flag: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.hdel(HASH_KEY, flag);
}

/**
 * Simple deterministic hash for percentage rollouts.
 * Returns a number 0-4294967295 from a string.
 */
function simpleHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}
