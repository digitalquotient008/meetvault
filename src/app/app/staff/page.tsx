import Link from 'next/link';
import { requireShopAccess } from '@/lib/auth';
import { listBarberProfiles } from '@/lib/services/barber';
import { prisma } from '@/lib/db';
import { UserCog, Users } from 'lucide-react';

export default async function StaffPage() {
  const { shopId } = await requireShopAccess();
  const [staff, shop] = await Promise.all([
    listBarberProfiles(shopId),
    prisma.shop.findUnique({ where: { id: shopId }, select: { subscriptionStatus: true } }),
  ]);
  const isStarter = shop?.subscriptionStatus === 'active' || shop?.subscriptionStatus === 'trialing';
  const atLimit = isStarter && staff.length >= 1;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Staff</h1>
          <p className="text-slate-400 text-sm mt-0.5">Your team and booking availability</p>
        </div>
        {staff.length > 0 && (
          <span className="text-slate-500 text-sm">{staff.length} member{staff.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {staff.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4">
            <UserCog className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-slate-400 font-medium mb-1">No staff yet</p>
          <p className="text-slate-500 text-sm">Add staff members during onboarding or setup to enable booking.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Booking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {staff.map((b) => {
                const initials = b.displayName
                  .split(' ')
                  .map((w: string) => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
                          <span className="text-amber-400 text-xs font-bold">{initials}</span>
                        </div>
                        <span className="font-medium text-white">{b.displayName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                        b.isBookable
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-slate-700/50 text-slate-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${b.isBookable ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                        {b.isBookable ? 'Bookable' : 'Not bookable'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Upgrade prompt */}
      {atLimit && (
        <div className="mt-6 bg-blue-500/5 border border-blue-500/20 rounded-xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">Need more barbers?</h3>
            <p className="text-slate-400 text-sm mb-3">
              The Starter plan includes 1 staff member. Upgrade to Team for unlimited barbers, per-barber scheduling, commission tracking, and more.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/book/meetingvault"
                className="inline-flex px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/15 rounded-lg text-sm font-medium transition-colors"
              >
                Schedule a Demo
              </Link>
              <Link
                href="/contact?plan=team"
                className="text-slate-400 hover:text-slate-300 text-sm transition-colors"
              >
                or contact sales
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
