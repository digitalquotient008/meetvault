import { NextRequest, NextResponse } from 'next/server';
import { sendDueReminders, sendTrialEndingReminders } from '@/lib/services/reminders';
import { processTrialDripSequence } from '@/lib/services/lifecycle-emails';

/**
 * Cron endpoint — sends 24-hour and 1-hour appointment reminders.
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
    const [result, trialReminders, dripEmails] = await Promise.all([
      sendDueReminders(),
      sendTrialEndingReminders(),
      processTrialDripSequence(),
    ]);
    console.log(
      `[cron/send-reminders] Sent ${result.sent24h} 24h, ${result.sent1h} 1h, ${trialReminders} trial-ending, ${dripEmails} drip email(s)`,
    );
    return NextResponse.json({ ok: true, ...result, trialReminders, dripEmails });
  } catch (err) {
    console.error('[cron/send-reminders] Error:', err);
    return NextResponse.json({ error: 'Reminder send failed' }, { status: 500 });
  }
}
