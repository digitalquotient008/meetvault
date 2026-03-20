import { requireShopAccess } from '@/lib/auth';
import { getShopById } from '@/lib/services/shop';
import { Globe, Clock, Link as LinkIcon } from 'lucide-react';
import NoShowFeeForm from './NoShowFeeForm';
import CancellationPolicyForm from './CancellationPolicyForm';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';

export default async function ShopSettingsPage() {
  const { shopId } = await requireShopAccess();
  const shop = await getShopById(shopId);
  if (!shop) return null;

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-8">
      <PageHeader
        title="Shop settings"
        description="Manage your shop info, fees, and cancellation policy"
      />

      {/* Basic info */}
      <Card padding="none">
        <div className="px-6 py-4 border-b border-slate-800/50">
          <h2 className="text-white font-semibold">Shop info</h2>
        </div>
        <div className="divide-y divide-slate-800/50">
          {[
            { icon: Globe, label: 'Shop name', value: <span className="text-white">{shop.name}</span> },
            { icon: LinkIcon, label: 'Booking URL', value: <span className="text-amber-400">/book/{shop.slug}</span> },
            { icon: Clock, label: 'Timezone', value: <span className="text-white">{shop.timezone}</span> },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-slate-500" />
                </div>
                <span className="text-slate-400 text-sm">{label}</span>
              </div>
              <span className="text-sm font-medium">{value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* No-show fee */}
      <Card padding="none">
        <div className="px-6 py-4 border-b border-slate-800/50">
          <h2 className="text-white font-semibold">No-show fee</h2>
          <p className="text-slate-500 text-sm mt-1">
            Charge customers who miss their appointment without canceling.
          </p>
        </div>
        <div className="px-6 py-5">
          <NoShowFeeForm
            shopId={shopId}
            currentFee={shop.noShowFeeAmount ? Number(shop.noShowFeeAmount) : null}
            currentRequired={shop.cardRequiredForBooking ?? false}
          />
        </div>
      </Card>

      {/* Cancellation policy */}
      <Card padding="none">
        <div className="px-6 py-4 border-b border-slate-800/50">
          <h2 className="text-white font-semibold">Cancellation policy</h2>
          <p className="text-slate-500 text-sm mt-1">
            Set a free-cancellation window and choose what fee applies when customers cancel within it.
          </p>
        </div>
        <div className="px-6 py-5">
          <CancellationPolicyForm
            shopId={shopId}
            current={{
              cancellationWindowHours: shop.cancellationWindowHours ?? null,
              cancellationFeeType: shop.cancellationFeeType ?? null,
              cancellationFeeValue: shop.cancellationFeeValue ? Number(shop.cancellationFeeValue) : null,
              cancellationPolicy: shop.cancellationPolicy ?? null,
            }}
          />
        </div>
      </Card>
    </div>
  );
}
