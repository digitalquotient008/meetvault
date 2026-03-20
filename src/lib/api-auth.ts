import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/services/api-keys';
import { prisma } from '@/lib/db';

/**
 * Authenticate a public API request using Bearer token (API key).
 * Validates both the API key AND the shop's subscription status.
 *
 * Returns the shopId if valid, or an error response:
 * - 401 if key is missing/invalid/revoked
 * - 403 if subscription is inactive (canceled, expired, unpaid)
 */
export async function authenticateApiRequest(
  request: NextRequest,
): Promise<{ shopId: string } | NextResponse> {
  const auth = request.headers.get('authorization');

  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid Authorization header. Use: Bearer mv_live_...' },
      { status: 401, headers: corsHeaders() },
    );
  }

  const apiKey = auth.slice(7);
  const shopId = await validateApiKey(apiKey);

  if (!shopId) {
    return NextResponse.json(
      { error: 'Invalid or revoked API key' },
      { status: 401, headers: corsHeaders() },
    );
  }

  // Verify the shop has an active subscription
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { subscriptionStatus: true },
  });

  const status = shop?.subscriptionStatus;
  if (!status || !['active', 'trialing'].includes(status)) {
    return NextResponse.json(
      {
        error: 'Subscription inactive. Please renew your MeetVault subscription to use the API.',
        code: 'SUBSCRIPTION_INACTIVE',
      },
      { status: 403, headers: corsHeaders() },
    );
  }

  return { shopId };
}

/** Standard CORS headers for public API */
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}
