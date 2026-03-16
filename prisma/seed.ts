import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const shop = await prisma.shop.upsert({
    where: { slug: 'demo-shop' },
    update: {},
    create: {
      name: 'Demo Barbershop',
      slug: 'demo-shop',
      timezone: 'America/New_York',
      email: 'demo@meetingvault.app',
      depositRequired: false,
      tippingEnabled: true,
    },
  });

  const user = await prisma.user.upsert({
    where: { authProviderId: 'clerk-demo-owner' },
    update: {},
    create: {
      authProviderId: 'clerk-demo-owner',
      email: 'owner@demo.meetingvault.app',
      firstName: 'Demo',
      lastName: 'Owner',
    },
  });

  await prisma.membership.upsert({
    where: { shopId_userId: { shopId: shop.id, userId: user.id } },
    update: {},
    create: { shopId: shop.id, userId: user.id, role: 'OWNER' },
  });

  const barber = await prisma.barberProfile.upsert({
    where: { shopId_userId: { shopId: shop.id, userId: user.id } },
    update: {},
    create: {
      shopId: shop.id,
      userId: user.id,
      displayName: 'Demo Barber',
      isBookable: true,
    },
  });

  const existingRule = await prisma.availabilityRule.findFirst({
    where: { shopId: shop.id, barberProfileId: barber.id },
  });
  if (!existingRule) {
    await prisma.availabilityRule.create({
      data: {
        shopId: shop.id,
        barberProfileId: barber.id,
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
      },
    });
  }

  let service = await prisma.service.findFirst({
    where: { shopId: shop.id, name: 'Haircut' },
  });
  if (!service) {
    service = await prisma.service.create({
      data: {
        shopId: shop.id,
        name: 'Haircut',
        durationMin: 30,
        price: 25,
        isActive: true,
      },
    });
  }

  const existingCustomer = await prisma.customer.findFirst({
    where: { shopId: shop.id, email: 'jane@example.com' },
  });
  if (!existingCustomer) {
    await prisma.customer.create({
      data: {
        shopId: shop.id,
        firstName: 'Jane',
        lastName: 'Client',
        email: 'jane@example.com',
      },
    });
  }

  console.log('Seed complete. Demo shop:', shop.slug);
  console.log('Booking URL: /book/demo-shop');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
