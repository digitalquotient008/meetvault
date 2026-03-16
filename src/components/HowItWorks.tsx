import Link from 'next/link';

const steps = [
  {
    step: '01',
    title: 'Create your shop',
    description: 'Sign up, name your shop, and pick your booking URL. Takes under 2 minutes.',
  },
  {
    step: '02',
    title: 'Add services & hours',
    description: 'Choose from ready-made templates or add custom services. Set your schedule and buffers.',
  },
  {
    step: '03',
    title: 'Share your link',
    description: 'Clients book and pay from your branded page. You get reminders — no spam, no DMs.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 py-20 sm:py-28 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-3">Quick setup</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Live in 5 minutes
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            No onboarding calls, no training needed. If you can use Instagram, you can set this up.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((s, i) => (
            <div key={s.step} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-slate-700 to-transparent -translate-x-6 z-0" />
              )}
              <div className="relative bg-slate-800/50 border border-slate-700/60 rounded-2xl p-8 hover:border-slate-600 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
                  <span className="text-lg font-bold text-amber-400">{s.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{s.title}</h3>
                <p className="text-slate-400 leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-14">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-amber-500 text-slate-950 px-8 py-3.5 rounded-xl font-bold hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
          >
            Start your 14-day free trial
          </Link>
          <p className="text-sm text-slate-500 mt-3">No credit card required</p>
        </div>
      </div>
    </section>
  );
}
