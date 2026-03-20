import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/services/api-keys';

/**
 * Authenticate a public API request using Bearer token (API key).
 * Returns the shopId if valid, or a 401 response.
 */
export async function authenticateApiRequest(
  request: NextRequest,
): Promise<{ shopId: string } | NextResponse> {
  const auth = request.headers.get('authorization');

  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid Authorization header. Use: Bearer mv_live_...' },
      { status: 401 },
    );
  }

  const apiKey = auth.slice(7);
  const shopId = await validateApiKey(apiKey);

  if (!shopId) {
    return NextResponse.json(
      { error: 'Invalid or revoked API key' },
      { status: 401 },
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
