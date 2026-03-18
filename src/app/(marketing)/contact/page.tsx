import Link from 'next/link';
import CTA from '@/components/CTA';

export const metadata = {
  title: 'Contact Us — MeetVault',
  description: 'Get in touch about MeetVault. Questions about pricing, Team plans for multi-barber shops, or need help getting started? We respond within one business day.',
  alternates: { canonical: '/contact' },
};

type Props = { searchParams: Promise<{ plan?: string }> };

export default async function ContactPage({ searchParams }: Props) {
  const { plan } = await searchParams;
  const isTeamInquiry = plan === 'team';

  return (
    <div className="bg-slate-950 min-h-screen">
      <section className="py-20 bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {isTeamInquiry ? 'Get Team Pricing' : 'Contact Us'}
            </h1>
            <p className="text-xl text-slate-400">
              {isTeamInquiry
                ? 'Tell us about your shop and we\'ll put together a plan that fits.'
                : 'Have a question or want to learn more? We\'re here to help.'}
            </p>
          </div>

          {isTeamInquiry && (
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5 mb-8 flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-blue-300 text-sm font-medium">Team Plan Inquiry</p>
                <p className="text-slate-400 text-sm">
                  Unlimited barbers, per-barber scheduling, commission tracking, staff permissions, and priority support. We&apos;ll customize pricing based on your shop size.
                </p>
              </div>
            </div>
          )}

          <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-8">
            <form action="mailto:sales@meetingvault.app" method="post" encType="text/plain" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">Name *</label>
                  <input type="text" id="name" name="name" required className="w-full rounded-lg border-slate-600 bg-slate-900 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-amber-500 px-4 py-3 border" placeholder="Your name" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
                  <input type="email" id="email" name="email" required className="w-full rounded-lg border-slate-600 bg-slate-900 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-amber-500 px-4 py-3 border" placeholder="your@email.com" />
                </div>
              </div>

              {isTeamInquiry && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="shopName" className="block text-sm font-medium text-slate-300 mb-2">Shop name</label>
                    <input type="text" id="shopName" name="shopName" className="w-full rounded-lg border-slate-600 bg-slate-900 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-amber-500 px-4 py-3 border" placeholder="e.g. Classic Cuts" />
                  </div>
                  <div>
                    <label htmlFor="barberCount" className="block text-sm font-medium text-slate-300 mb-2">How many barbers?</label>
                    <select id="barberCount" name="barberCount" className="w-full rounded-lg border-slate-600 bg-slate-900 text-white focus:border-amber-500 focus:ring-amber-500 px-4 py-3 border">
                      <option value="">Select...</option>
                      <option value="2-3">2–3 barbers</option>
                      <option value="4-6">4–6 barbers</option>
                      <option value="7-10">7–10 barbers</option>
                      <option value="10+">10+ barbers</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                  {isTeamInquiry ? 'Tell us about your shop' : 'Message *'}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required={!isTeamInquiry}
                  className="w-full rounded-lg border-slate-600 bg-slate-900 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-amber-500 px-4 py-3 border"
                  placeholder={isTeamInquiry
                    ? 'e.g. We have 5 barbers and 2 locations. Currently using Squire but looking to switch...'
                    : 'Tell us about your barbershop...'}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button type="submit" className="flex-1 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-500 transition font-semibold">
                  {isTeamInquiry ? 'Request Team Pricing' : 'Send Message'}
                </button>
                <Link href="/pricing" className="flex-1 bg-slate-700 text-slate-200 px-6 py-3 rounded-lg hover:bg-slate-600 transition font-semibold text-center">
                  Back to Pricing
                </Link>
              </div>
            </form>
            <p className="mt-8 pt-8 border-t border-slate-700 text-sm text-slate-400 text-center">
              Or email <a href="mailto:sales@meetingvault.app" className="text-amber-400 hover:text-amber-300 font-medium">sales@meetingvault.app</a> directly
            </p>
          </div>
        </div>
      </section>
      <CTA />
    </div>
  );
}
