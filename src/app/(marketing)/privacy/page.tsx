import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — MeetVault',
  description: 'MeetVault Privacy Policy — how we collect, use, store, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <div className="bg-slate-950 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-10">Last updated: March 17, 2026</p>

        <div className="prose prose-lg prose-invert max-w-none space-y-8 text-slate-400 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-10 [&_h2]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-200 [&_h3]:mt-6 [&_h3]:mb-2">

          <section>
            <h2>1. Introduction</h2>
            <p>
              MeetVault (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates the MeetVault platform. This Privacy Policy explains how we collect, use, store, share, and protect information when you use our Service — whether you are a shop owner (merchant) or a customer booking through a shop&apos;s booking page.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>

            <h3>Account Information (Shop Owners)</h3>
            <ul>
              <li>Name, email address, phone number</li>
              <li>Shop name, address, logo, and branding preferences</li>
              <li>Authentication data via Clerk (our identity provider)</li>
              <li>Subscription and billing information (processed by Stripe)</li>
            </ul>

            <h3>Customer Information (Collected by Shops)</h3>
            <ul>
              <li>Name, email address, phone number (provided during booking)</li>
              <li>Appointment history, visit frequency, and service preferences</li>
              <li>Notes added by the shop owner</li>
              <li>Payment method details (card last 4 digits, brand — stored by Stripe, not by us)</li>
            </ul>

            <h3>Automatically Collected Information</h3>
            <ul>
              <li>IP address (used for rate limiting and security, not tracking)</li>
              <li>Browser type and device information</li>
              <li>Pages visited and usage patterns (anonymized analytics)</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <ul>
              <li><strong>Provide the Service:</strong> Process bookings, send appointment reminders, manage customer records, and handle payments.</li>
              <li><strong>Communicate with you:</strong> Send transactional emails (booking confirmations, reminders, cancellations), trial reminders, and essential service updates.</li>
              <li><strong>Improve the Service:</strong> Analyze usage patterns (in aggregate) to improve features and fix issues.</li>
              <li><strong>Protect the Service:</strong> Detect and prevent fraud, abuse, and security threats (rate limiting, anomaly detection).</li>
              <li><strong>Comply with the law:</strong> Respond to legal requests and meet regulatory obligations.</li>
            </ul>
            <p>
              <strong>We do not</strong> sell, rent, or share your personal data with third parties for advertising or marketing purposes. Ever.
            </p>
          </section>

          <section>
            <h2>4. Third-Party Services</h2>
            <p>We use the following third-party services to operate MeetVault:</p>
            <ul>
              <li><strong>Stripe</strong> — Payment processing and subscription billing. Stripe stores card details; we only receive the last 4 digits and card brand. See <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300">Stripe&apos;s Privacy Policy</a>.</li>
              <li><strong>Clerk</strong> — Authentication and user management. See <a href="https://clerk.com/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300">Clerk&apos;s Privacy Policy</a>.</li>
              <li><strong>Resend</strong> — Transactional email delivery (booking confirmations, reminders).</li>
              <li><strong>Twilio</strong> — SMS reminders (only if configured by the shop owner). Phone numbers are shared with Twilio solely for message delivery.</li>
              <li><strong>Vercel</strong> — Hosting and infrastructure. See <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300">Vercel&apos;s Privacy Policy</a>.</li>
              <li><strong>Neon</strong> — Database hosting (PostgreSQL). Data is encrypted at rest and in transit.</li>
            </ul>
          </section>

          <section>
            <h2>5. Data Storage &amp; Security</h2>
            <ul>
              <li>Data is stored in secure, encrypted PostgreSQL databases hosted on Neon (US-East region).</li>
              <li>All data in transit is encrypted via TLS/HTTPS.</li>
              <li>Payment card data is never stored on our servers — it is handled entirely by Stripe (PCI DSS compliant).</li>
              <li>Access to production systems is restricted to authorized personnel only.</li>
              <li>We use rate limiting, CRON_SECRET protection, and webhook signature verification to prevent unauthorized access.</li>
            </ul>
          </section>

          <section>
            <h2>6. Data Ownership &amp; Control</h2>

            <h3>For Shop Owners</h3>
            <ul>
              <li>You own your customer data. MeetVault is a data processor acting on your behalf.</li>
              <li>You can export all customer data at any time via CSV export.</li>
              <li>You can delete individual customer records from the dashboard.</li>
              <li>Upon account deletion, all shop data (customers, appointments, payments) will be permanently deleted within 30 days, except where retention is required by law.</li>
            </ul>

            <h3>For Customers (Booking Through a Shop)</h3>
            <ul>
              <li>Your data is controlled by the shop you booked with. Contact the shop directly for data access, correction, or deletion requests.</li>
              <li>MeetVault does not use your booking data for any purpose other than providing the Service to the shop you booked with.</li>
              <li>You can request deletion of your data by contacting <a href="mailto:privacy@meetvault.app" className="text-amber-400 hover:text-amber-300">privacy@meetvault.app</a>.</li>
            </ul>
          </section>

          <section>
            <h2>7. Email &amp; SMS Communications</h2>
            <ul>
              <li><strong>Transactional messages</strong> (booking confirmations, reminders, cancellations) are sent automatically as part of the Service and cannot be opted out of.</li>
              <li><strong>Marketing messages</strong> (broadcast, win-back campaigns) are only sent by shop owners to their own customers. Shops are responsible for obtaining appropriate consent.</li>
              <li><strong>SMS messages</strong> are only sent if the shop owner has configured Twilio and the customer provided a phone number during booking.</li>
            </ul>
          </section>

          <section>
            <h2>8. Cookies</h2>
            <p>
              MeetVault uses essential cookies for authentication (via Clerk) and session management. We do not use advertising cookies, tracking pixels, or third-party analytics cookies. No cookie consent banner is required because we only use strictly necessary cookies.
            </p>
          </section>

          <section>
            <h2>9. Data Retention</h2>
            <ul>
              <li><strong>Active accounts:</strong> Data is retained for the duration of the subscription.</li>
              <li><strong>Canceled accounts:</strong> Data is retained for 30 days after cancellation to allow reactivation, then permanently deleted.</li>
              <li><strong>Financial records:</strong> Payment and transaction records may be retained for up to 7 years for tax and legal compliance.</li>
              <li><strong>Audit logs:</strong> Retained for 12 months for security and debugging purposes.</li>
            </ul>
          </section>

          <section>
            <h2>10. Children&apos;s Privacy</h2>
            <p>
              MeetVault is not intended for use by individuals under 18 years of age. We do not knowingly collect personal information from children. If we learn that we have collected data from a child under 18, we will delete it promptly.
            </p>
          </section>

          <section>
            <h2>11. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Data portability (receive your data in a structured format)</li>
            </ul>
            <p>
              To exercise any of these rights, contact <a href="mailto:privacy@meetvault.app" className="text-amber-400 hover:text-amber-300">privacy@meetvault.app</a>. We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2>12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. If we make material changes, we will notify you by email or by posting a notice on the Service at least 14 days before the changes take effect. Your continued use of the Service after the effective date constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2>13. Contact</h2>
            <p>
              For privacy-related questions or requests, contact us at{' '}
              <a href="mailto:privacy@meetvault.app" className="text-amber-400 hover:text-amber-300">privacy@meetvault.app</a>.
            </p>
            <p>
              For general support, contact{' '}
              <a href="mailto:support@meetvault.app" className="text-amber-400 hover:text-amber-300">support@meetvault.app</a>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800">
          <Link href="/" className="text-amber-400 hover:text-amber-300">&larr; Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
