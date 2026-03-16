import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSlots } from '@/lib/services/availability';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shopId = searchParams.get('shopId');
  const serviceId = searchParams.get('serviceId');
  const barberProfileId = searchParams.get('barberProfileId') || null;
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');

  if (!shopId || !serviceId || !dateFrom || !dateTo) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  try {
    const slots = await getAvailableSlots({
      shopId,
      barberProfileId,
      serviceId,
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
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
