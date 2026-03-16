/**
 * Client for the MeetingVault backend API (consultslot).
 * Used when MEETINGVAULT_API_URL is set; otherwise the app uses Prisma directly.
 */

import { env } from '@/lib/env';

const baseUrl = env.MEETINGVAULT_API_URL?.replace(/\/$/, '');

export type MvShopFromApi = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  phone: string | null;
  email: string | null;
  timezone: string;
  depositRequired: boolean;
  depositType: string | null;
  depositValue: number | null;
  tippingEnabled: boolean;
  services: { id: string; name: string; description: string | null; durationMin: number; price: number; depositEligible: boolean; category: string | null; isActive: boolean }[];
  barberProfiles: { id: string; displayName: string; bio: string | null; photoUrl: string | null; isBookable: boolean }[];
};

export function isMeetingVaultBackendEnabled(): boolean {
  return typeof baseUrl === 'string' && baseUrl.length > 0;
}

export async function fetchShopBySlug(slug: string): Promise<MvShopFromApi | null> {
  if (!baseUrl) return null;
  const url = `${baseUrl}/api/v1/mv/shops/by-slug/${encodeURIComponent(slug)}`;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (env.MEETINGVAULT_API_KEY) {
    headers['X-API-Key'] = env.MEETINGVAULT_API_KEY;
  }
  const res = await fetch(url, { headers, next: { revalidate: 60 } });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`MeetingVault API error: ${res.status}`);
  }
  const data = await res.json();
  return data as MvShopFromApi;
}
