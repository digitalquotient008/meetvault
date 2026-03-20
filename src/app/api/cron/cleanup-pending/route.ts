import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredPendingAppointments } from '@/lib/services/appointment';
import { verifyCronAuth } from '@/lib/cron-auth';
import { acquireCronLock, releaseCronLock } from '@/lib/cron-lock';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const authError = verifyCronAuth(request);
  if (authError) return authError;

  const lock = await acquireCronLock('cleanup-pending', 120);
  if (!lock) {
    logger.warn('Cron skipped — already running', { cron: 'cleanup-pending' });
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    const result = await cleanupExpiredPendingAppointments(30);
    logger.info('Cleanup pending completed', { cron: 'cleanup-pending', canceled: result.canceled });
    return NextResponse.json({ ok: true, canceled: result.canceled });
  } catch (err) {
    logger.error('Cleanup pending failed', { cron: 'cleanup-pending', error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  } finally {
    await releaseCronLock('cleanup-pending', lock);
  }
}
