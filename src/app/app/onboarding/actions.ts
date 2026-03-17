'use server';

import { createShop } from '@/lib/services/shop';
import { createService } from '@/lib/services/service';
import { createBarberProfile } from '@/lib/services/barber';
import { setAvailabilityRules } from '@/lib/services/availability';
import { createSubscriptionCheckout } from '@/lib/services/subscription';
import { prisma } from '@/lib/db';

export async function createShopAction(userId: string, data: { name: string; slug: string; timezone?: string }) {
  return createShop(userId, {
    name: data.name,
    slug: data.slug,
    timezone: data.timezone ?? 'America/New_York',
    country: 'US',
    depositRequired: false,
    tippingEnabled: true,
  });
}

export async function addServiceAction(shopId: string, data: { name: string; durationMin: number; price: number }) {
  return createService(shopId, { name: data.name, durationMin: data.durationMin, price: data.price, depositEligible: false });
}

export async function addBulkServicesAction(
  shopId: string,
  services: { name: string; durationMin: number; price: number; category?: string }[],
) {
  const results = await Promise.all(
    services.map((s) =>
      createService(shopId, {
        name: s.name,
        durationMin: s.durationMin,
        price: s.price,
        depositEligible: false,
        category: s.category,
      }),
    ),
  );
  return results;
}

export async function addStaffAction(shopId: string, userId: string, data: { displayName: string }) {
  return createBarberProfile(shopId, userId, { displayName: data.displayName });
}

export async function startSubscriptionAction(shopId: string, ownerEmail: string) {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { name: true },
  });
  if (!shop) throw new Error('Shop not found');

  const { url } = await createSubscriptionCheckout({
    shopId,
    shopName: shop.name,
    ownerEmail,
  });
  return { url };
}

export async function setHoursAction(
  shopId: string,
  barberProfileId: string,
  rules?: Array<{ dayOfWeek: number; startTime: string; endTime: string }>,
) {
  const finalRules = rules ?? [1, 2, 3, 4, 5].map((dayOfWeek) => ({
    dayOfWeek,
    startTime: '09:00',
    endTime: '17:00',
  }));
  return setAvailabilityRules(shopId, barberProfileId, finalRules);
}
