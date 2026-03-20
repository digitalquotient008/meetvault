import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyCronAuth } from '@/lib/cron-auth';
import { logger } from '@/lib/logger';

const RETENTION_DAYS = 90;

/**
 * Cron endpoint — deletes audit logs older than 90 days.
 *
 * Runs weekly on Sunday at 3am UTC (see vercel.json → crons).
 * Keeps the database lean and avoids unbounded growth.
 */
export async function GET(request: NextRequest) {
  const authError = verifyCronAuth(request);
  if (authError) return authError;

  try {
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

    const result = await prisma.auditLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });

    logger.info('Audit log cleanup completed', { cron: 'cleanup-audit-logs', deleted: result.count, retentionDays: RETENTION_DAYS });
    return NextResponse.json({ ok: true, deleted: result.count, retentionDays: RETENTION_DAYS });
  } catch (err) {
    logger.error('Audit log cleanup failed', { cron: 'cleanup-audit-logs', error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'Audit log cleanup failed' }, { status: 500 });
  }
}
