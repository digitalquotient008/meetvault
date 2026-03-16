import CTA from '@/components/CTA';
import PricingCards from '@/components/PricingCards';

export const metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for independent barbers. One plan, everything included.',
};

export default function PricingPage() {
  const faqs = [
    { question: 'How do I get started?', answer: 'Sign up with your email. No credit card required. Create your shop, add your services and hours, and share your booking link.' },
    { question: "What's included in the $25/month?", answer: 'Everything: online booking, deposits, client CRM, walk-in queue, waitlist, staff scheduling, reminders, growth tools, reports, and white-label branding.' },
    { question: 'Can I use my own branding?', answer: 'Yes. Your booking page uses your shop name, colors, and custom URL slug. Clients see your brand, not ours.' },
    { question: 'How do payments work?', answer: 'Deposits and payments are processed via Stripe. Money goes directly to your Stripe account. We never hold your funds.' },
  ];

  return (
    <div className="bg-slate-950 min-h-screen">
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">One plan. Everything included.</h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-12">
              No tiers, no upsells. Get every feature for one flat price.
            </p>
            <PricingCards />
          </div>
        </div>
      </section>
      <section id="faq" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-slate-800/80 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
                <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                <p className="text-slate-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CTA />
    </div>
  );
}
