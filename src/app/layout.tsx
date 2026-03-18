import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const siteUrl = (() => {
  const u = process.env.NEXT_PUBLIC_APP_URL || 'https://meetvault.app';
  return u.startsWith('http') ? u : `https://${u}`;
})();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Barber Booking & No-Show Protection Software | MeetVault — $25/mo', template: '%s | MeetVault' },
  description: 'Stop losing money to no-shows. MeetVault lets barbers collect deposits at booking — clients pay upfront or lose their spot. 14-day free trial.',
  keywords: 'barbershop booking, barber scheduling, barber no-show protection, barber deposit software, salon booking, appointment booking, MeetVault',
  openGraph: {
    title: 'Barber Booking & No-Show Protection Software | MeetVault',
    description: 'Stop losing money to no-shows. MeetVault lets barbers collect deposits at booking — clients pay upfront or lose their spot. 14-day free trial.',
    type: 'website',
    url: siteUrl,
    siteName: 'MeetVault',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Barber Booking & No-Show Protection Software | MeetVault',
    description: 'Stop losing money to no-shows. MeetVault lets barbers collect deposits at booking — clients pay upfront or lose their spot.',
  },
  alternates: {
    canonical: siteUrl,
  },
};

// JSON-LD structured data
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'MeetVault',
  legalName: 'DIGITALQUOTIENT SOLUTIONS LLC',
  url: 'https://meetvault.app',
  description: 'Barber booking and no-show protection software for independent barbershops.',
  foundingDate: '2026',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@meetvault.app',
    contactType: 'customer support',
  },
};

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'MeetVault',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'Online booking, deposits, and no-show protection for independent barbers. $25/month.',
  offers: {
    '@type': 'Offer',
    price: '25.00',
    priceCurrency: 'USD',
    priceValidUntil: '2027-12-31',
    availability: 'https://schema.org/InStock',
  },
  aggregateRating: undefined, // Add when you have real reviews
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider signInFallbackRedirectUrl="/app" signUpFallbackRedirectUrl="/app">
      <html lang="en">
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
          />
        </head>
        <body className={`${inter.className} ${inter.variable} bg-slate-950 text-slate-200 antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
