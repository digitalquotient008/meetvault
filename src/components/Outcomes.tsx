import Link from 'next/link';
import { DollarSign, Clock, SmilePlus, CalendarCheck } from 'lucide-react';

const outcomes = [
  {
    icon: DollarSign,
    stat: 'Fewer no-shows',
    description: 'Deposits hold the slot. If they cancel late or ghost, you keep the deposit. Your income is protected.',
  },
  {
    icon: Clock,
    stat: 'Hours saved weekly',
    description: 'No more texting back and forth. Clients self-book, get automatic reminders, and pay before they sit down.',
  },
  {
    icon: SmilePlus,
    stat: 'Happier clients',
    description: 'Clients book in 30 seconds from their phone. They pick the barber, the service, and the time — no waiting.',
  },
  {
    icon: CalendarCheck,
    stat: 'Fuller book',
    description: 'Waitlist fills cancellations automatically. Rebooking prompts bring regulars back before they forget.',
  },
];

const trust_points = [
  'Free trial — no credit card required',
  'Set up in under 5 minutes',
  'Payments go straight to your Stripe',
  'Cancel anytime, no contracts',
];

export default function Outcomes() {
  return (
    <section className="py-16 sm:py-20 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-amber-400 font-semibold text-sm uppercase tracking-wider mb-3">Real results</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            What barbers get when they switch
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Less chasing, fewer no-shows, more time cutting hair.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {outcomes.map((o) => {
            const Icon = o.icon;
            return (
              <div key={o.stat} className="text-center group">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-500/20 transition-colors">
                  <Icon className="w-7 h-7 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{o.stat}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{o.description}</p>
              </div>
            );
          })}
        </div>

        {/* Trust strip */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">No risk, no lock-in</h3>
              <ul className="space-y-2">
                {trust_points.map((point) => (
                  <li key={point} className="flex items-center gap-2 text-sm text-slate-300">
                    <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 md:flex-shrink-0">
              <Link
                href="/sign-up"
                className="bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-500 transition-colors text-center"
              >
                Start free trial
              </Link>
              <Link
                href="/pricing"
                className="border border-slate-600 text-slate-200 px-8 py-3 rounded-lg font-semibold hover:border-amber-500/50 hover:text-white transition-colors text-center"
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
