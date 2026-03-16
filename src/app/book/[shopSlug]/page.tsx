import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getShopBySlug } from '@/lib/services/shop';
import BookingFlow from './BookingFlow';

type Props = { params: Promise<{ shopSlug: string }> };

export async function generateMetadata({ params }: Props) {
  const { shopSlug } = await params;
  const shop = await getShopBySlug(shopSlug);
  if (!shop) return { title: 'Book' };
  return { title: `Book at ${shop.name}` };
}

export default async function BookPage({ params }: Props) {
  const { shopSlug } = await params;
  const shop = await getShopBySlug(shopSlug);
  if (!shop) notFound();

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
