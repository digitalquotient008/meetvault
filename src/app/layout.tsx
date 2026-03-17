import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(
    (() => {
      const u = process.env.NEXT_PUBLIC_APP_URL || 'https://meetvault.app';
      return u.startsWith('http') ? u : `https://${u}`;
    })()
  ),
  title: { default: 'Barber Booking & No-Show Protection Software | MeetVault — $25/mo', template: '%s | MeetVault' },
  description: 'Online booking, deposits, and no-show protection for independent barbers. Clients book and pay upfront — you keep the deposit if they ghost. $25/mo.',
  keywords: 'barbershop booking, barber scheduling, barber no-show protection, barber deposit software, salon booking, appointment booking, MeetVault',
  openGraph: {
    title: 'Barber Booking & No-Show Protection Software | MeetVault',
    description: 'Online booking, deposits, and no-show protection for independent barbers. $25/mo — 14-day free trial.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider signInFallbackRedirectUrl="/app" signUpFallbackRedirectUrl="/app">
      <html lang="en">
        <body className={`${inter.className} ${inter.variable} bg-slate-950 text-slate-200 antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
