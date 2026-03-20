'use server';

import { requireShopAccess } from '@/lib/auth';
import { createService, updateService } from '@/lib/services/service';
import { prisma } from '@/lib/db';
import { createServiceSchema, updateServiceSchema } from '@/lib/validators/service';
import { revalidatePath } from 'next/cache';
import { Decimal } from '@prisma/client/runtime/library';

export async function addServiceAction(data: {
  name: string;
  description?: string;
  durationMin: number;
  price: number;
  category?: string;
}) {
  const { shopId } = await requireShopAccess();
  const parsed = createServiceSchema.parse({ ...data, depositEligible: false });
  await createService(shopId, parsed);
  revalidatePath('/app/services');
  return { ok: true };
}

export async function updateServiceAction(
  serviceId: string,
  data: {
    name?: string;
    description?: string;
    durationMin?: number;
    price?: number;
    category?: string;
    isActive?: boolean;
  },
) {
  const { shopId } = await requireShopAccess();
  const parsed = updateServiceSchema.parse(data);

  const updateData: Record<string, unknown> = { ...parsed };
  if (parsed.price != null) updateData.price = new Decimal(parsed.price);

  // Handle isActive separately (not in service validator)
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  await prisma.service.updateMany({
    where: { id: serviceId, shopId },
    data: updateData as Parameters<typeof prisma.service.updateMany>[0]['data'],
  });

  revalidatePath('/app/services');
  return { ok: true };
}

export async function deleteServiceAction(serviceId: string) {
  const { shopId } = await requireShopAccess();

  // Check if service has appointments
  const appointmentCount = await prisma.appointmentService.count({
    where: { serviceId },
  });

  if (appointmentCount > 0) {
    // Soft-delete: deactivate instead
    await prisma.service.updateMany({
      where: { id: serviceId, shopId },
      data: { isActive: false },
    });
  } else {
    await prisma.service.deleteMany({
      where: { id: serviceId, shopId },
    });
  }

  revalidatePath('/app/services');
  return { ok: true };
}
