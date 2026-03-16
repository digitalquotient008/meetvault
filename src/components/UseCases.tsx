import Link from 'next/link';

const useCases = [
  {
    title: 'Lawyers & law firms',
    subtitle: 'Solo and small-firm practice',
    description:
      'Book consultations, collect retainers and fees, run intake and document uploads, and keep client history and notes in one place.',
  },
  {
    title: 'Consultants',
    subtitle: 'Strategy, operations, HR advisory',
    description:
      'Run discovery calls, onboarding, and retainer check-ins with dedicated booking links and availability that fits your calendar.',
  },
  {
    title: 'Coaches',
    subtitle: 'Life, career, wellness',
    description:
      'Let clients book sessions, keep context in one place with contact history, and cut no-shows with reminders.',
  },
  {
    title: 'Therapists & counselors',
    subtitle: 'CBT, couples, wellness',
    description:
      'Offer recurring slots, buffers between sessions, and a calm booking experience—without double-books.',
  },
  {
    title: 'Freelancers',
    subtitle: 'Design, dev, consulting',
    description:
      'One link for kickoffs, reviews, and follow-ups. Spend less time scheduling and more time delivering.',
  },
  {
    title: 'Tutors & educators',
    subtitle: 'Private, remote, test prep',
    description:
      'Set lesson types and availability; students book quickly. Track progress and notes in your built-in CRM.',
  },
  {
    title: 'Photographers & creatives',
    subtitle: 'Portraits, events, brands',
    description:
      'Book by shoot type and duration, share a link with clients, and keep location and prep in one place.',
  },
  {
    title: 'Agents & advisors',
    subtitle: 'Real estate, financial, legal',
    description:
      'Schedule viewings, consultations, and follow-ups. Share your link with clients and keep your pipeline moving.',
  },
];

export default function UseCases() {
  return (
    <section id="use-cases" className="scroll-mt-24 py-16 sm:py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
            Built for how you work
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            From lawyers and law firms to consultants and coaches—one platform for client consultations.
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
