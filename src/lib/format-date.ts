import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

/**
 * Format a Date (UTC) for display in the shop's timezone.
 */
export function fmtDateTime(date: Date | string, tz: string): string {
  return formatInTimeZone(new Date(date), tz, 'MMM d, yyyy h:mm a');
}

export function fmtTime(date: Date | string, tz: string): string {
  return formatInTimeZone(new Date(date), tz, 'h:mm a');
}

export function fmtDate(date: Date | string, tz: string): string {
  return formatInTimeZone(new Date(date), tz, 'MMM d, yyyy');
}

/**
 * Get the start of "today" in a given timezone, returned as a UTC Date.
 * Useful for querying appointments for "today" relative to the shop.
 */
export function startOfDayInTz(tz: string): Date {
  const nowInTz = formatInTimeZone(new Date(), tz, 'yyyy-MM-dd');
  return fromZonedTime(`${nowInTz}T00:00:00`, tz);
}

export function endOfDayInTz(tz: string): Date {
  const nowInTz = formatInTimeZone(new Date(), tz, 'yyyy-MM-dd');
  return fromZonedTime(`${nowInTz}T23:59:59.999`, tz);
}

/**
 * Convert midnight of a given date string (yyyy-MM-dd) in a timezone to UTC.
 */
export function dateStartInTz(dateStr: string, tz: string): Date {
  return fromZonedTime(`${dateStr}T00:00:00`, tz);
}

export function dateEndInTz(dateStr: string, tz: string): Date {
  return fromZonedTime(`${dateStr}T23:59:59.999`, tz);
}
