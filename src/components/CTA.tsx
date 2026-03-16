import Link from 'next/link';
import { APP_URL } from '@/lib/constants';

interface CTAProps {
  title?: string;
  description?: string;
  buttonText?: string;
  variant?: 'primary' | 'secondary';
}

export default function CTA({ 
  title = 'Ready to get started?',
  description = 'Join lawyers and firms who run consultations on MeetVault.',
  buttonText = 'Sign up for free',
  variant = 'primary'
}: CTAProps) {
  return (
    <section className={`py-16 sm:py-20 ${variant === 'primary' ? 'bg-gradient-to-br from-blue-600 to-indigo-700' : 'bg-slate-900'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 ${variant === 'primary' ? 'text-white' : 'text-white'}`}>
          {title}
        </h2>
        <p className={`text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 leading-relaxed ${variant === 'primary' ? 'text-blue-100' : 'text-slate-400'}`}>
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          <Link
            href={`${APP_URL}/auth/signup`}
            className={`inline-block px-8 py-3.5 sm:py-4 rounded-lg text-base sm:text-lg font-semibold transition-all shadow-md hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 w-full sm:w-auto text-center ${
              variant === 'primary'
                ? 'bg-white text-blue-600 hover:bg-slate-100 focus-visible:outline-white'
                : 'bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-blue-500'
            }`}
          >
            {buttonText}
          </Link>
          <Link
            href="/contact"
            className={`inline-block px-8 py-3.5 sm:py-4 rounded-lg text-base sm:text-lg font-semibold transition-all border-2 w-full sm:w-auto text-center ${
              variant === 'primary'
                ? 'border-white text-white hover:bg-white/10 focus-visible:outline-white'
                : 'border-slate-600 text-slate-200 hover:border-blue-500 hover:bg-slate-800/50'
            }`}
          >
            Schedule a demo
          </Link>
        </div>
        {variant === 'primary' && (
          <p className="text-sm text-blue-200 mt-5 sm:mt-6">No credit card required • Setup in 2 minutes</p>
        )}
      </div>
    </section>
  );
}
