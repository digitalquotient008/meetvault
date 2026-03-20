import { Redis } from '@upstash/redis';

/**
 * Distributed cron lock using Upstash Redis.
 *
 * Prevents overlapping cron runs when Vercel invokes the same cron
 * while a previous execution is still running.
 *
 * Usage:
 *   const lock = await acquireCronLock('cleanup-pending', 60);
 *   if (!lock) return; // Another instance is running
 *   try { ... } finally { await releaseCronLock('cleanup-pending', lock); }
 */

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/**
 * Try to acquire a lock for a cron job.
 *
 * @param cronName  Unique name for the cron (e.g. 'cleanup-pending')
 * @param ttlSeconds  Max lock duration — auto-released after this (safety net)
 * @returns Lock token string if acquired, null if another instance holds the lock
 */
export async function acquireCronLock(
  cronName: string,
  ttlSeconds = 120,
): Promise<string | null> {
  const redis = getRedis();
  if (!redis) return 'no-redis'; // No Redis = allow (local dev)

  const lockKey = `cron-lock:${cronName}`;
  const lockToken = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  // SET NX = only set if not exists; EX = auto-expire after ttl
  const acquired = await redis.set(lockKey, lockToken, { nx: true, ex: ttlSeconds });

  return acquired === 'OK' ? lockToken : null;
}

/**
 * Release a cron lock. Only releases if the token matches (prevents
 * releasing a lock that was acquired by a different instance after TTL expiry).
 */
export async function releaseCronLock(
  cronName: string,
  lockToken: string,
): Promise<void> {
  if (lockToken === 'no-redis') return;

  const redis = getRedis();
  if (!redis) return;

  const lockKey = `cron-lock:${cronName}`;
  const currentToken = await redis.get<string>(lockKey);

  if (currentToken === lockToken) {
    await redis.del(lockKey);
  }
}
