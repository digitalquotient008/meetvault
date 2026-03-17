/**
 * Lightweight in-process rate limiter — sliding fixed-window.
 *
 * Works within a single serverless function instance. Good enough for burst
 * protection; does NOT coordinate across multiple Vercel instances. For
 * cross-instance rate limiting, swap the store for Upstash Redis.
 */

type Entry = { count: number; windowStart: number };

// Module-level store survives across requests in the same warm instance
const store = new Map<string, Entry>();

// Periodically evict stale entries so the Map doesn't grow without bound
const EVICTION_INTERVAL_MS = 5 * 60 * 1000;
let lastEviction = Date.now();

function evictStale(windowMs: number) {
  const now = Date.now();
  if (now - lastEviction < EVICTION_INTERVAL_MS) return;
  lastEviction = now;
  for (const [key, entry] of store) {
    if (now - entry.windowStart >= windowMs) store.delete(key);
  }
}

/**
 * Returns true if the request is allowed, false if rate-limited.
 *
 * @param key     Unique identifier — typically an IP address
 * @param limit   Max allowed requests per window
 * @param windowMs Window duration in milliseconds
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  evictStale(windowMs);
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart >= windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count += 1;
  return true;
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
