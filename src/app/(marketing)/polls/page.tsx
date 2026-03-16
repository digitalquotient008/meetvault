import Link from 'next/link';
import CTA from '@/components/CTA';

export const metadata = {
  title: 'Meeting Polls',
  description: 'Let invitees vote on the best time. MeetingVault Polls — coming soon.',
};

export default function PollsPage() {
  return (
    <div className="bg-slate-950 min-h-screen">
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Meeting Polls</h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Share a poll, let invitees vote, lock in the best slot. Coming soon.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/app" className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-500 transition font-semibold text-center">
                Go to Dashboard
              </Link>
              <Link href="/features" className="bg-transparent text-slate-200 px-6 py-3 rounded-lg border border-slate-600 hover:border-amber-500 transition font-semibold text-center">
                See all features
              </Link>
            </div>
          </div>
        </div>
      </section>
      <CTA />
    </div>
  );
}
