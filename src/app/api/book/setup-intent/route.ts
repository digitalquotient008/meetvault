import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createCardSetupIntent } from '@/lib/services/card-on-file';

export async function POST(req: NextRequest) {
  try {
    const { appointmentId } = await req.json();
    if (!appointmentId) {
      return NextResponse.json({ error: 'appointmentId required' }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { customerId: true, shopId: true },
    });
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const { clientSecret } = await createCardSetupIntent({
      customerId: appointment.customerId,
      shopId: appointment.shopId,
    });

    return NextResponse.json({ clientSecret });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create setup intent';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
