import Link from 'next/link';
import { APP_URL } from '@/lib/constants';

export default function Hero() {

  return (
    <section className="bg-slate-950 pt-16 pb-12 lg:pt-24 lg:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-5 sm:mb-6 leading-[1.1] tracking-tight">
            MeetVault – booking & payments for salons and barbers
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-slate-400 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed font-normal">
            Online booking, deposits, no-show protection, and client history. Built for solo barbers and salons—reliable payments, reminders you control, no spam.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center items-center">
            <Link
              href={`${APP_URL}/auth/signup`}
              className="bg-blue-600 text-white px-8 py-3.5 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-blue-500 transition-all shadow-md hover:shadow-lg focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 w-full sm:w-auto text-center min-w-[200px]"
            >
              Sign up for free
            </Link>
            <Link
              href="/contact"
              className="border-2 border-slate-600 text-slate-200 px-8 py-3.5 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:border-blue-500 hover:bg-slate-800/50 transition-all w-full sm:w-auto text-center min-w-[200px]"
            >
              Schedule a demo
            </Link>
            <Link
              href="#how-it-works"
              className="text-slate-400 hover:text-white px-8 py-3.5 sm:py-4 text-base sm:text-lg font-semibold transition-colors w-full sm:w-auto text-center"
            >
              See how it works
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
