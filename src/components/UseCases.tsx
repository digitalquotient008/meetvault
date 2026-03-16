import Link from 'next/link';

const useCases = [
  {
    title: 'Solo barbers',
    subtitle: 'Your chair, your book',
    description:
      'One booking link, deposits to cut no-shows, and client history in one place. No monthly lock-in—free to start.',
  },
  {
    title: 'Barbershops',
    subtitle: 'Multiple chairs, one system',
    description:
      'Each barber gets a link. Clients book and pay deposits. Reminders you control—no spam. Built for the shop.',
  },
  {
    title: 'Salons',
    subtitle: 'Hair, nails, styling',
    description:
      'Online booking, deposits, and no-show protection. Client notes and history. Reliable payment confirmation.',
  },
  {
    title: 'Nail techs & stylists',
    subtitle: 'Independent or in-salon',
    description:
      'Set your services and hours. Share your link. Get paid upfront or in-shop. Reminders only—no marketing blasts.',
  },
];

export default function UseCases() {
  return (
    <section id="use-cases" className="scroll-mt-24 py-16 sm:py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
            Built for the chair
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Solo barbers, barbershops, salons, and stylists—one platform for booking and payments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((uc) => (
            <div
              key={uc.title}
              className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-6 hover:border-slate-600 transition-colors flex flex-col"
            >
              <h3 className="text-lg font-semibold text-white mb-1">{uc.title}</h3>
              <p className="text-sm text-slate-400 mb-3">{uc.subtitle}</p>
              <p className="text-slate-300 text-sm leading-relaxed flex-1">{uc.description}</p>
              <Link
                href="/features"
                className="inline-flex items-center mt-4 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                Learn more
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
