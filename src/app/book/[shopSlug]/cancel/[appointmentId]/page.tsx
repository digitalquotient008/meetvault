import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { fmtDateTime } from '@/lib/format-date';
import { computeRefundPreview } from '@/lib/services/cancellation';
import CancelConfirmClient from './CancelConfirmClient';

type Props = {
  params: Promise<{ shopSlug: string; appointmentId: string }>;
  searchParams: Promise<{ code?: string }>;
};

export default async function CancelPage({ params, searchParams }: Props) {
  const { shopSlug, appointmentId } = await params;
  const { code } = await searchParams;

  const shop = await prisma.shop.findUnique({
    where: { slug: shopSlug },
    select: {
      id: true,
      name: true,
      timezone: true,
      cancellationPolicy: true,
      cancellationWindowHours: true,
      cancellationFeeType: true,
      cancellationFeeValue: true,
    },
  });
  if (!shop) notFound();

  if (!code) {
    return <InvalidLink />;
  }

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, shopId: shop.id, confirmationCode: code },
    include: {
      payments: true,
      barberProfile: true,
      appointmentServices: true,
      customer: true,
    },
  });

  if (!appointment) return <InvalidLink />;

  if (appointment.status === 'CANCELED') {
    return (
      <Shell shopName={shop.name}>
        <p className="text-slate-400 text-center">This appointment has already been canceled.</p>
      </Shell>
    );
  }

  if (appointment.status === 'COMPLETED') {
    return (
      <Shell shopName={shop.name}>
        <p className="text-slate-400 text-center">This appointment is already completed and cannot be canceled.</p>
      </Shell>
    );
  }

  const succeededPayments = appointment.payments
    .filter((p) => p.status === 'SUCCEEDED' && p.type !== 'TIP')
    .map((p) => ({ id: p.id, amount: Number(p.amount), type: p.type }));

  const preview = computeRefundPreview({
    appointmentStart: appointment.startDateTime,
    policy: {
      cancellationWindowHours: shop.cancellationWindowHours,
      cancellationFeeType: shop.cancellationFeeType,
      cancellationFeeValue: shop.cancellationFeeValue ? Number(shop.cancellationFeeValue) : null,
    },
    succeededPayments,
    actor: 'CUSTOMER',
  });

  const serviceName = appointment.appointmentServices[0]?.serviceNameSnapshot ?? 'Service';
  const summary = `${fmtDateTime(appointment.startDateTime, shop.timezone)} · ${serviceName} · ${appointment.barberProfile.displayName}`;

  return (
    <Shell shopName={shop.name}>
      {shop.cancellationPolicy && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 mb-2">
          <p className="font-medium text-white mb-1">Cancellation policy</p>
          <p>{shop.cancellationPolicy}</p>
        </div>
      )}
      <CancelConfirmClient
        appointmentId={appointment.id}
        confirmationCode={code}
        shopName={shopSlug}
        preview={preview}
        appointmentSummary={summary}
      />
    </Shell>
  );
}

function Shell({ shopName, children }: { shopName: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <p className="text-slate-500 text-sm text-center">{shopName}</p>
        {children}
      </div>
    </div>
  );
}

function InvalidLink() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
        <p className="text-white font-semibold">Invalid or expired cancellation link</p>
        <p className="text-slate-400 text-sm">
          Please use the link from your booking confirmation email, or contact the shop directly.
        </p>
      </div>
    </div>
  );
}
