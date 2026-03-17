import Link from 'next/link';

interface CTAProps {
  title?: string;
  description?: string;
  buttonText?: string;
}

export default function CTA({
  title = 'Ready to run your book?',
  description = 'Join barbers who stopped chasing bookings and started getting paid on time.',
  buttonText = 'Start your 14-day free trial',
}: CTAProps) {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-amber-600 to-amber-700" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-amber-500/30 via-transparent to-transparent" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
          {title}
        </h2>
        <p className="text-lg sm:text-xl text-amber-100/90 mb-10 leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>

        <Link
          href="/sign-up"
          className="inline-block bg-white text-amber-700 px-10 py-4 rounded-xl text-lg font-bold hover:bg-amber-50 transition-all shadow-xl shadow-amber-900/30 hover:shadow-amber-900/40"
        >
          {buttonText}
        </Link>
        <p className="text-amber-200/60 text-sm mt-3">Card required — no charge for 14 days</p>

        <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-sm text-amber-200/80">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            14-day free trial
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            Not charged until trial ends
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            Cancel anytime
          </span>
        </div>
      </div>
    </section>
  );
}
