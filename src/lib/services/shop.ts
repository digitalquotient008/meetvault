import { prisma } from '@/lib/db';
import type { CreateShopInput, UpdateShopInput } from '@/lib/validators/shop';
import { Decimal } from '@prisma/client/runtime/library';

export type ShopForBooking = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  depositRequired: boolean;
  depositType?: string | null;
  depositValue?: number | null;
  services: { id: string; name: string; durationMin: number; price: number }[];
  barberProfiles: { id: string; displayName: string }[];
};

export async function createShop(ownerUserId: string, input: CreateShopInput) {
  const existing = await prisma.shop.findUnique({ where: { slug: input.slug } });
  if (existing) throw new Error('This booking URL is already taken. Choose another.');

  const shop = await prisma.$transaction(async (tx) => {
    const s = await tx.shop.create({
      data: {
        name: input.name,
        slug: input.slug,
        timezone: input.timezone,
        email: input.email || null,
        phone: input.phone || null,
        addressLine1: input.addressLine1 || null,
        city: input.city || null,
        state: input.state || null,
        postalCode: input.postalCode || null,
        country: input.country,
        cancellationPolicy: input.cancellationPolicy || null,
        depositRequired: input.depositRequired ?? false,
        depositType: input.depositType ?? null,
        depositValue: input.depositValue != null ? new Decimal(input.depositValue) : null,
        tippingEnabled: input.tippingEnabled ?? true,
        brandPrimaryColor: input.brandPrimaryColor || null,
        brandSecondaryColor: input.brandSecondaryColor || null,
      },
    });
    await tx.membership.create({
      data: {
        shopId: s.id,
        userId: ownerUserId,
        role: 'OWNER',
      },
    });
    return s;
  });
  return shop;
}

export async function updateShop(shopId: string, input: UpdateShopInput) {
  const data: Record<string, unknown> = { ...input };
  if (input.depositValue != null) data.depositValue = new Decimal(input.depositValue);
  return prisma.shop.update({
    where: { id: shopId },
    data: data as Parameters<typeof prisma.shop.update>[0]['data'],
  });
}

export async function getShopBySlug(slug: string): Promise<ShopForBooking | null> {
  const row = await prisma.shop.findUnique({
    where: { slug },
    include: {
      services: { where: { isActive: true } },
      barberProfiles: { where: { isBookable: true } },
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logoUrl: row.logoUrl ?? null,
    depositRequired: row.depositRequired ?? false,
    depositType: row.depositType ?? null,
    depositValue: row.depositValue != null ? Number(row.depositValue) : null,
    services: row.services.map((s) => ({
      id: s.id,
      name: s.name,
      durationMin: s.durationMin,
      price: Number(s.price),
    })),
    barberProfiles: row.barberProfiles.map((b) => ({
      id: b.id,
      displayName: b.displayName,
    })),
  };
}

export async function getShopById(shopId: string) {
  return prisma.shop.findUnique({
    where: { id: shopId },
    include: {
      services: { where: { isActive: true } },
      barberProfiles: true,
    },
  });
}
