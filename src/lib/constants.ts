const raw = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const APP_URL = raw.replace(/\/$/, '');
