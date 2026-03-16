'use client';

import Link from 'next/link';
import { useState } from 'react';
import { APP_URL } from '@/lib/constants';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-400">
              MeetVault
            </Link>
            <div className="hidden md:flex ml-10 space-x-8">
              <Link href="/features" className="text-slate-400 hover:text-white text-sm font-medium">
                Features
              </Link>
              <Link href="/#use-cases" className="text-slate-400 hover:text-white text-sm font-medium">
                Built for how you work
              </Link>
              <Link href="/pricing" className="text-slate-400 hover:text-white text-sm font-medium">
                Pricing
              </Link>
              <Link href="/integrations" className="text-slate-400 hover:text-white text-sm font-medium">
                Integrations
              </Link>
              <Link href="/about" className="text-slate-400 hover:text-white text-sm font-medium">
                About
              </Link>
              <Link href="/contact" className="text-slate-400 hover:text-white text-sm font-medium">
                Contact
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              href={`${APP_URL}/auth/login`}
              className="text-slate-400 hover:text-white text-sm font-medium"
            >
              Log In
            </Link>
            <Link
              href={`${APP_URL}/auth/signup`}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-500 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
            >
              Sign Up
            </Link>
            <button
              className="md:hidden text-slate-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-slate-800">
            <Link href="/contact" className="block py-2 text-blue-400 font-semibold hover:text-blue-300">
              Schedule a demo
            </Link>
            <Link href="/features" className="block text-slate-400 hover:text-white">
              Features
            </Link>
            <Link href="/#use-cases" className="block text-slate-400 hover:text-white">
              Built for how you work
            </Link>
            <Link href="/pricing" className="block text-slate-400 hover:text-white">
              Pricing
            </Link>
            <Link href="/integrations" className="block text-slate-400 hover:text-white">
              Integrations
            </Link>
            <Link href="/about" className="block text-slate-400 hover:text-white">
              About
            </Link>
            <Link href="/contact" className="block text-slate-400 hover:text-white">
              Contact
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
