import { addMinutes, isWithinInterval } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { prisma } from '@/lib/db';

const SLOT_INTERVAL_MIN = 15;

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function isTimeInRange(
  slotStartMinutes: number,
  slotEndMinutes: number,
  rangeStart: string,
  rangeEnd: string
): boolean {
  const start = timeToMinutes(rangeStart);
  const end = timeToMinutes(rangeEnd);
  return slotStartMinutes >= start && slotEndMinutes <= end;
}

export async function getAvailableSlots(params: {
  shopId: string;
  barberProfileId: string | null;
  serviceId: string;
  dateFrom: Date;
  dateTo: Date;
}): Promise<Array<{ start: Date; barberProfileId: string }>> {
  const { shopId, barberProfileId, serviceId, dateFrom, dateTo } = params;
  const shop = await prisma.shop.findUnique({ where: { id: shopId } });
  if (!shop) return [];

  const service = await prisma.service.findFirst({
    where: { id: serviceId, shopId, isActive: true },
  });
  if (!service) return [];

  const barbers = barberProfileId
    ? await prisma.barberProfile.findMany({
        where: { id: barberProfileId, shopId, isBookable: true },
      })
    : await prisma.barberProfile.findMany({
        where: { shopId, isBookable: true },
      });

  const timezone = shop.timezone;
  const slots: Array<{ start: Date; barberProfileId: string }> = [];
  const durationMin = service.durationMin;

  for (const barber of barbers) {
    const [rules, timeOffs] = await Promise.all([
      prisma.availabilityRule.findMany({ where: { barberProfileId: barber.id, isActive: true } }),
      prisma.timeOff.findMany({
        where: {
          barberProfileId: barber.id,
          endDateTime: { gte: dateFrom },
          startDateTime: { lte: dateTo },
        },
      }),
    ]);

    let current = new Date(dateFrom);
    while (current < dateTo) {
      const dayOfWeek = parseInt(formatInTimeZone(current, timezone, 'e'), 10) % 7;
      const rule = rules.find((r) => r.dayOfWeek === dayOfWeek);
      if (!rule) {
        current = addMinutes(current, SLOT_INTERVAL_MIN);
        continue;
      }

      const slotStartTimeStr = formatInTimeZone(current, timezone, 'HH:mm');
      const slotEnd = addMinutes(current, durationMin + (barber.serviceBufferBeforeMin ?? 0) + (barber.serviceBufferAfterMin ?? 0));
      const slotEndTimeStr = formatInTimeZone(slotEnd, timezone, 'HH:mm');
      const slotStartMin = timeToMinutes(slotStartTimeStr);
      const slotEndMin = timeToMinutes(slotEndTimeStr);
      const inWindow = isTimeInRange(slotStartMin, slotEndMin, rule.startTime, rule.endTime);
      const offBlocked = timeOffs.some(
        (t) =>
          isWithinInterval(current, { start: t.startDateTime, end: t.endDateTime }) ||
          isWithinInterval(slotEnd, { start: t.startDateTime, end: t.endDateTime })
      );
      if (inWindow && !offBlocked) {
        const overlapping = await prisma.appointment.findFirst({
          where: {
            barberProfileId: barber.id,
            status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
            startDateTime: { lt: slotEnd },
            endDateTime: { gt: current },
          },
        });
        if (!overlapping) {
          slots.push({ start: new Date(current), barberProfileId: barber.id });
        }
      }
      current = addMinutes(current, SLOT_INTERVAL_MIN);
    }
  }

  return slots.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export async function setAvailabilityRules(shopId: string, barberProfileId: string, rules: Array<{ dayOfWeek: number; startTime: string; endTime: string }>) {
  await prisma.$transaction(async (tx) => {
    await tx.availabilityRule.deleteMany({
      where: { shopId, barberProfileId },
    });
    if (rules.length > 0) {
      await tx.availabilityRule.createMany({
        data: rules.map((r) => ({
          shopId,
          barberProfileId,
          dayOfWeek: r.dayOfWeek,
          startTime: r.startTime,
          endTime: r.endTime,
        })),
      });
    }
  });
}

export async function createTimeOff(
  shopId: string,
  data: { barberProfileId: string; startDateTime: Date; endDateTime: Date; reason?: string }
) {
  return prisma.timeOff.create({
    data: {
      shopId,
      barberProfileId: data.barberProfileId,
      startDateTime: data.startDateTime,
      endDateTime: data.endDateTime,
      reason: data.reason ?? null,
    },
  });
}
