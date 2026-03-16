import Link from 'next/link';
import { Calendar, DollarSign, ShieldCheck, Users, Clock, Upload } from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Online Booking',
    description: 'Clients book 24/7 from your branded link. No DMs, no phone tag.',
    accent: 'from-amber-500/20 to-amber-600/10',
  },
  {
    icon: DollarSign,
    title: 'Deposits & Payments',
    description: 'Collect deposits or full payment upfront via Stripe. Straight to your account.',
    accent: 'from-emerald-500/20 to-emerald-600/10',
  },
  {
    icon: ShieldCheck,
    title: 'No-Show Protection',
    description: 'Require a deposit to hold the slot. They cancel late? You keep it.',
    accent: 'from-rose-500/20 to-rose-600/10',
  },
  {
    icon: Users,
    title: 'Client CRM',
    description: 'Visit history, notes, and spending per client — all in one place.',
    accent: 'from-sky-500/20 to-sky-600/10',
  },
  {
    icon: Clock,
    title: 'Smart Scheduling',
    description: 'Set hours, buffers, and time off. Zero double-bookings, ever.',
    accent: 'from-violet-500/20 to-violet-600/10',
  },
  {
    icon: Upload,
    title: 'Easy Migration',
    description: 'Import your client list from Square, Vagaro, Booksy, or any CSV. Switch in minutes, not weeks.',
    accent: 'from-cyan-500/20 to-cyan-600/10',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-3">Everything included</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Run your shop, not your inbox
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Every tool a barber needs — booking, payments, clients, scheduling, and growth — in one clean dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="relative bg-slate-900/80 border border-slate-800 rounded-2xl p-7 hover:border-slate-700 transition-all duration-300 group overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-5 group-hover:border-amber-500/30 transition-colors">
                    <Icon className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/features"
            className="inline-flex items-center gap-2 text-amber-400 font-semibold hover:text-amber-300 transition-colors group"
          >
            See all features
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
