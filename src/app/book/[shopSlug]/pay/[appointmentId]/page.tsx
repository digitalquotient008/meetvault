import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import PayForm from './PayForm';

type Props = {
  params: Promise<{ shopSlug: string; appointmentId: string }>;
  searchParams: Promise<{ type?: string }>;
};

export default async function PayPage({ params, searchParams }: Props) {
  const { shopSlug, appointmentId } = await params;
  const { type } = await searchParams;
  const shop = await prisma.shop.findUnique({ where: { slug: shopSlug } });
  if (!shop) notFound();
  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, shopId: shop.id },
    include: { customer: true, barberProfile: true, appointmentServices: true },
  });
  if (!appointment || appointment.status === 'CANCELED') notFound();

  const payType = type === 'full' ? 'FULL' : 'DEPOSIT';
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <a
          href={`/book/${shopSlug}/confirm/${appointmentId}`}
          className="text-sm text-slate-400 hover:text-white mb-4 inline-block"
        >
          ← Back
        </a>
        <h1 className="text-xl font-bold text-white mb-2">{shop.name}</h1>
        <p className="text-slate-400 text-sm mb-4">
          {payType === 'DEPOSIT' ? 'Pay deposit' : 'Pay in full'} · {appointment.appointmentServices[0]?.serviceNameSnapshot}
        </p>
        <PayForm shopSlug={shopSlug} appointmentId={appointmentId} payType={payType} />
      </div>
    </div>
  );
}
