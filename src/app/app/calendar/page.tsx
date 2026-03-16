import { requireShopAccess } from '@/lib/auth';
import { getAppointmentsForShop } from '@/lib/services/appointment';
import { startOfDay, endOfDay } from 'date-fns';

export default async function CalendarPage() {
  const { shopId } = await requireShopAccess();
  const today = new Date();
  const appointments = await getAppointmentsForShop(shopId, startOfDay(today), endOfDay(today));

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Calendar</h1>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <p className="text-slate-400 text-sm mb-4">Today&apos;s appointments ({appointments.length})</p>
        <ul className="space-y-2">
          {appointments.map((apt) => (
            <li key={apt.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
              <span className="text-white">{new Date(apt.startDateTime).toLocaleTimeString()}</span>
              <span className="text-slate-400">{apt.customer.firstName} {apt.customer.lastName}</span>
              <span className="text-amber-400">{apt.barberProfile.displayName}</span>
            </li>
          ))}
        </ul>
        {appointments.length === 0 && <p className="text-slate-500 text-sm">No appointments today.</p>}
      </div>
    </div>
  );
}
