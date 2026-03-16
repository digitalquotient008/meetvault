import Link from 'next/link';
import CTA from '@/components/CTA';

export const metadata = {
  title: 'Integrations',
  description: 'Connect MeetingVault with the tools you use. Calendar sync coming soon.',
};

const integrations = [
  { name: 'Google Calendar', description: 'Block busy times and create events for new bookings.', status: 'Coming soon' as const },
  { name: 'Microsoft Outlook', description: 'Sync availability with Outlook.', status: 'Coming soon' as const },
  { name: 'Apple Calendar', description: 'Keep Apple Calendar in sync with bookings.', status: 'Coming soon' as const },
];

export default function IntegrationsPage() {
  return (
    <div className="bg-slate-950 min-h-screen">
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Integrations</h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Calendar sync and more coming soon. Manage your shop from the dashboard.
            </p>
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {integrations.map((i) => (
              <div key={i.name} className="bg-slate-800/80 rounded-xl border border-slate-700 p-6 hover:border-slate-600 transition-colors">
                <h2 className="text-xl font-semibold text-white mb-3">{i.name}</h2>
                <p className="text-sm text-slate-400 mb-4">{i.description}</p>
                <span className="text-xs bg-slate-600/50 text-slate-400 px-2 py-1 rounded">{i.status}</span>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center text-sm text-slate-400">
            Go to <Link href="/app" className="text-amber-400 hover:text-amber-300 font-medium">Dashboard → Settings</Link> for shop configuration.
          </div>
        </div>
      </section>
      <CTA />
    </div>
  );
}
