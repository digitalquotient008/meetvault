import { NextRequest, NextResponse } from 'next/server';
import { processAutoNoShows } from '@/lib/services/auto-noshow';
import { verifyCronAuth } from '@/lib/cron-auth';
import { acquireCronLock, releaseCronLock } from '@/lib/cron-lock';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const authError = verifyCronAuth(request);
  if (authError) return authError;

  const lock = await acquireCronLock('auto-noshow', 120);
  if (!lock) {
    logger.warn('Cron skipped — already running', { cron: 'auto-noshow' });
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    const result = await processAutoNoShows();
    logger.info('Auto no-show processed', { cron: 'auto-noshow', ...result });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    logger.error('Auto no-show failed', { cron: 'auto-noshow', error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'Auto no-show processing failed' }, { status: 500 });
  } finally {
    await releaseCronLock('auto-noshow', lock);
  }
}
