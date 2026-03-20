import { NextRequest, NextResponse } from 'next/server';
import { processTrialDripSequence } from '@/lib/services/lifecycle-emails';
import { verifyCronAuth } from '@/lib/cron-auth';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const authError = verifyCronAuth(request);
  if (authError) return authError;

  try {
    const dripEmails = await processTrialDripSequence();
    logger.info('Trial drip processed', { cron: 'trial-drip', dripEmails });
    return NextResponse.json({ ok: true, dripEmails });
  } catch (err) {
    logger.error('Trial drip failed', { cron: 'trial-drip', error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'Trial drip processing failed' }, { status: 500 });
  }
}
