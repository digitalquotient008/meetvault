import Link from 'next/link';
import { Calendar, DollarSign, ShieldCheck, Users, Clock, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Online Booking',
    description: 'Clients book 24/7 from your custom link. No DMs, no phone tag.',
  },
  {
    icon: DollarSign,
    title: 'Deposits & Payments',
    description: 'Collect deposits or full payment upfront. Straight to your Stripe.',
  },
  {
    icon: ShieldCheck,
    title: 'No-Show Protection',
    description: 'Require a deposit to hold the slot. Your time stays protected.',
  },
  {
    icon: Users,
    title: 'Client CRM',
    description: 'Visit history, notes, and spending — all in one place.',
  },
  {
    icon: Clock,
    title: 'Smart Scheduling',
    description: 'Set hours, buffers, and availability. Zero double-bookings.',
  },
  {
    icon: TrendingUp,
    title: 'Growth Tools',
    description: 'Rebooking prompts and dormant client outreach — fill the book.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-16 sm:py-20 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-amber-400 font-semibold text-sm uppercase tracking-wider mb-3">Everything you need</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">Run your shop, not your inbox</h2>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Booking, payments, client history, and more — built for barbers who want to cut hair, not chase bookings.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 hover:border-amber-500/30 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center mb-4 group-hover:bg-amber-500/25 transition-colors">
                  <Icon className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/features"
            className="inline-flex items-center text-amber-400 font-medium hover:text-amber-300 transition-colors"
          >
            See all features
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
