/**
 * Structured logger for production observability.
 *
 * Outputs JSON in production (parseable by Vercel Log Drains, Datadog, etc.)
 * and human-readable format in development.
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.info('Payment processed', { shopId, amount, paymentId });
 *   logger.error('Payment failed', { shopId, error: err.message });
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

const isProd = process.env.NODE_ENV === 'production';

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  if (isProd) {
    // JSON output for log aggregators
    const output = JSON.stringify(entry);
    if (level === 'error') {
      console.error(output);
    } else if (level === 'warn') {
      console.warn(output);
    } else {
      console.log(output);
    }
  } else {
    // Human-readable for local dev
    const prefix = `[${level.toUpperCase()}]`;
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    if (level === 'error') {
      console.error(`${prefix} ${message}${metaStr}`);
    } else if (level === 'warn') {
      console.warn(`${prefix} ${message}${metaStr}`);
    } else {
      console.log(`${prefix} ${message}${metaStr}`);
    }
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta),
};
