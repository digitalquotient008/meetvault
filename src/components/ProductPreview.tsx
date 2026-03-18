import { Calendar, Clock, User, ChevronRight, CreditCard, Shield } from 'lucide-react';

/**
 * Styled mockup of the MeetVault booking flow on a phone screen.
 * Sits between the Hero and Features section on the homepage.
 */
export default function ProductPreview() {
  return (
    <section className="relative py-16 sm:py-20 bg-slate-950 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-3">
            Your branded booking page
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            This is what your clients see
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            No app to download. Clients tap your link, pick a service, choose a time, and pay — all from their phone.
          </p>
        </div>

        <div className="flex justify-center">
          {/* Phone frame */}
          <div className="relative w-[320px] sm:w-[360px]">
            {/* Outer glow */}
            <div className="absolute -inset-4 bg-amber-500/5 rounded-[3rem] blur-2xl" />

            {/* Phone body */}
            <div className="relative bg-slate-900 border border-slate-700/80 rounded-[2.5rem] p-3 shadow-2xl shadow-slate-950/80">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-b-2xl z-10" />

              {/* Screen */}
              <div className="bg-slate-950 rounded-[2rem] overflow-hidden">
                {/* Status bar */}
                <div className="flex justify-between items-center px-6 pt-8 pb-2">
                  <span className="text-white text-xs font-medium">9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-2 border border-white/60 rounded-sm relative">
                      <div className="absolute inset-0.5 bg-emerald-400 rounded-[1px]" style={{ width: '70%' }} />
                    </div>
                  </div>
                </div>

                {/* Shop header */}
                <div className="px-5 pt-2 pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                      <span className="text-amber-400 text-xs font-bold">CC</span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">Classic Cuts</p>
                      <p className="text-slate-500 text-[10px]">Book your next appointment</p>
                    </div>
                  </div>
                </div>

                {/* Step indicator */}
                <div className="px-5 pt-4 pb-2">
                  <p className="text-amber-400 text-[10px] font-semibold uppercase tracking-wider">Step 1 of 3</p>
                  <p className="text-white text-base font-semibold mt-1">Select a service</p>
                </div>

                {/* Service cards */}
                <div className="px-5 space-y-2 pb-3">
                  {[
                    { name: 'Skin Fade', duration: '40 min', price: '$35', active: true },
                    { name: 'Haircut + Beard', duration: '45 min', price: '$40', active: false },
                    { name: 'Buzz Cut', duration: '20 min', price: '$20', active: false },
                  ].map((s) => (
                    <div
                      key={s.name}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 border transition-colors ${
                        s.active
                          ? 'bg-amber-500/10 border-amber-500/40'
                          : 'bg-slate-800/40 border-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          s.active ? 'bg-amber-500/20' : 'bg-slate-700/50'
                        }`}>
                          <Calendar className={`w-4 h-4 ${s.active ? 'text-amber-400' : 'text-slate-500'}`} />
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${s.active ? 'text-white' : 'text-slate-300'}`}>{s.name}</p>
                          <p className="text-slate-500 text-[10px] flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {s.duration}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${s.active ? 'text-amber-400' : 'text-slate-400'}`}>{s.price}</span>
                        <ChevronRight className={`w-4 h-4 ${s.active ? 'text-amber-400' : 'text-slate-600'}`} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Trust indicators */}
                <div className="px-5 pb-5 pt-2">
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-emerald-400" />
                      <span className="text-[9px] text-slate-500">Deposit secured</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-emerald-400" />
                      <span className="text-[9px] text-slate-500">Pay via Stripe</span>
                    </div>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="px-5 pb-6">
                  <div className="bg-amber-500 rounded-xl py-3 text-center">
                    <span className="text-slate-950 text-sm font-bold">Continue</span>
                  </div>
                </div>

                {/* Home indicator */}
                <div className="flex justify-center pb-3">
                  <div className="w-28 h-1 bg-slate-600 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Caption */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            Your brand, your colors
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Works on any phone
          </span>
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Deposit collected at booking
          </span>
        </div>
      </div>
    </section>
  );
}
