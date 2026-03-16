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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://meetingvault.app'),
  title: { default: 'MeetingVault – The operating system for modern barbershops', template: '%s | MeetingVault' },
  description: 'Bookings, payments, customer relationships, staff payouts, and growth workflows in one clean platform that the shop actually controls.',
  keywords: 'barbershop booking, barber scheduling, salon software, appointment booking, no-show protection, MeetingVault, Squire alternative',
  openGraph: {
    title: 'MeetingVault – The operating system for modern barbershops',
    description: 'Bookings, payments, customers, and payouts — finally in one clean system.',
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
