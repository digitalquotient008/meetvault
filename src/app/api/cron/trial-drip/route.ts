import { NextRequest, NextResponse } from 'next/server';
import { processTrialDripSequence } from '@/lib/services/lifecycle-emails';
import { verifyCronAuth } from '@/lib/cron-auth';

export async function GET(request: NextRequest) {
  const authError = verifyCronAuth(request);
  if (authError) return authError;

  try {
    const dripEmails = await processTrialDripSequence();
    console.log(`[cron/trial-drip] Sent ${dripEmails} drip email(s)`);
    return NextResponse.json({ ok: true, dripEmails });
  } catch (err) {
    console.error('[cron/trial-drip] Error:', err);
    return NextResponse.json({ error: 'Trial drip processing failed' }, { status: 500 });
  }
}
