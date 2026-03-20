import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSlots } from '@/lib/services/availability';
import { authenticateApiRequest, corsHeaders } from '@/lib/api-auth';

export async function OPTIONS() {
  return NextResponse.json(null, { headers: corsHeaders() });
}

/**
 * GET /api/v1/availability?serviceId=...&dateFrom=...&dateTo=...&barberProfileId=...
 * Returns available time slots.
 */
export async function GET(request: NextRequest) {
  const auth = await authenticateApiRequest(request);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get('serviceId');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const barberProfileId = searchParams.get('barberProfileId') || null;

  if (!serviceId || !dateFrom || !dateTo) {
    return NextResponse.json(
      { error: 'Missing required params: serviceId, dateFrom, dateTo' },
      { status: 400, headers: corsHeaders() },
    );
  }

  const parsedFrom = new Date(dateFrom);
  const parsedTo = new Date(dateTo);
  if (isNaN(parsedFrom.getTime()) || isNaN(parsedTo.getTime())) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400, headers: corsHeaders() });
  }

  try {
    const slots = await getAvailableSlots({
      shopId: auth.shopId,
      serviceId,
      barberProfileId,
      dateFrom: parsedFrom,
      dateTo: parsedTo,
    });

    return NextResponse.json(
      {
        slots: slots.map((s) => ({
          start: s.start.toISOString(),
          barberProfileId: s.barberProfileId,
        })),
      },
      { headers: corsHeaders() },
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch availability' },
      { status: 500, headers: corsHeaders() },
    );
  }
}
