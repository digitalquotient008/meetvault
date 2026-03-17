import Link from 'next/link';
import CTA from '@/components/CTA';
import {
  Calendar,
  DollarSign,
  ShieldCheck,
  Users,
  Bell,
  BarChart3,
  Scissors,
  ClipboardList,
  TrendingUp,
  Palette,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Upload,
} from 'lucide-react';

export const metadata = {
  title: 'Features — MeetingVault',
  description:
    'No-shows are costing you $400 a month. MeetingVault requires deposits at booking — so if they ghost, you keep it.',
};

const steps = [
  {
    number: '01',
    title: 'Clients book and pay upfront',
    description:
      'Your custom booking page collects a deposit (or full payment) via Stripe at the moment of booking. No deposit, no slot.',
    icon: DollarSign,
  },
  {
    number: '02',
    title: 'Automatic reminders do the follow-up',
    description:
      "Clients get email and SMS reminders before their appointment. You don't lift a finger.",
    icon: Bell,
  },
  {
    number: '03',
    title: 'No-show? You keep the deposit.',
    description:
      "If they ghost or cancel late, the money's already yours. Your income stays protected.",
    icon: ShieldCheck,
  },
];

const all_features = [
  {
    icon: Calendar,
    title: 'Online Booking',
    description:
      'Your branded page. Clients pick a barber, service, and time — 24/7. No DMs.',
  },
  {
    icon: DollarSign,
    title: 'Deposits & Payments',
    description:
      'Collect deposits or full payment via Stripe. Money goes straight to your account.',
  },
  {
    icon: ShieldCheck,
    title: 'No-Show Protection',
    description:
      'Require a deposit to hold the slot. They cancel late? You keep it.',
  },
  {
    icon: Users,
    title: 'Client CRM',
    description:
      'Full visit history, spending, notes, and contact info — before they sit down.',
  },
  {
    icon: Bell,
    title: 'Appointment Reminders',
    description: 'Automatic emails and texts before each appointment. Zero effort.',
  },
  {
    icon: UserPlus,
    title: 'Walk-In Queue',
    description:
      'Digital queue for walk-ins. Everyone knows their spot. You stay focused.',
  },
  {
    icon: ClipboardList,
    title: 'Waitlist',
    description:
      'Fully booked? Clients join the waitlist and auto-fill cancellations.',
  },
  {
    icon: TrendingUp,
    title: 'Growth Tools',
    description:
      "See who's due for a rebook. Reach dormant clients before they drift away.",
  },
  {
    icon: BarChart3,
    title: 'Revenue Reports',
    description:
      'Earnings by barber, by day, by service. Export to CSV anytime.',
  },
  {
    icon: Palette,
    title: 'Your Brand',
    description:
      'Custom logo, colors, and booking URL. MeetingVault stays invisible.',
  },
];

const pain_points = [
  {
    before: 'Chasing clients for deposits over DMs',
    after: 'Deposits collected automatically at booking',
  },
  {
    before: 'No-shows wasting your best time slots',
    after: 'Protected slots — they pay or lose the deposit',
  },
  {
    before: 'Scrambling to remember client preferences',
    after: 'Full history and notes before they sit down',
  },
  {
    before: '"What time works?" back-and-forth texts',
    after: 'Clients self-book from your live calendar',
  },
  {
    before: 'Walk-ins with no idea how long the wait is',
    after: 'Digital queue — everyone knows their spot',
  },
  {
    before: "No idea which clients haven't been back",
    after: 'Growth alerts for dormant and due clients',
  },
];

export default function FeaturesPage() {
  return (
    <div className="bg-slate-950 min-h-screen">
      {/* ─── HERO ─── */}
      <section className="relative pt-20 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/15 via-transparent to-transparent" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-4">
            Built for independent barbers
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            No-shows are costing you
            <br />
            <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
              $400 a month.
            </span>{' '}
            <span className="text-white">Let&apos;s fix that.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Every empty slot is money you&apos;ll never get back. MeetingVault requires
            deposits at booking — so if they ghost, you keep it. Set up in 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link
              href="/sign-up"
              className="bg-amber-500 text-slate-950 px-8 py-4 rounded-xl font-bold text-lg hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 text-center"
            >
              Start My Free 14-Day Trial
            </Link>
          </div>
          <p className="text-slate-500 text-sm mt-4">
            No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* ─── PAIN SECTION ─── */}
      <section className="py-20 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-4 text-center">
            Sound familiar?
          </p>
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 md:p-12">
            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              It&apos;s 11am. You blocked out the slot, set up your station, and waited.
            </p>
            <p className="text-white text-xl font-semibold mb-6">
              They never showed. No text. No call. Just gone.
            </p>
            <p className="text-slate-400 leading-relaxed mb-6">
              That&apos;s not just frustrating — that&apos;s $60, $80, maybe $100 you&apos;ll
              never see. And it happened three times this week.
            </p>
            <div className="border-t border-slate-800 pt-6">
              <p className="text-slate-300 leading-relaxed">
                Most barbers lose{' '}
                <span className="text-white font-semibold">4–6 hours a month</span> to
                no-shows. At $50/cut, that&apos;s{' '}
                <span className="text-amber-400 font-semibold">$200–$300 out of your pocket</span>.
                Every single month.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 sm:py-24 bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-3">
              How it works
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Here&apos;s how MeetingVault stops it
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="relative bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition-colors group"
                >
                  <span className="text-5xl font-black text-slate-800 group-hover:text-slate-700 transition-colors absolute top-6 right-6">
                    {step.number}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── PIVOT TRANSITION ─── */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-5 py-2 mb-6">
            <ArrowRight className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-semibold">And that&apos;s just the start</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Once your book is protected, MeetingVault handles everything else.
          </h2>
          <p className="text-slate-400 text-lg">
            So you can focus on the cut, not the calendar.
          </p>
        </div>
      </section>

      {/* ─── FULL FEATURE GRID ─── */}
      <section className="py-20 sm:py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-3">
              Full feature set
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything included. One price. No add-ons.
            </h2>
            <p className="text-slate-400 text-lg">
              $25/month gets you the full toolkit — not a watered-down free tier.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {all_features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-7 hover:border-slate-600 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-700/60 flex items-center justify-center mb-4 group-hover:bg-amber-500/15 transition-colors">
                    <Icon className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── BEFORE / AFTER ─── */}
      <section className="py-20 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-3">
              Before &amp; after
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What actually changes
            </h2>
          </div>
          <div className="space-y-3">
            {pain_points.map((p, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-red-950/20 border border-red-900/20 rounded-xl px-6 py-4 flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <span className="text-red-300/90 text-sm">{p.before}</span>
                </div>
                <div className="bg-emerald-950/20 border border-emerald-900/20 rounded-xl px-6 py-4 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-emerald-300/90 text-sm">{p.after}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MIGRATION HOOK ─── */}
      <section className="py-20 sm:py-24 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 md:p-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
              <Upload className="w-7 h-7 text-amber-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Already on Squire, Booksy, or Vagaro?
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
              Switching is painless. Upload your client list as a CSV and we import every
              name, email, phone number, and note — in seconds. No starting from scratch.
            </p>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <CTA
        title="Your next no-show is your last one."
        description="14-day free trial. No credit card. Takes 5 minutes to set up."
        buttonText="Start My Free Trial"
      />
    </div>
  );
}
