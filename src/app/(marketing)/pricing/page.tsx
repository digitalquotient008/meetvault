import CTA from '@/components/CTA';
import PricingCards from '@/components/PricingCards';

export const metadata = {
  title: 'Pricing',
  description: 'Simple pricing for barbers. Starter at $25/month for solo barbers. Team plan for multi-barber shops — talk to sales.',
  alternates: { canonical: '/pricing' },
};

export default function PricingPage() {
  const faqs = [
    {
      question: 'How does the free trial work?',
      answer: 'Add a card during signup — you won\'t be charged until the 14-day trial ends. You get full access to every Starter feature immediately. If you cancel before the trial is up, you pay nothing.',
    },
    {
      question: 'How do payments work?',
      answer: 'Client deposits and payments are processed securely through Stripe — the same platform used by Shopify, Amazon, and Instacart. Money goes directly to your Stripe account. We never touch, hold, or have access to your funds or your clients\' card details.',
    },
    {
      question: 'What\'s the difference between Starter and Team?',
      answer: 'Starter is for solo barbers — 1 staff member, all features included. Team is for shops with multiple barbers or salon suites — unlimited staff, per-barber scheduling, commission tracking, staff permissions, and priority support. Team pricing is custom based on your shop size.',
    },
    {
      question: 'How does Team pricing work?',
      answer: 'We price Team plans based on the number of barbers in your shop. Get in touch and we\'ll put together a plan that fits. No long-term contracts required.',
    },
    {
      question: 'Can I upgrade from Starter to Team later?',
      answer: 'Yes. Start with Starter and upgrade anytime. Your client data, appointments, and settings all carry over — nothing is lost.',
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
              Solo or team. We&apos;ve got you.
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Start with Starter for $25/month. Running a multi-barber shop? Talk to us about Team.
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
