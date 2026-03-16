import Link from 'next/link';
import CTA from '@/components/CTA';
import {
  Calendar,
  DollarSign,
  ShieldCheck,
  Users,
  Clock,
  Bell,
  BarChart3,
  Scissors,
  ListOrdered,
  ClipboardList,
  TrendingUp,
  Palette,
} from 'lucide-react';

export const metadata = {
  title: 'Features',
  description: 'Online booking, deposits, no-show protection, and client history — built for independent barbers.',
};

const hero_features = [
  {
    icon: Calendar,
    title: 'Online Booking',
    description: 'Your own booking page with your brand. Clients pick a service, choose a barber, and book a time — 24/7. No DMs, no phone tag.',
    highlight: true,
  },
  {
    icon: DollarSign,
    title: 'Deposits & Payments',
    description: 'Collect deposits or full payment upfront via Stripe. Money goes straight to your account. No surprises, no chasing.',
    highlight: true,
  },
  {
    icon: ShieldCheck,
    title: 'No-Show Protection',
    description: 'Require a deposit to hold the slot. If they don\'t show, you keep it. Your time is worth protecting.',
    highlight: true,
  },
];

const all_features = [
  {
    icon: Users,
    title: 'Client CRM',
    description: 'Every client\'s visit history, spending, notes, and contact info in one place. Know who\'s in the chair before they sit down.',
  },
  {
    icon: Scissors,
    title: 'Service Menu',
    description: 'List your cuts, fades, beards, and more with prices and durations. Clients see exactly what you offer.',
  },
  {
    icon: Clock,
    title: 'Smart Scheduling',
    description: 'Set your hours, add buffers between appointments, and block off time. No double-bookings, ever.',
  },
  {
    icon: Bell,
    title: 'Appointment Reminders',
    description: 'Automatic email reminders before each appointment. Fewer no-shows, zero effort from you.',
  },
  {
    icon: ListOrdered,
    title: 'Walk-in Queue',
    description: 'Manage walk-ins with a digital queue. Clients know their spot. You stay focused on the cut.',
  },
  {
    icon: ClipboardList,
    title: 'Waitlist',
    description: 'When you\'re fully booked, clients join the waitlist. First in line when a slot opens up.',
  },
  {
    icon: TrendingUp,
    title: 'Growth Tools',
    description: 'See which clients are due for rebooking. Reach out to dormant clients before they forget about you.',
  },
  {
    icon: BarChart3,
    title: 'Revenue Reports',
    description: 'Track earnings by barber, by day, by service. Export to CSV. Know exactly how the shop is doing.',
  },
  {
    icon: Palette,
    title: 'Your Brand, Not Ours',
    description: 'Custom logo, colors, and booking URL. Clients see your shop — MeetingVault stays invisible.',
  },
];

const pain_points = [
  { before: 'Chasing clients for deposits over DMs', after: 'Deposits collected automatically at booking' },
  { before: 'No-shows that waste your best time slots', after: 'Protected slots — they pay or lose the deposit' },
  { before: 'Scrambling to remember client preferences', after: 'Full history and notes before they sit down' },
  { before: '"What time works?" back-and-forth texts', after: 'Clients self-book from your live calendar' },
  { before: 'Walk-ins crowding the shop with no order', after: 'Digital queue — everyone knows their spot' },
  { before: 'No idea which clients haven\'t been back', after: 'Growth alerts for dormant and due clients' },
];

export default function FeaturesPage() {
  return (
    <div className="bg-slate-950 min-h-screen">
      {/* Hero */}
      <section className="pt-20 pb-16 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-amber-400 font-semibold text-sm uppercase tracking-wider mb-3">Built for independent barbers</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Stop losing money.<br />Start running your book.
            </h1>
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
              Online booking, deposits, no-show protection, client history, walk-in queue, and growth tools — all in one place. No contracts. $25/month.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link href="/sign-up" className="bg-amber-600 text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-amber-500 transition-colors text-center">
                Start free trial
              </Link>
              <Link href="/pricing" className="border border-slate-600 text-slate-200 px-8 py-3.5 rounded-lg font-semibold hover:border-amber-500/50 hover:text-white transition-colors text-center">
                See pricing
              </Link>
            </div>
          </div>

          {/* Top 3 features — large cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hero_features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8 hover:border-amber-500/30 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center mb-5 group-hover:bg-amber-500/25 transition-colors">
                    <Icon className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Before / After */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What changes when you switch</h2>
            <p className="text-slate-400 text-lg">Real problems barbers deal with every day — solved.</p>
          </div>
          <div className="space-y-4">
            {pain_points.map((p, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-950/30 border border-red-900/30 rounded-xl px-6 py-4 flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-red-300 text-sm">{p.before}</span>
                </div>
                <div className="bg-emerald-950/30 border border-emerald-900/30 rounded-xl px-6 py-4 flex items-center gap-3">
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-emerald-300 text-sm">{p.after}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Features Grid */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything in one dashboard</h2>
            <p className="text-slate-400 text-lg">No add-ons, no extra tools. It all comes included.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {all_features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center mb-4 group-hover:bg-amber-500/15 transition-colors">
                    <Icon className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social proof / stats */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-amber-600/10 to-amber-500/5 border border-amber-500/20 rounded-2xl p-10 md:p-14 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Built by someone who sat in the chair</h2>
            <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
              We watched barbers lose hundreds every month to no-shows, juggle DMs to book appointments, and scribble client notes on paper. MeetingVault exists because the tools out there weren&apos;t built for how you actually work.
            </p>
            <Link href="/sign-up" className="inline-flex bg-amber-600 text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-amber-500 transition-colors">
              Try it free
            </Link>
          </div>
        </div>
      </section>

      <CTA />
    </div>
  );
}
