import Link from 'next/link';
import CTA from '@/components/CTA';
import { Shield, Eye, Database, Heart } from 'lucide-react';

export const metadata = {
  title: 'About — MeetingVault',
  description:
    'MeetingVault was built by someone who watched barbers lose money to no-shows, juggle DMs, and scribble notes on paper. This is the tool that should have existed.',
};

const values = [
  {
    icon: Shield,
    title: 'Your money is protected',
    description:
      'Deposits go straight to your Stripe account. We never touch or hold your funds. No-show? You keep the deposit. Your income is protected by default.',
  },
  {
    icon: Eye,
    title: 'Your brand, not ours',
    description:
      'Your booking page shows your name, your logo, your colors. Clients see your shop — MeetingVault stays invisible. This is your business, not ours.',
  },
  {
    icon: Database,
    title: 'Your data, your control',
    description:
      'You own your customer list. Export it anytime. No lock-in, no hostage situation. If you leave, your data leaves with you.',
  },
  {
    icon: Heart,
    title: 'Built for barbers, not enterprise',
    description:
      'No 47-tab dashboards. No features you\'ll never use. Every screen was designed for someone who cuts hair for a living — not a SaaS product manager.',
  },
];

export default function AboutPage() {
  return (
    <div className="bg-slate-950 min-h-screen">
      {/* ─── Hero ─── */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-4">
            Our story
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Built by someone who sat in the chair.
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Not a Silicon Valley startup. Not a VC-funded feature factory. Just a tool that should have existed — built for the people who actually need it.
          </p>
        </div>
      </section>

      {/* ─── The Story ─── */}
      <section className="py-20 sm:py-24 bg-slate-900/40 border-y border-slate-800/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 text-lg leading-relaxed">
            <p className="text-slate-300">
              We spent time in barbershops — not as consultants, but as regulars. We watched.
            </p>
            <p className="text-slate-300">
              We watched barbers lose <span className="text-white font-semibold">$200–$400 a month</span> to no-shows. We watched them juggle bookings across DMs, texts, and phone calls. We watched them scribble client notes on paper and forget what a regular liked last time.
            </p>
            <p className="text-slate-300">
              The tools that existed were either built for salons (too complex, too expensive) or built for "scheduling" in general (too generic, no payments, no protection).
            </p>
            <p className="text-white text-xl font-semibold">
              Nobody was building for the independent barber.
            </p>
            <p className="text-slate-300">
              So we did. MeetingVault is online booking, deposits, no-show protection, client history, and growth tools — in one place, for <span className="text-amber-400 font-semibold">$25/month</span>. No enterprise pricing. No features you&apos;ll never use. No 30-minute onboarding calls.
            </p>
            <p className="text-slate-300">
              Set it up in 5 minutes. Share your link. Get paid.
            </p>
          </div>
        </div>
      </section>

      {/* ─── What We Believe ─── */}
      <section className="py-20 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-3">
              What we believe
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Principles, not features
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{v.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">{v.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── The Promise ─── */}
      <section className="py-20 sm:py-24 bg-slate-900/40 border-y border-slate-800/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            We&apos;re not trying to be everything.
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-4">
            We&apos;re not building payroll, inventory management, or a social media scheduler. We&apos;re building the best booking and payments tool for barbers — and doing that one thing really well.
          </p>
          <p className="text-slate-400 text-lg leading-relaxed">
            If you&apos;re a solo barber or run a small shop, we built this for you.
            <br />
            If you need a 200-feature enterprise suite, we&apos;re probably not your tool — and that&apos;s okay.
          </p>
        </div>
      </section>

      {/* ─── Quick Facts ─── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '$25', label: 'Per month, flat' },
              { value: '5 min', label: 'Setup time' },
              { value: '0', label: 'Hidden fees' },
              { value: '100%', label: 'Your data' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl md:text-4xl font-bold text-white">{s.value}</p>
                <p className="text-sm text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <CTA
        title="Ready to try it?"
        description="14-day free trial. Cancel anytime — you won't be charged until the trial ends."
      />
    </div>
  );
}
