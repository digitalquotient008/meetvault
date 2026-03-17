import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — MeetVault',
  description: 'MeetVault Terms of Service — the agreement between you and DIGITALQUOTIENT SOLUTIONS LLC.',
};

export default function TermsPage() {
  return (
    <div className="bg-slate-950 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-10">Last updated: March 17, 2026</p>

        <div className="prose prose-lg prose-invert max-w-none space-y-8 text-slate-400 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-10 [&_h2]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2">

          <section>
            <h2>1. Agreement to Terms</h2>
            <p>
              MeetVault is a product operated by DIGITALQUOTIENT SOLUTIONS LLC, a Texas limited liability company (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;). By accessing or using MeetVault (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. We reserve the right to update these terms at any time. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2>2. Description of Service</h2>
            <p>
              MeetVault is a cloud-based software platform that provides appointment scheduling, payment processing, client management, and related tools for barbershops and salons. The Service is provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo;
            </p>
            <p>
              The Service may be in an early or evolving stage. Features may change, be added, removed, or be incomplete at any time. We are continuously improving the platform and appreciate your feedback during this process.
            </p>
          </section>

          <section>
            <h2>3. Accounts &amp; Registration</h2>
            <ul>
              <li>You must provide accurate, complete information when creating an account.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must be at least 18 years old to use the Service.</li>
              <li>One person or business entity may not maintain more than one free trial.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
            </ul>
          </section>

          <section>
            <h2>4. Subscription &amp; Billing</h2>
            <ul>
              <li>The Company offers a 14-day free trial. A valid payment method is required to start the trial.</li>
              <li>After the trial period, your payment method will be automatically charged the applicable subscription fee ($25/month for Starter; custom pricing for Team).</li>
              <li>Subscriptions renew automatically each billing cycle unless canceled before the renewal date.</li>
              <li>You may cancel at any time from your dashboard. Cancellation takes effect at the end of the current billing period — no prorated refunds are issued for partial months.</li>
              <li>We reserve the right to change pricing with 30 days&apos; notice. Existing subscribers will be notified via email before any price change takes effect.</li>
              <li>Failed payments may result in suspension of access. We will attempt to notify you before suspending your account.</li>
            </ul>
          </section>

          <section>
            <h2>5. Payment Processing</h2>
            <p>
              Payment processing for client deposits, service payments, and subscription fees is handled by Stripe, Inc. By using MeetVault, you also agree to Stripe&apos;s <a href="https://stripe.com/legal" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300">Terms of Service</a> and <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300">Privacy Policy</a>.
            </p>
            <ul>
              <li>Client payments flow directly to the shop owner&apos;s Stripe Connect account. The Company does not hold or custody client funds.</li>
              <li>The Company may collect a platform fee on transactions processed through Stripe Connect, as disclosed in your account settings.</li>
              <li>Refunds, chargebacks, and payment disputes are the responsibility of the shop owner. The Company is not liable for disputed transactions.</li>
              <li>MeetVault is not a financial institution, money transmitter, or payment processor. All payment processing is performed by Stripe, Inc.</li>
            </ul>
          </section>

          <section>
            <h2>6. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for any unlawful purpose or to violate any laws.</li>
              <li>Attempt to gain unauthorized access to the Service, other accounts, or related systems.</li>
              <li>Interfere with or disrupt the Service or servers.</li>
              <li>Scrape, crawl, or use automated means to access the Service without permission.</li>
              <li>Upload malicious code, viruses, or harmful content.</li>
              <li>Resell, sublicense, or redistribute the Service without our written consent.</li>
              <li>Use the Service to send unsolicited communications (spam) to customers.</li>
            </ul>
            <p>
              We reserve the right to refuse service to anyone at our sole discretion, at any time, for any reason.
            </p>
          </section>

          <section>
            <h2>7. Intellectual Property</h2>
            <p>
              The Service, including all code, design, branding, and documentation, is owned by DIGITALQUOTIENT SOLUTIONS LLC and protected by copyright, trademark, and other intellectual property laws. You retain ownership of your data (customer records, appointment history, etc.). We claim no intellectual property rights over your content.
            </p>
          </section>

          <section>
            <h2>8. Data Ownership &amp; Portability</h2>
            <ul>
              <li>You own your data. We do not sell, rent, or share your customer data with third parties for marketing purposes.</li>
              <li>You may export your data at any time via CSV export.</li>
              <li>Upon account deletion, we will delete your data within 30 days, except where retention is required by law or for legitimate business purposes (e.g., financial records).</li>
            </ul>
          </section>

          <section>
            <h2>9. No-Show &amp; Cancellation Fees</h2>
            <p>
              Shop owners are responsible for setting and communicating their own no-show and cancellation policies to their clients. The Company provides the tools to enforce these policies (deposit collection, automatic charges) but is not a party to the agreement between the shop and its clients. The Company is not liable for disputes arising from no-show or cancellation fee charges.
            </p>
          </section>

          <section>
            <h2>10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, the Company shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, revenue, data, or business opportunities, arising from your use of the Service. Our total liability for any claim arising from the Service shall not exceed the amount you paid to the Company in the 12 months preceding the claim. In no event shall the Company be liable for any loss of data, business interruption, or unauthorized access to user data.
            </p>
          </section>

          <section>
            <h2>11. Disclaimer of Warranties</h2>
            <p>
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, express or implied, including but not limited to merchantability, fitness for a particular purpose, and non-infringement. We do not guarantee that the Service will be available at all times or free from interruptions, delays, errors, or security vulnerabilities. Scheduled and unscheduled downtime may occur.
            </p>
          </section>

          <section>
            <h2>12. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless DIGITALQUOTIENT SOLUTIONS LLC and its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including reasonable attorney&apos;s fees) arising from your use of the Service, your violation of these Terms, or your violation of any rights of a third party.
            </p>
          </section>

          <section>
            <h2>13. No Guarantee of Results</h2>
            <p>
              The Company does not guarantee any specific business outcomes, revenue, customer growth, or performance results from using the Service. Results depend on many factors outside our control, including but not limited to your pricing, location, service quality, and market conditions.
            </p>
          </section>

          <section>
            <h2>14. Data Loss Disclaimer</h2>
            <p>
              You are responsible for maintaining backups of your data. The Company is not responsible for any data loss, corruption, or unauthorized access resulting from factors beyond our reasonable control, including but not limited to third-party service failures, cyberattacks, or user error.
            </p>
          </section>

          <section>
            <h2>15. Service Modifications</h2>
            <p>
              We reserve the right to modify, suspend, or discontinue any part of the Service at any time, with or without notice. The Company shall not be liable to you or any third party for any modification, suspension, or discontinuation of the Service.
            </p>
          </section>

          <section>
            <h2>16. Force Majeure</h2>
            <p>
              The Company shall not be liable for any failure or delay in performance due to events beyond our reasonable control, including but not limited to internet outages, third-party service failures (Stripe, Clerk, hosting providers), natural disasters, pandemics, government actions, or acts of God.
            </p>
          </section>

          <section>
            <h2>17. Dispute Resolution &amp; Arbitration</h2>
            <p>
              Any dispute arising out of or relating to these Terms or the Service shall be resolved through binding arbitration rather than in court, except where prohibited by applicable law. Arbitration shall be conducted in the State of Texas under the rules of the American Arbitration Association. You agree to waive any right to participate in class action lawsuits or class-wide arbitration. Each party shall bear its own costs of arbitration unless the arbitrator determines otherwise.
            </p>
          </section>

          <section>
            <h2>18. Termination</h2>
            <ul>
              <li>We may suspend, restrict, or terminate your account at any time, without liability, if we believe you have violated these Terms or pose a risk to the Service, its users, or its infrastructure.</li>
              <li>You may terminate your account at any time by canceling your subscription and contacting support.</li>
              <li>Upon termination, your right to use the Service ceases immediately. Data deletion follows the process described in Section 8.</li>
            </ul>
          </section>

          <section>
            <h2>19. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of Texas, without regard to its conflict of law provisions. Any disputes not subject to arbitration shall be resolved in the state or federal courts located in Denton County, Texas, and you consent to the personal jurisdiction of such courts.
            </p>
          </section>

          <section>
            <h2>20. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid by a court of competent jurisdiction, the remaining provisions will continue in full force and effect.
            </p>
          </section>

          <section>
            <h2>21. Entire Agreement</h2>
            <p>
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and the Company regarding the Service and supersede all prior agreements, representations, and understandings.
            </p>
          </section>

          <section>
            <h2>22. Contact</h2>
            <p>
              For questions about these Terms, contact us at{' '}
              <a href="mailto:legal@meetvault.app" className="text-amber-400 hover:text-amber-300">legal@meetvault.app</a>.
            </p>
            <p className="mt-4">
              DIGITALQUOTIENT SOLUTIONS LLC<br />
              State of Texas
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
