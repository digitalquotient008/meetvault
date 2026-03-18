import { Calendar, Clock, User, ChevronRight, CreditCard, Shield, Check } from 'lucide-react';

/**
 * 3-step phone mockup of the MeetVault booking flow.
 * Shows: Select service → Pick a time → Confirm & pay deposit.
 */

function PhoneFrame({ children, cta, glow = false }: { children: React.ReactNode; cta: React.ReactNode; glow?: boolean }) {
  return (
    <div className="relative w-full max-w-[280px] mx-auto">
      {glow && <div className="absolute -inset-4 bg-amber-500/5 rounded-[3rem] blur-2xl" />}
      <div className={`relative bg-slate-900/80 backdrop-blur border ${glow ? 'border-amber-500/30' : 'border-slate-700/60'} rounded-[2.2rem] p-2.5 shadow-2xl shadow-slate-950/80`}>
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-[18px] bg-slate-900/80 rounded-b-xl z-10" />

        <div className="bg-slate-950 rounded-[1.8rem] overflow-hidden flex flex-col" style={{ height: '500px' }}>
          {/* Status bar */}
          <div className="flex justify-between items-center px-5 pt-7 pb-1 shrink-0">
            <span className="text-white text-[10px] font-medium">9:41</span>
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                <div className="w-1 h-1 rounded-full bg-white/60" />
                <div className="w-1 h-1 rounded-full bg-white/60" />
                <div className="w-1 h-1 rounded-full bg-white/40" />
                <div className="w-1 h-1 rounded-full bg-white/20" />
              </div>
              <div className="w-4 h-2 border border-white/50 rounded-sm relative">
                <div className="absolute inset-0.5 bg-emerald-400 rounded-[1px]" style={{ width: '70%' }} />
              </div>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-hidden">{children}</div>

          {/* Pinned CTA at bottom */}
          <div className="shrink-0 px-4 pb-3 pt-2 border-t border-slate-800/40">
            {cta}
          </div>

          {/* Home indicator */}
          <div className="flex justify-center pb-2 shrink-0">
            <div className="w-28 h-1 bg-slate-600 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepLabel({ step, label }: { step: string; label: string }) {
  return (
    <div className="text-center mb-4">
      <span className="inline-flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 rounded-full px-3.5 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
        <span className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-[9px] font-bold">{step}</span>
        {label}
      </span>
    </div>
  );
}

function ShopHeader({ subtitle }: { subtitle: string }) {
  return (
    <div className="px-4 pt-2 pb-3 border-b border-slate-800/60">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
          <span className="text-amber-400 text-[10px] font-bold">CC</span>
        </div>
        <div>
          <p className="text-white text-xs font-semibold">Classic Cuts</p>
          <p className="text-slate-500 text-[9px]">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

export default function ProductPreview() {
  return (
    <section className="relative py-16 sm:py-20 bg-slate-950 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/8 via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-3">
            Your branded booking page
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Book &rarr; Pick a time &rarr; Pay deposit. Done.
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            No app to download. Clients tap your link and book in under a minute — from any phone.
          </p>
        </div>

        {/* 3 phones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 max-w-5xl mx-auto items-start">

          {/* ─── Step 1: Select service ─── */}
          <div>
            <StepLabel step="1" label="Pick a service" />
            <PhoneFrame
              cta={
                <div className="bg-amber-500 rounded-xl py-2.5 text-center cursor-default">
                  <span className="text-slate-950 text-xs font-bold">Continue</span>
                </div>
              }
            >
              <ShopHeader subtitle="Book your appointment" />
              <div className="px-4 pt-3 pb-1.5">
                <p className="text-white text-sm font-semibold">Select a service</p>
              </div>
              <div className="px-4 space-y-1.5 pb-2">
                {[
                  { name: 'Skin Fade', time: '40 min', price: '$35', active: true },
                  { name: 'Haircut + Beard', time: '45 min', price: '$40', active: false },
                  { name: 'Buzz Cut', time: '20 min', price: '$20', active: false },
                  { name: 'Lineup', time: '15 min', price: '$15', active: false },
                ].map((s) => (
                  <div
                    key={s.name}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 border ${
                      s.active
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-slate-800/20 border-slate-800/50'
                    }`}
                  >
                    <div>
                      <p className={`text-xs font-medium ${s.active ? 'text-white' : 'text-slate-300'}`}>{s.name}</p>
                      <p className="text-slate-500 text-[9px] flex items-center gap-0.5 mt-0.5">
                        <Clock className="w-2.5 h-2.5" /> {s.time}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-semibold ${s.active ? 'text-amber-400' : 'text-slate-400'}`}>{s.price}</span>
                      <ChevronRight className={`w-3.5 h-3.5 ${s.active ? 'text-amber-400' : 'text-slate-600'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </PhoneFrame>
          </div>

          {/* ─── Step 2: Pick a time ─── */}
          <div>
            <StepLabel step="2" label="Choose a time" />
            <PhoneFrame
              glow
              cta={
                <div className="bg-amber-500 rounded-xl py-2.5 text-center cursor-default">
                  <span className="text-slate-950 text-xs font-bold">Continue</span>
                </div>
              }
            >
              <ShopHeader subtitle="Skin Fade · $35" />
              <div className="px-4 pt-3 pb-2">
                <p className="text-white text-sm font-semibold">Pick a date</p>
              </div>
              {/* Date pills */}
              <div className="px-4 flex gap-1.5 pb-3 overflow-hidden">
                {[
                  { day: 'Mon', date: '17', active: false },
                  { day: 'Tue', date: '18', active: true },
                  { day: 'Wed', date: '19', active: false },
                  { day: 'Thu', date: '20', active: false },
                  { day: 'Fri', date: '21', active: false },
                ].map((d) => (
                  <div
                    key={d.date}
                    className={`flex flex-col items-center rounded-xl px-2.5 py-2 border flex-1 ${
                      d.active
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-slate-800/20 border-slate-800/50'
                    }`}
                  >
                    <span className="text-[9px] text-slate-500">{d.day}</span>
                    <span className={`text-sm font-bold ${d.active ? 'text-amber-400' : 'text-slate-300'}`}>{d.date}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-1.5">
                <p className="text-white text-sm font-semibold">Available times</p>
              </div>
              {/* Time slots */}
              <div className="px-4 grid grid-cols-3 gap-1.5 pb-2">
                {['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '2:00 PM'].map((t, i) => (
                  <div
                    key={t}
                    className={`rounded-xl py-2 text-center border text-[10px] font-medium ${
                      i === 2
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : 'bg-slate-800/20 border-slate-800/50 text-slate-300'
                    }`}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </PhoneFrame>
          </div>

          {/* ─── Step 3: Confirm & pay ─── */}
          <div>
            <StepLabel step="3" label="Confirm & pay" />
            <PhoneFrame
              cta={
                <div className="bg-emerald-500 rounded-xl py-2.5 text-center flex items-center justify-center gap-1.5 cursor-default">
                  <Check className="w-4 h-4 text-white" />
                  <span className="text-white text-xs font-bold">Confirm &amp; Pay $10.00</span>
                </div>
              }
            >
              <ShopHeader subtitle="Confirm booking" />
              <div className="px-4 pt-3 pb-2">
                <p className="text-white text-sm font-semibold">Booking summary</p>
              </div>
              {/* Summary card */}
              <div className="px-4 pb-3">
                <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-3 space-y-2.5">
                  {[
                    { label: 'Service', value: 'Skin Fade' },
                    { label: 'Date', value: 'Tue, Mar 18' },
                    { label: 'Time', value: '10:00 AM' },
                    { label: 'With', value: 'Mike' },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between">
                      <span className="text-slate-500 text-[10px]">{r.label}</span>
                      <span className="text-white text-[10px] font-medium">{r.value}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-700/40 pt-2.5 flex justify-between">
                    <span className="text-slate-400 text-[10px] font-medium">Deposit</span>
                    <span className="text-amber-400 text-xs font-bold">$10.00</span>
                  </div>
                </div>
              </div>
              {/* Card input mockup */}
              <div className="px-4 pb-3">
                <div className="bg-slate-800/20 border border-slate-700/40 rounded-xl px-3 py-2.5 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-500 text-[10px]">4242 &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull;</span>
                </div>
              </div>
              {/* Trust */}
              <div className="px-4 pb-1">
                <div className="flex items-center justify-center gap-3">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-emerald-400" />
                    <span className="text-[8px] text-slate-500">Secure payment</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-bold text-[#635BFF]">stripe</span>
                    <span className="text-[8px] text-slate-500">powered</span>
                  </div>
                </div>
              </div>
            </PhoneFrame>
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
            Works on any phone — no app download
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
