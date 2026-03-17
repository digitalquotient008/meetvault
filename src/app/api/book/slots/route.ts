import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSlots } from '@/lib/services/availability';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // 60 requests / minute per IP — prevents slot-scraping abuse
  if (!checkRateLimit(getClientIp(request), 60, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const shopId = searchParams.get('shopId');
  const serviceId = searchParams.get('serviceId');
  const barberProfileId = searchParams.get('barberProfileId') || null;
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');

  if (!shopId || !serviceId || !dateFrom || !dateTo) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  const parsedFrom = new Date(dateFrom);
  const parsedTo = new Date(dateTo);
  if (isNaN(parsedFrom.getTime()) || isNaN(parsedTo.getTime())) {
    return NextResponse.json({ error: 'Invalid date params' }, { status: 400 });
  }
  if (parsedTo <= parsedFrom) {
    return NextResponse.json({ error: 'dateTo must be after dateFrom' }, { status: 400 });
  }

  try {
    const slots = await getAvailableSlots({
      shopId,
      barberProfileId,
      serviceId,
      dateFrom: parsedFrom,
      dateTo: parsedTo,
    });
    return NextResponse.json({
      slots: slots.map((s) => ({ start: s.start.toISOString(), barberProfileId: s.barberProfileId })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to get slots' },
      { status: 500 }
    );
  }
}
