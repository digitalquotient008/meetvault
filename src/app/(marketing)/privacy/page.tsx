import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy',
  description: 'MeetVault Privacy Policy — how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <div className="bg-slate-950 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <div className="prose prose-lg prose-invert max-w-none space-y-6 text-slate-400">
          <p className="text-sm text-slate-500">Last updated: March 2025</p>
          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Information We Collect</h2>
            <p>We collect account, booking, and contact information. Payments are processed via Stripe.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Your Data</h2>
            <p>Shop owners control their customer data. You can export and delete your data.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Contact</h2>
            <p>Questions? <a href="mailto:privacy@meetingvault.app" className="text-amber-400 hover:text-amber-300">privacy@meetingvault.app</a></p>
          </section>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800">
          <Link href="/" className="text-amber-400 hover:text-amber-300">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
