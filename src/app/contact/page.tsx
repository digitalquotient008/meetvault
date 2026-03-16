import Link from 'next/link';
import CTA from '@/components/CTA';
import PlanRecommendation from '@/components/PlanRecommendation';

export const metadata = {
  title: 'Contact Us - MeetVault',
  description: 'Get in touch about MeetVault — booking & payments for salons and barbers. Multi-chair plans or questions.',
};

export default function ContactPage() {
  return (
    <div className="bg-slate-950 min-h-screen">
      <section className="py-20 bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-slate-400">
              Interested in multi-chair or shop plans? Let&apos;s discuss how MeetVault can help your salon or barbershop.
            </p>
          </div>

          <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-8">
            <PlanRecommendation />
            <form action="mailto:sales@meetvault.app" method="post" encType="text/plain" className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full rounded-lg border-slate-600 bg-slate-900 text-white placeholder-slate-500 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 border"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full rounded-lg border-slate-600 bg-slate-900 text-white placeholder-slate-500 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 border"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-slate-300 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  className="w-full rounded-lg border-slate-600 bg-slate-900 text-white placeholder-slate-500 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 border"
                  placeholder="Your company"
                />
              </div>

              <div>
                <label htmlFor="plan" className="block text-sm font-medium text-slate-300 mb-2">
                  Interested Plan
                </label>
                <select
                  id="plan"
                  name="plan"
                  className="w-full rounded-lg border-slate-600 bg-slate-900 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 border"
                >
                  <option value="">Select a plan</option>
                  <option value="solo">Free / Solo</option>
                  <option value="teams">Teams</option>
                  <option value="custom">Custom Solution</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="w-full rounded-lg border-slate-600 bg-slate-900 text-white placeholder-slate-500 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 border"
                  placeholder="Tell us about your scheduling needs..."
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition font-semibold"
                >
                  Send Message
                </button>
                <Link
                  href="/pricing"
                  className="flex-1 bg-slate-700 text-slate-200 px-6 py-3 rounded-lg hover:bg-slate-600 transition font-semibold text-center"
                >
                  Back to Pricing
                </Link>
              </div>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-700">
              <p className="text-sm text-slate-400 text-center">
                Or email us directly at{' '}
                <a href="mailto:sales@meetvault.app" className="text-blue-400 hover:text-blue-300 font-medium">
                  sales@meetvault.app
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <CTA />
    </div>
  );
}
