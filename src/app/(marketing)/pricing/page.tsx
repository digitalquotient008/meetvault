import CTA from '@/components/CTA';
import PricingCards from '@/components/PricingCards';

export const metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for independent barbers. One plan at $25/month with a 14-day free trial.',
};

export default function PricingPage() {
  const faqs = [
    {
      question: 'How does the free trial work?',
      answer: 'Add a card during signup — you won\'t be charged until the 14-day trial ends. You get full access to every feature immediately. If you cancel before the trial is up, you pay nothing.',
    },
    {
      question: "What\u2019s included in the $25/month?",
      answer: 'Everything: online booking, deposits, no-show protection, client CRM, walk-in queue, waitlist, staff scheduling, appointment reminders, growth tools, revenue reports, and custom branding. One plan, zero add-ons.',
    },
    {
      question: 'Can I use my own branding?',
      answer: 'Yes. Your booking page uses your shop name, logo, brand colors, and custom URL slug. Clients see your brand, not ours.',
    },
    {
      question: 'How do payments work?',
      answer: 'Deposits and payments are processed through Stripe. Money goes directly to your Stripe account. We never touch or hold your funds.',
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes. No contracts, no cancellation fees. Cancel from your dashboard whenever you want and your subscription stops at the end of the billing period.',
    },
  ];

  return (
    <div className="bg-slate-950 min-h-screen">
      <section className="pt-20 pb-24 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-3">Simple pricing</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
              One plan. Everything included.
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              No tiers, no upsells, no hidden fees. Try free for 14 days, then $25/month.
            </p>
          </div>
          <PricingCards />
        </div>
      </section>

      <section id="faq" className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-4">Questions &amp; answers</h2>
            <p className="text-slate-400">Everything you need to know before you start.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-7 hover:border-slate-700 transition-colors">
                <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                <p className="text-slate-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTA
        title="Try it free for 14 days"
        description="Full access for 14 days. Cancel anytime — you won't be charged until the trial ends."
      />
    </div>
  );
}
