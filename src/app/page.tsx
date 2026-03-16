import Hero from '@/components/Hero';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import UseCases from '@/components/UseCases';
import Statistics from '@/components/Statistics';
import Security from '@/components/Security';
import Testimonials from '@/components/Testimonials';
import CTA from '@/components/CTA';

export default function Home() {
  return (
    <>
      <Hero />
      
      <section className="py-12 sm:py-14 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs sm:text-sm font-semibold text-slate-500 mb-6 sm:mb-8 uppercase tracking-wide">
            Built for legal practice
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 md:gap-12">
            <div className="text-slate-400 font-medium text-sm">Law firms</div>
            <div className="text-slate-400 font-medium text-sm">Solo practitioners</div>
            <div className="text-slate-400 font-medium text-sm">Consultants</div>
            <div className="text-slate-400 font-medium text-sm">Coaches</div>
            <div className="text-slate-400 font-medium text-sm">Advisors</div>
          </div>
        </div>
      </section>

      <Features />
      
      <HowItWorks />
      
      <UseCases />
      
      <Statistics />
      
      <Testimonials />
      
      <Security />
      
      <CTA />
    </>
  );
}
