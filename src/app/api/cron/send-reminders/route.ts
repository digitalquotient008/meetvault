import { NextRequest, NextResponse } from 'next/server';
import { sendDueReminders, sendTrialEndingReminders } from '@/lib/services/reminders';
import { verifyCronAuth } from '@/lib/cron-auth';

export async function GET(request: NextRequest) {
  const authError = verifyCronAuth(request);
  if (authError) return authError;

  try {
    const [result, trialReminders] = await Promise.all([
      sendDueReminders(),
      sendTrialEndingReminders(),
    ]);
    console.log(
      `[cron/send-reminders] Sent ${result.sent24h} 24h, ${result.sent1h} 1h, ${trialReminders} trial-ending`,
    );
    return NextResponse.json({ ok: true, ...result, trialReminders });
  } catch (err) {
    console.error('[cron/send-reminders] Error:', err);
    return NextResponse.json({ error: 'Reminder send failed' }, { status: 500 });
  }
}
