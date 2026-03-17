import Link from 'next/link';
import { DollarSign, Clock, SmilePlus, CalendarCheck } from 'lucide-react';

const outcomes = [
  {
    icon: DollarSign,
    stat: 'Fewer no-shows',
    description: 'Deposits hold the slot. If they cancel late or ghost, you keep the deposit. Your income stays protected.',
  },
  {
    icon: Clock,
    stat: 'Hours saved weekly',
    description: 'No more texting back and forth. Clients self-book, get automatic reminders, and pay before they sit down.',
  },
  {
    icon: SmilePlus,
    stat: 'Happier clients',
    description: 'Clients book in 30 seconds from their phone. They pick the barber, the service, and the time.',
  },
  {
    icon: CalendarCheck,
    stat: 'Fuller book',
    description: 'Waitlist fills cancellations automatically. Rebooking prompts bring regulars back before they forget.',
  },
];

export default function Outcomes() {
  return (
    <section className="py-20 sm:py-28 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-3">Real results</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            What changes when you switch
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Less chasing, fewer no-shows, more time cutting hair.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {outcomes.map((o) => {
            const Icon = o.icon;
            return (
              <div key={o.stat} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-7 text-center hover:border-slate-700 transition-colors group">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5 group-hover:bg-amber-500/20 transition-colors">
                  <Icon className="w-7 h-7 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{o.stat}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{o.description}</p>
              </div>
            );
          })}
        </div>

        {/* Trust strip */}
        <div className="relative bg-gradient-to-br from-slate-900 to-slate-800/80 border border-slate-700/60 rounded-3xl p-10 md:p-14 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-amber-600/5 via-transparent to-transparent" />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">No risk. No lock-in. No surprises.</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  '14-day free trial',
                  'Not charged until trial ends',
                  'Import clients from Square, Vagaro, Booksy',
                  'Cancel anytime — no contracts',
                ].map((point) => (
                  <div key={point} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm text-slate-300">{point}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
              <Link
                href="/sign-up"
                className="bg-amber-500 text-slate-950 px-8 py-3.5 rounded-xl font-bold hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 text-center"
              >
                Start free trial
              </Link>
              <Link
                href="/pricing"
                className="border border-slate-600 text-slate-200 px-8 py-3.5 rounded-xl font-semibold hover:border-slate-500 hover:text-white transition-colors text-center"
              >
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
