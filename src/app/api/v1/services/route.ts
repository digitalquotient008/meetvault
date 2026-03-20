import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateApiRequest, corsHeaders } from '@/lib/api-auth';

export async function OPTIONS() {
  return NextResponse.json(null, { headers: corsHeaders() });
}

/**
 * GET /api/v1/services
 * Returns all active services for the shop.
 */
export async function GET(request: NextRequest) {
  const auth = await authenticateApiRequest(request);
  if (auth instanceof NextResponse) return auth;

  const services = await prisma.service.findMany({
    where: { shopId: auth.shopId, isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      durationMin: true,
      price: true,
      category: true,
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(
    {
      services: services.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        durationMin: s.durationMin,
        price: Number(s.price),
        category: s.category,
      })),
    },
    { headers: corsHeaders() },
  );
}
