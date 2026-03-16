function normalizeUrl(raw: string): string {
  const trimmed = raw.replace(/\/$/, '');
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `https://${trimmed}`;
}

const raw = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const APP_URL = normalizeUrl(raw);
