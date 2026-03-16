'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-amber-400">
              MeetingVault
            </Link>
            <div className="hidden md:flex ml-10 space-x-8">
              <Link href="/features" className="text-slate-400 hover:text-white text-sm font-medium">
                Features
              </Link>
              <Link href="/pricing" className="text-slate-400 hover:text-white text-sm font-medium">
                Pricing
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
            <SignedOut>
              <Link href="/sign-in" className="text-slate-400 hover:text-white text-sm font-medium">
                Log In
              </Link>
              <Link
                href="/sign-up"
                className="bg-amber-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-amber-500 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500 focus-visible:outline-offset-2"
              >
                Sign Up
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/app" className="text-slate-400 hover:text-white text-sm font-medium">
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
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
            <Link href="/features" className="block text-slate-400 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>
              Features
            </Link>
            <Link href="/pricing" className="block text-slate-400 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>
              Pricing
            </Link>
            <Link href="/about" className="block text-slate-400 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>
              About
            </Link>
            <Link href="/contact" className="block text-slate-400 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
