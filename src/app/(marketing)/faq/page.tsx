import Link from 'next/link';
import CTA from '@/components/CTA';
import { FAQ_ITEMS } from '@/lib/faq';

export const metadata = {
  title: 'Frequently Asked Questions',
  description: 'Common questions about MeetVault — how pricing works, how deposits protect against no-shows, how payments are processed via Stripe, and more.',
  alternates: { canonical: '/faq' },
};

// JSON-LD FAQPage schema for rich results in Google
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

export default function FAQPage() {
  return (
    <div className="bg-slate-950 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <section className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-slate-400">
            Quick answers about MeetVault. <Link href="/contact" className="text-amber-400 hover:text-amber-300 font-medium">Contact us</Link> if you need more.
          </p>
        </div>
      </section>
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {FAQ_ITEMS.map((item, index) => (
              <div key={index} className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors">
                <h2 className="text-lg font-semibold text-white mb-2">{item.question}</h2>
                <p className="text-slate-400 mb-3">{item.answer}</p>
                {item.link && (
                  <Link href={item.link} className="inline-flex items-center text-sm font-medium text-amber-400 hover:text-amber-300">
                    {item.linkLabel ?? 'Learn more'} <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      <CTA />
    </div>
  );
}
