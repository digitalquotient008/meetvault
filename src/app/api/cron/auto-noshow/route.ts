import { NextRequest, NextResponse } from 'next/server';
import { processAutoNoShows } from '@/lib/services/auto-noshow';

/**
 * Cron endpoint — auto-detects no-shows and charges the card on file.
 *
 * Finds CONFIRMED appointments whose endDateTime is > 30 min in the past,
 * marks them as NO_SHOW, and charges the no-show fee if configured.
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
    const result = await processAutoNoShows();
    console.log(
      `[cron/auto-noshow] Detected ${result.detected} no-show(s), charged ${result.charged}, errors: ${result.chargeErrors}`,
    );
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error('[cron/auto-noshow] Error:', err);
    return NextResponse.json({ error: 'Auto no-show processing failed' }, { status: 500 });
  }
}
