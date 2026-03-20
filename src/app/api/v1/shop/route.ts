import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateApiRequest, corsHeaders } from '@/lib/api-auth';

export async function OPTIONS() {
  return NextResponse.json(null, { headers: corsHeaders() });
}

/**
 * GET /api/v1/shop
 * Returns basic shop info (name, slug, timezone).
 */
export async function GET(request: NextRequest) {
  const auth = await authenticateApiRequest(request);
  if (auth instanceof NextResponse) return auth;

  const shop = await prisma.shop.findUnique({
    where: { id: auth.shopId },
    select: {
      name: true,
      slug: true,
      timezone: true,
      logoUrl: true,
      depositRequired: true,
      depositType: true,
      depositValue: true,
    },
  });

  if (!shop) {
    return NextResponse.json({ error: 'Shop not found' }, { status: 404, headers: corsHeaders() });
  }

  return NextResponse.json(
    {
      name: shop.name,
      slug: shop.slug,
      timezone: shop.timezone,
      logoUrl: shop.logoUrl,
      deposit: shop.depositRequired
        ? { type: shop.depositType, value: shop.depositValue ? Number(shop.depositValue) : null }
        : null,
    },
    { headers: corsHeaders() },
  );
}
