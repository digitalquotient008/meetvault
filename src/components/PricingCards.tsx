import Link from 'next/link';

const features = [
  'Online booking page (white-labeled to your shop)',
  'Unlimited appointments',
  'Deposit & full payment collection via Stripe',
  'No-show protection with cancellation fees',
  'Client history & notes (built-in CRM)',
  'Walk-in queue management',
  'Waitlist with automatic notifications',
  'Staff scheduling & availability',
  'Appointment reminders (email)',
  'Growth tools (rebooking prompts, dormant client outreach)',
  'Revenue reports & CSV export',
  'Custom branding (logo, colors, booking slug)',
];

export default function PricingCards() {
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-slate-800/80 rounded-2xl border-2 border-amber-500 p-8 relative shadow-lg shadow-amber-500/10">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
          Everything you need
        </div>

        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
          <p className="text-sm text-slate-400 mb-6">For independent barbers and solo stylists</p>
          <div>
            <span className="text-5xl font-bold text-white">$25</span>
            <span className="text-slate-400 ml-1">/month</span>
          </div>
        </div>

        <Link
          href="/sign-up"
          className="block w-full text-center px-4 py-3 rounded-lg font-semibold transition-colors mb-8 bg-amber-600 text-white hover:bg-amber-500"
        >
          Start free trial
        </Link>

        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-start">
              <svg className="w-5 h-5 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-slate-300">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
