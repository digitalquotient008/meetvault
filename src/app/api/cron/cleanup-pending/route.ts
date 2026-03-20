import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredPendingAppointments } from '@/lib/services/appointment';
import { verifyCronAuth } from '@/lib/cron-auth';

export async function GET(request: NextRequest) {
  const authError = verifyCronAuth(request);
  if (authError) return authError;

  try {
    const result = await cleanupExpiredPendingAppointments(15);
    console.log(`[cron/cleanup-pending] Canceled ${result.canceled} expired PENDING appointment(s)`);
    return NextResponse.json({ ok: true, canceled: result.canceled });
  } catch (err) {
    console.error('[cron/cleanup-pending] Error:', err);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
