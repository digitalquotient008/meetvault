import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative bg-slate-950 overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-950 to-slate-950" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-medium text-amber-200">14-day free trial &middot; Cancel anytime</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.08] tracking-tight">
            Your clients book.
            <br />
            <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">You get paid.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Online booking, deposits, no-show protection, and client management — built for independent barbers. Set up in 5 minutes. $25/mo after trial.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/sign-up"
              className="group relative bg-amber-500 text-slate-950 px-8 py-4 rounded-xl text-lg font-bold hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-400/30 w-full sm:w-auto text-center"
            >
              Start your free trial
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-500 whitespace-nowrap font-normal">Not charged until trial ends</span>
            </Link>
            <Link
              href="#how-it-works"
              className="text-slate-300 hover:text-white px-8 py-4 text-lg font-semibold transition-colors w-full sm:w-auto text-center"
            >
              See how it works &darr;
            </Link>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-20 pt-10 border-t border-slate-800/60">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 max-w-4xl mx-auto">
            {[
              { value: '5 min', label: 'Setup time' },
              { value: '$25', label: 'Per month, flat' },
              { value: '0%', label: 'Hidden fees' },
              { value: '14 days', label: 'Free trial' },
              { value: '1 click', label: 'Client import' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-white">{s.value}</p>
                <p className="text-sm text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
