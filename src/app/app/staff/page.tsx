import { requireShopAccess } from '@/lib/auth';
import { listBarberProfiles } from '@/lib/services/barber';

export default async function StaffPage() {
  const { shopId } = await requireShopAccess();
  const staff = await listBarberProfiles(shopId);

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Staff</h1>
      <div className="grid gap-4">
        {staff.map((b) => (
          <div key={b.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
            <p className="font-medium text-white">{b.displayName}</p>
            <span className="text-sm text-slate-400">{b.isBookable ? 'Bookable' : 'Not bookable'}</span>
          </div>
        ))}
        {staff.length === 0 && <p className="text-slate-500">No staff yet. Add yourself in onboarding.</p>}
      </div>
    </div>
  );
}
