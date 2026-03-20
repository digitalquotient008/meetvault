import { NextRequest, NextResponse } from 'next/server';

/**
 * Validate cron request authorization. Fails CLOSED — if CRON_SECRET is not
 * configured, all cron requests are rejected (not silently allowed).
 *
 * Returns null if authorized, or a 401 response to return immediately.
 */
export function verifyCronAuth(request: NextRequest): NextResponse | null {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('[cron] CRON_SECRET not configured — rejecting request');
    return NextResponse.json(
      { error: 'CRON_SECRET not configured' },
      { status: 401 },
    );
  }

  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null; // authorized
}
