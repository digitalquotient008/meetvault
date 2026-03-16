import { prisma } from '@/lib/db';

export type BarberEarningRow = {
  barberProfileId: string;
  barberName: string;
  completedCount: number;
  totalEarnings: number;
};

export async function getBarberEarnings(
  shopId: string,
  from: Date,
  to: Date
): Promise<BarberEarningRow[]> {
  const appointments = await prisma.appointment.findMany({
    where: {
      shopId,
      status: 'COMPLETED',
      startDateTime: { gte: from, lte: to },
    },
    include: {
      barberProfile: true,
      payments: { where: { status: 'SUCCEEDED' } },
    },
  });

  const byBarber = new Map<string, { name: string; count: number; total: number }>();
  for (const apt of appointments) {
    const id = apt.barberProfileId;
    const existing = byBarber.get(id);
    const paid = apt.payments.reduce((s, p) => s + Number(p.amount), 0);
    const earnings = paid > 0 ? paid : Number(apt.totalAmount ?? apt.subtotal ?? 0);
    if (existing) {
      existing.count += 1;
      existing.total += earnings;
    } else {
      byBarber.set(id, {
        name: apt.barberProfile.displayName,
        count: 1,
        total: earnings,
      });
    }
  }

  return Array.from(byBarber.entries()).map(([barberProfileId, data]) => ({
    barberProfileId,
    barberName: data.name,
    completedCount: data.count,
    totalEarnings: data.total,
  }));
}

export function toEarningsCsv(rows: BarberEarningRow[]): string {
  const header = 'Barber,Completed Appointments,Total Earnings';
  const lines = rows.map(
    (r) => `${r.barberName},${r.completedCount},${r.totalEarnings.toFixed(2)}`
  );
  return [header, ...lines].join('\n');
}
