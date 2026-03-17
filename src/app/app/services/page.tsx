import { requireShopAccess } from '@/lib/auth';
import { listServices } from '@/lib/services/service';
import { Scissors } from 'lucide-react';

export default async function ServicesPage() {
  const { shopId } = await requireShopAccess();
  const services = await listServices(shopId);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Services</h1>
          <p className="text-slate-400 text-sm mt-0.5">Your service menu and pricing</p>
        </div>
        {services.length > 0 && (
          <span className="text-slate-500 text-sm">{services.length} service{services.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {services.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Scissors className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-slate-400 font-medium mb-1">No services yet</p>
          <p className="text-slate-500 text-sm">Services you add during onboarding or setup will appear here.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Service</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Duration</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                        <Scissors className="w-4 h-4 text-slate-400" />
                      </div>
                      <span className="font-medium text-white">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400">{s.durationMin} min</td>
                  <td className="px-4 py-3.5 text-white font-medium text-right">${Number(s.price).toFixed(2)}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.isActive
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-slate-700/50 text-slate-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
