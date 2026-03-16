import { requireShopAccess } from '@/lib/auth';
import { getShopById } from '@/lib/services/shop';

export default async function ShopSettingsPage() {
  const { shopId } = await requireShopAccess();
  const shop = await getShopById(shopId);
  if (!shop) return null;

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Shop settings</h1>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <p><span className="text-slate-400">Name:</span> <span className="text-white">{shop.name}</span></p>
        <p><span className="text-slate-400">Booking URL:</span> <span className="text-amber-400">/book/{shop.slug}</span></p>
        <p><span className="text-slate-400">Timezone:</span> <span className="text-white">{shop.timezone}</span></p>
      </div>
    </div>
  );
}
