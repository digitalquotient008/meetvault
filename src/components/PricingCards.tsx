import Link from 'next/link';
import StripeBadge from '@/components/StripeBadge';

const starterFeatures = [
  '1 staff member (you)',
  'Unlimited appointments',
  'Online booking page (white-labeled)',
  'Deposit & full payment via Stripe',
  'No-show protection & cancellation fees',
  'Client CRM & history',
  'Walk-in queue & waitlist',
  'Appointment reminders (email + SMS)',
  'Growth tools & revenue reports',
  'Custom branding & CSV import',
];

const teamFeatures = [
  'Unlimited staff members',
  'Everything in Starter, plus:',
  'Per-barber scheduling & availability',
  'Staff permissions & roles',
  'Barber commission tracking',
  'Per-barber revenue reports',
  'Multi-chair walk-in queue',
  'Team calendar view',
  'Priority support',
  'Custom onboarding',
];

function CheckIcon() {
  return (
    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
      <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    </div>
  );
}

export default function PricingCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-start">
      {/* ─── Starter ─── */}
      <div className="relative bg-slate-900/90 rounded-3xl border border-amber-500/40 p-8 shadow-2xl shadow-amber-500/10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />

        <div className="relative">
          <div className="flex justify-center mb-5">
            <span className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/25 rounded-full px-4 py-1.5 text-xs font-semibold text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Most popular
            </span>
          </div>

          <div className="text-center mb-7">
            <h3 className="text-2xl font-bold text-white mb-1">Starter</h3>
            <p className="text-sm text-slate-400 mb-5">For solo barbers and independent stylists</p>
            <div className="flex items-end justify-center gap-1 h-14">
              <span className="text-5xl font-extrabold text-white leading-none">$25</span>
              <span className="text-slate-400 text-lg mb-1">/mo</span>
            </div>
          </div>

          <Link
            href="/sign-up"
            className="block w-full text-center px-4 py-3.5 rounded-xl font-bold text-base transition-all bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20 mb-2"
          >
            Start 14-day free trial
          </Link>
          <p className="text-center text-xs text-slate-500 mb-7">
            Card required — no charge for 14 days
          </p>

          <ul className="space-y-3">
            {starterFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <CheckIcon />
                <span className="text-sm text-slate-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ─── Team ─── */}
      <div className="relative bg-slate-900/90 rounded-3xl border border-slate-700 p-8 overflow-hidden">
        <div className="relative">
          <div className="flex justify-center mb-5">
            <span className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/25 rounded-full px-4 py-1.5 text-xs font-semibold text-blue-300">
              Multi-barber shops
            </span>
          </div>

          <div className="text-center mb-7">
            <h3 className="text-2xl font-bold text-white mb-1">Team</h3>
            <p className="text-sm text-slate-400 mb-5">For shops with multiple barbers or salon suites</p>
            <div className="flex items-end justify-center gap-1 h-14">
              <span className="text-3xl font-bold text-white leading-none">Custom pricing</span>
            </div>
          </div>

          <Link
            href="/contact?plan=team"
            className="block w-full text-center px-4 py-3.5 rounded-xl font-bold text-base transition-all bg-white/10 border border-slate-600 text-white hover:bg-white/15 hover:border-slate-500 mb-2"
          >
            Contact Sales
          </Link>
          <p className="text-center text-xs text-slate-500 mb-7">
            We&apos;ll build a plan that fits your shop
          </p>

          <ul className="space-y-3">
            {teamFeatures.map((feature, i) => (
              <li key={feature} className="flex items-start gap-3">
                {i === 1 ? (
                  <span className="text-sm text-slate-500 font-medium">{feature}</span>
                ) : (
                  <>
                    <CheckIcon />
                    <span className="text-sm text-slate-300">{feature}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ─── Shared trust bar ─── */}
      <div className="md:col-span-2 flex justify-center pt-4">
        <StripeBadge />
      </div>
    </div>
  );
}
