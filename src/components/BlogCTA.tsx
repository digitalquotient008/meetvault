import Link from 'next/link';

export default function BlogCTA() {
  return (
    <div className="mt-12 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-8 text-center">
      <h3 className="text-xl font-bold text-white mb-2">
        Ready to stop losing money to no-shows?
      </h3>
      <p className="text-slate-400 mb-6 max-w-lg mx-auto">
        MeetVault collects deposits at booking — clients pay upfront or lose their spot. Set up in 5 minutes. $25/month.
      </p>
      <Link
        href="/sign-up"
        className="inline-block bg-amber-500 text-slate-950 px-8 py-3.5 rounded-xl font-bold hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
      >
        Start Your Free 14-Day Trial
      </Link>
      <p className="text-slate-500 text-xs mt-3">Card required — no charge for 14 days</p>
    </div>
  );
}
