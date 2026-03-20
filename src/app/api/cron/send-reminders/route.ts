import { NextRequest, NextResponse } from 'next/server';
import { sendDueReminders, sendTrialEndingReminders } from '@/lib/services/reminders';
import { verifyCronAuth } from '@/lib/cron-auth';
import { acquireCronLock, releaseCronLock } from '@/lib/cron-lock';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const authError = verifyCronAuth(request);
  if (authError) return authError;

  const lock = await acquireCronLock('send-reminders', 120);
  if (!lock) {
    logger.warn('Cron skipped — already running', { cron: 'send-reminders' });
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    const [result, trialReminders] = await Promise.all([
      sendDueReminders(),
      sendTrialEndingReminders(),
    ]);
    logger.info('Reminders sent', { cron: 'send-reminders', sent24h: result.sent24h, sent1h: result.sent1h, trialReminders });
    return NextResponse.json({ ok: true, ...result, trialReminders });
  } catch (err) {
    logger.error('Reminders failed', { cron: 'send-reminders', error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'Reminder send failed' }, { status: 500 });
  } finally {
    await releaseCronLock('send-reminders', lock);
  }
}
