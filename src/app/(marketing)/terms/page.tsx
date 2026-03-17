import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service',
  description: 'MeetVault Terms of Service.',
};

export default function TermsPage() {
  return (
    <div className="bg-slate-950 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
        <div className="prose prose-lg prose-invert max-w-none space-y-6 text-slate-400">
          <p className="text-sm text-slate-500">Last updated: March 2025</p>
          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>By using MeetVault, you accept and agree to be bound by these terms.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Use License</h2>
            <p>Permission is granted to use MeetVault for barbershop and salon scheduling. You may not reverse engineer or misuse the service.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Contact</h2>
            <p>Questions? Contact <a href="mailto:legal@meetingvault.app" className="text-amber-400 hover:text-amber-300">legal@meetingvault.app</a></p>
          </section>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800">
          <Link href="/" className="text-amber-400 hover:text-amber-300">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
