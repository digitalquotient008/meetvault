import { requireShopAccess } from '@/lib/auth';
import { listServices } from '@/lib/services/service';

export default async function ServicesPage() {
  const { shopId } = await requireShopAccess();
  const services = await listServices(shopId);

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Services</h1>
      <div className="grid gap-4">
        {services.map((s) => (
          <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="font-medium text-white">{s.name}</p>
              <p className="text-sm text-slate-400">{s.durationMin} min · ${Number(s.price)}</p>
            </div>
          </div>
        ))}
        {services.length === 0 && <p className="text-slate-500">No services yet. Add some in onboarding or settings.</p>}
      </div>
    </div>
  );
}
