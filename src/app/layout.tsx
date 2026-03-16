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
  title: 'MeetVault – Client Consultation Platform for Lawyers',
  description: 'Booking, payments, intake, and client history for legal consultations. One platform for lawyers.',
  keywords: 'scheduling, calendar, booking, lawyers, law firm, legal consultation, client intake, appointment scheduling, CRM, MeetVault',
  openGraph: {
    title: 'MeetVault – Client Consultation Platform for Lawyers',
    description: 'Booking, payments, intake, and client history for legal consultations. One platform for lawyers.',
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
    description: 'Client consultation platform for lawyers. Booking, payments, intake, and workflow in one place.',
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
