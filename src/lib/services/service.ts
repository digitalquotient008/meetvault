import { prisma } from '@/lib/db';
import type { CreateServiceInput, UpdateServiceInput } from '@/lib/validators/service';
import { Decimal } from '@prisma/client/runtime/library';

export async function createService(shopId: string, input: CreateServiceInput) {
  return prisma.service.create({
    data: {
      shopId,
      name: input.name,
      description: input.description ?? null,
      durationMin: input.durationMin,
      price: new Decimal(input.price),
      depositEligible: input.depositEligible ?? false,
      category: input.category ?? null,
    },
  });
}

export async function updateService(shopId: string, serviceId: string, input: UpdateServiceInput) {
  const data: Record<string, unknown> = { ...input };
  if (input.price != null) data.price = new Decimal(input.price);
  return prisma.service.updateMany({
    where: { id: serviceId, shopId },
    data: data as Parameters<typeof prisma.service.updateMany>[0]['data'],
  });
}

export async function listServices(shopId: string) {
  return prisma.service.findMany({
    where: { shopId },
    orderBy: { name: 'asc' },
  });
}
