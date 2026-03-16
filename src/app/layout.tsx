import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://meetvault.app'),
  title: 'MeetVault – Booking & Payments for Salons and Barbers',
  description: 'Online booking, deposits, no-show protection, and client history for salons and solo barbers.',
  keywords: 'salon booking, barbershop app, barber scheduling, salon software, appointment booking, no-show protection, MeetVault',
  openGraph: {
    title: 'MeetVault – Booking & Payments for Salons and Barbers',
    description: 'Online booking, deposits, no-show protection, and client history for salons and solo barbers.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MeetVault',
    url: 'https://meetvault.app',
    description: 'Booking and payments for salons and barbers. Reliable payments, reminders you control, no spam.',
  };

  return (
    <html lang="en">
      <body className={`${inter.className} ${inter.variable} bg-slate-950 text-slate-200`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Header />
        <main>{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
