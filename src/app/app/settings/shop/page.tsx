import { requireShopAccess } from '@/lib/auth';
import { getShopById } from '@/lib/services/shop';
import { Globe, Clock, Link as LinkIcon } from 'lucide-react';
import NoShowFeeForm from './NoShowFeeForm';
import CancellationPolicyForm from './CancellationPolicyForm';

export default async function ShopSettingsPage() {
  const { shopId } = await requireShopAccess();
  const shop = await getShopById(shopId);
  if (!shop) return null;

  return (
    <div className="p-6 lg:p-8 max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Shop settings</h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage your shop info, fees, and cancellation policy</p>
      </div>

      {/* Basic info */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="text-white font-semibold">Shop info</h2>
        </div>
        <div className="divide-y divide-slate-800/60">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 text-slate-400" />
              </div>
              <span className="text-slate-400 text-sm">Shop name</span>
            </div>
            <span className="text-white text-sm font-medium">{shop.name}</span>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                <LinkIcon className="w-4 h-4 text-slate-400" />
              </div>
              <span className="text-slate-400 text-sm">Booking URL</span>
            </div>
            <span className="text-amber-400 text-sm font-medium">/book/{shop.slug}</span>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <span className="text-slate-400 text-sm">Timezone</span>
            </div>
            <span className="text-white text-sm font-medium">{shop.timezone}</span>
          </div>
        </div>
      </div>

      {/* No-show fee */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="text-white font-semibold">No-show fee</h2>
          <p className="text-slate-500 text-sm mt-1">
            Charge customers who miss their appointment without canceling. A card on file will be collected at booking time.
          </p>
        </div>
        <div className="px-6 py-5">
          <NoShowFeeForm
            shopId={shopId}
            currentFee={shop.noShowFeeAmount ? Number(shop.noShowFeeAmount) : null}
            currentRequired={shop.cardRequiredForBooking ?? false}
          />
        </div>
      </div>

      {/* Cancellation policy */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="text-white font-semibold">Cancellation policy</h2>
          <p className="text-slate-500 text-sm mt-1">
            Set a free-cancellation window and choose what fee (if any) applies when customers cancel within it.
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
      </div>
    </div>
  );
}
