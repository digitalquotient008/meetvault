import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredPendingAppointments } from '@/lib/services/appointment';

/**
 * Cron endpoint — cancels PENDING appointments older than 15 minutes.
 * These are bookings where the customer navigated away before saving their card.
 *
 * Vercel invokes this every 15 minutes (see vercel.json → crons).
 * Protected with CRON_SECRET to prevent unauthorized invocation.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const result = await cleanupExpiredPendingAppointments(15);
    console.log(`[cron/cleanup-pending] Canceled ${result.canceled} expired PENDING appointment(s)`);
    return NextResponse.json({ ok: true, canceled: result.canceled });
  } catch (err) {
    console.error('[cron/cleanup-pending] Error:', err);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
