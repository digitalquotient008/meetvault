import { NextRequest, NextResponse } from 'next/server';
import { processTrialDripSequence } from '@/lib/services/lifecycle-emails';

/**
 * Cron endpoint — processes trial drip email sequence.
 *
 * Runs daily at 10am UTC (see vercel.json → crons).
 * Sends day 3, 7, 10 emails + trial expired / winback emails.
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
    const dripEmails = await processTrialDripSequence();
    console.log(`[cron/trial-drip] Sent ${dripEmails} drip email(s)`);
    return NextResponse.json({ ok: true, dripEmails });
  } catch (err) {
    console.error('[cron/trial-drip] Error:', err);
    return NextResponse.json({ error: 'Trial drip processing failed' }, { status: 500 });
  }
}
