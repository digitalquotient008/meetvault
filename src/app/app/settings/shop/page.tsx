import { requireShopAccess } from '@/lib/auth';
import { getShopById } from '@/lib/services/shop';
import NoShowFeeForm from './NoShowFeeForm';

export default async function ShopSettingsPage() {
  const { shopId } = await requireShopAccess();
  const shop = await getShopById(shopId);
  if (!shop) return null;

  return (
    <div className="p-6 lg:p-8 max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Shop settings</h1>
      </div>

      {/* Basic info */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-white font-semibold text-lg">Shop info</h2>
        <p><span className="text-slate-400">Name:</span> <span className="text-white">{shop.name}</span></p>
        <p><span className="text-slate-400">Booking URL:</span> <span className="text-amber-400">/book/{shop.slug}</span></p>
        <p><span className="text-slate-400">Timezone:</span> <span className="text-white">{shop.timezone}</span></p>
      </div>

      {/* No-show fee */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-white font-semibold text-lg mb-1">No-show fee</h2>
        <p className="text-slate-400 text-sm mb-5">
          Charge customers who miss their appointment without canceling. A card on file will be collected at booking time.
        </p>
        <NoShowFeeForm
          shopId={shopId}
          currentFee={shop.noShowFeeAmount ? Number(shop.noShowFeeAmount) : null}
          currentRequired={shop.cardRequiredForBooking ?? false}
        />
      </div>
    </div>
  );
}
