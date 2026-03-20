import { NextRequest, NextResponse } from 'next/server';
import { processAutoNoShows } from '@/lib/services/auto-noshow';
import { verifyCronAuth } from '@/lib/cron-auth';

export async function GET(request: NextRequest) {
  const authError = verifyCronAuth(request);
  if (authError) return authError;

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
