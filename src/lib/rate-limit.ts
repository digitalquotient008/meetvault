import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Distributed rate limiter backed by Upstash Redis.
 * Works correctly across all Vercel serverless instances.
 *
 * Falls back to a permissive in-memory limiter if Upstash is not configured
 * (local dev without Redis). In production, UPSTASH_REDIS_REST_URL and
 * UPSTASH_REDIS_REST_TOKEN must be set.
 */

let _slotsLimiter: Ratelimit | null = null;
let _setupIntentLimiter: Ratelimit | null = null;

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function getSlotsLimiter(): Ratelimit | null {
  if (_slotsLimiter) return _slotsLimiter;
  const redis = getRedis();
  if (!redis) return null;
  _slotsLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    prefix: 'rl:slots',
  });
  return _slotsLimiter;
}

function getSetupIntentLimiter(): Ratelimit | null {
  if (_setupIntentLimiter) return _setupIntentLimiter;
  const redis = getRedis();
  if (!redis) return null;
  _setupIntentLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    prefix: 'rl:setup-intent',
  });
  return _setupIntentLimiter;
}

/**
 * Check if a request is within rate limits.
 *
 * @param key      Unique identifier (typically IP address)
 * @param endpoint 'slots' | 'setup-intent'
 * @returns true if allowed, false if rate-limited
 */
export async function checkRateLimit(
  key: string,
  endpoint: 'slots' | 'setup-intent',
): Promise<boolean> {
  const limiter = endpoint === 'slots' ? getSlotsLimiter() : getSetupIntentLimiter();

  // No Redis configured → allow (local dev only)
  if (!limiter) return true;

  const { success } = await limiter.limit(key);
  return success;
}

/**
 * Extract the client IP from a Request, honoring Vercel's forwarded headers.
 */
export function getClientIp(request: Request): string {
  return (
    (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
