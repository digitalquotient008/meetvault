import Link from 'next/link';

const features = [
  '1 staff member (you)',
  'Unlimited appointments',
  'Online booking page (white-labeled)',
  'Deposit & full payment collection via Stripe',
  'No-show protection with cancellation fees',
  'Client history & notes (built-in CRM)',
  'Walk-in queue management',
  'Waitlist with automatic notifications',
  'Appointment reminders (email + SMS)',
  'Growth tools (rebooking, dormant client outreach)',
  'Revenue reports & CSV export',
  'Custom branding (logo, colors, booking slug)',
  'One-click client import (CSV)',
];

export default function PricingCards() {
  return (
    <div className="max-w-md mx-auto">
      <div className="relative bg-slate-900/90 rounded-3xl border border-amber-500/40 p-9 shadow-2xl shadow-amber-500/10 overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />

        <div className="relative">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/25 rounded-full px-4 py-1.5 text-xs font-semibold text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Everything included
            </span>
          </div>

          {/* Price */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-1">Starter</h3>
            <p className="text-sm text-slate-400 mb-6">For solo barbers and independent stylists</p>
            <div className="flex items-end justify-center gap-1">
              <span className="text-6xl font-extrabold text-white leading-none">$25</span>
              <span className="text-slate-400 text-lg mb-1">/mo</span>
            </div>
          </div>

          {/* Trial CTA */}
          <Link
            href="/sign-up"
            className="block w-full text-center px-4 py-4 rounded-xl font-bold text-lg transition-all bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20 mb-3"
          >
            Start 14-day free trial
          </Link>
          <p className="text-center text-xs text-slate-500 mb-8">Card required &middot; You won&apos;t be charged until the trial ends &middot; Cancel anytime</p>

          {/* Features */}
          <ul className="space-y-3.5">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-slate-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
