import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getShopBySlug } from '@/lib/services/shop';
import { prisma } from '@/lib/db';
import BookingFlow from './BookingFlow';

type Props = { params: Promise<{ shopSlug: string }> };

export async function generateMetadata({ params }: Props) {
  const { shopSlug } = await params;
  const shop = await getShopBySlug(shopSlug);
  if (!shop) return { title: 'Book' };
  return {
    title: `Book at ${shop.name}`,
    description: `Book an appointment at ${shop.name}. Pick a service, choose a time, and confirm — takes less than a minute.`,
    openGraph: {
      title: `Book at ${shop.name}`,
      description: `Book your next appointment at ${shop.name}. Online booking powered by MeetVault.`,
    },
    robots: { index: false },
  };
}

export default async function BookPage({ params }: Props) {
  const { shopSlug } = await params;
  const shop = await getShopBySlug(shopSlug);
  if (!shop) notFound();

  // Check subscription — don't allow bookings for canceled/expired shops
  const shopRecord = await prisma.shop.findUnique({
    where: { id: shop.id },
    select: { subscriptionStatus: true },
  });
  const status = shopRecord?.subscriptionStatus;
  const isActive = status === 'active' || status === 'trialing';

  if (!isActive) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <h1 className="text-xl font-bold text-white mb-2">Booking unavailable</h1>
          <p className="text-slate-400 text-sm mb-6">
            Online booking for {shop.name} is currently unavailable. Please contact the shop directly to schedule an appointment.
          </p>
          <Link href="/" className="text-amber-400 hover:text-amber-300 text-sm font-medium">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          {shop.logoUrl && (
            <Image src={shop.logoUrl} alt={shop.name} width={64} height={64} className="h-16 w-16 mx-auto mb-4 rounded-lg object-contain" unoptimized />
          )}
          <h1 className="text-2xl font-bold text-white">{shop.name}</h1>
          <p className="text-slate-400 text-sm mt-1">Book an appointment</p>
        </div>
        <BookingFlow shop={shop} />
      </div>
    </div>
  );
}
