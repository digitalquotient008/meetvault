import Link from 'next/link';
import CTA from '@/components/CTA';
import PricingCards from '@/components/PricingCards';

export const metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for MeetingVault — the operating system for modern barbershops.',
};

export default function PricingPage() {
  const faqs = [
    { question: 'How do I get started?', answer: 'Sign up with your email. No credit card required. Create your shop, add services and staff, and share your booking link.' },
    { question: "What's included?", answer: 'Booking engine, deposits, client CRM, staff schedules, availability, and white-label booking pages. Payments and reminders in later phases.' },
    { question: 'Can I use my own branding?', answer: 'Yes. Your booking page uses your logo, colors, and slug. The shop is the hero, not MeetingVault.' },
    { question: 'Is there a free tier?', answer: 'Yes. Start free and upgrade as you grow. No hidden fees.' },
  ];

  return (
    <div className="bg-slate-950 min-h-screen">
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Simple pricing for barbershops</h1>
            <PricingCards />
            <div className="text-center mt-8">
              <Link href="/contact" className="inline-flex items-center text-amber-400 hover:text-amber-300 font-semibold">
                Need help choosing? Schedule a demo
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
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
