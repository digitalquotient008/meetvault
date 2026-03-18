import Hero from '@/components/Hero';
import ProductPreview from '@/components/ProductPreview';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import Outcomes from '@/components/Outcomes';
import CTA from '@/components/CTA';

export default function Home() {
  return (
    <>
      <Hero />
      <ProductPreview />
      <Features />
      <HowItWorks />
      <Outcomes />
      <CTA />
    </>
  );
}
