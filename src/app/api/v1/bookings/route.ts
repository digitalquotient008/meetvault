import { NextRequest, NextResponse } from 'next/server';
import { createOrFindCustomer } from '@/lib/services/customer';
import { createAppointment } from '@/lib/services/appointment';
import { authenticateApiRequest, corsHeaders } from '@/lib/api-auth';

export async function OPTIONS() {
  return NextResponse.json(null, { headers: corsHeaders() });
}

/**
 * POST /api/v1/bookings
 * Create a new appointment.
 *
 * Body:
 * {
 *   serviceId: string,
 *   barberProfileId: string,
 *   startDateTime: string (ISO 8601),
 *   customer: {
 *     firstName: string,
 *     lastName: string,
 *     email?: string,
 *     phone?: string
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  const auth = await authenticateApiRequest(request);
  if (auth instanceof NextResponse) return auth;

  let body: {
    serviceId?: string;
    barberProfileId?: string;
    startDateTime?: string;
    customer?: { firstName?: string; lastName?: string; email?: string; phone?: string };
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: corsHeaders() });
  }

  const { serviceId, barberProfileId, startDateTime, customer: customerData } = body;

  if (!serviceId || !barberProfileId || !startDateTime || !customerData?.firstName || !customerData?.lastName) {
    return NextResponse.json(
      { error: 'Missing required fields: serviceId, barberProfileId, startDateTime, customer.firstName, customer.lastName' },
      { status: 400, headers: corsHeaders() },
    );
  }

  const parsedStart = new Date(startDateTime);
  if (isNaN(parsedStart.getTime())) {
    return NextResponse.json({ error: 'Invalid startDateTime format' }, { status: 400, headers: corsHeaders() });
  }

  try {
    const customer = await createOrFindCustomer(auth.shopId, {
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone,
    });

    const appointment = await createAppointment({
      shopId: auth.shopId,
      customerId: customer.id,
      barberProfileId,
      serviceId,
      startDateTime: parsedStart,
      channel: 'ONLINE',
    });

    return NextResponse.json(
      {
        booking: {
          id: appointment?.id,
          status: appointment?.status,
          startDateTime: appointment?.startDateTime?.toISOString(),
          endDateTime: appointment?.endDateTime?.toISOString(),
          confirmationCode: appointment?.confirmationCode,
          bookingUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://meetvault.app'}/book/${auth.shopId}/confirm/${appointment?.id}`,
        },
      },
      { status: 201, headers: corsHeaders() },
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create booking' },
      { status: 422, headers: corsHeaders() },
    );
  }
}
