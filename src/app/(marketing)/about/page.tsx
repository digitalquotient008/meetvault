import CTA from '@/components/CTA';

export const metadata = {
  title: 'About',
  description: 'MeetingVault is the modern operating system for barbershops. Bookings, payments, customers, and payouts in one clean system.',
};

export default function AboutPage() {
  return (
    <div className="bg-slate-950 min-h-screen">
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">About MeetingVault</h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              The operating system for modern barbershops
            </p>
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-slate-400 mb-6 text-lg">
              MeetingVault was built for barbershops that want one clean platform: bookings, payments, customer relationships, staff payouts, and growth workflows—with a branded experience the shop actually owns.
            </p>
            <h2 className="text-3xl font-bold text-white mb-6 mt-12">What Makes Us Different</h2>
            <p className="text-slate-400 mb-6 text-lg">
              White-label first, client ownership first, rebooking and retention first. Simpler than salon software, more barber-native than generic schedulers. Transparent fees and better operational reliability.
            </p>
            <h2 className="text-3xl font-bold text-white mb-6 mt-12">Your Data, Your Control</h2>
            <p className="text-slate-400 mb-6 text-lg">
              You own your customer data. Export and use it how you need. No lock-in.
            </p>
          </div>
        </div>
      </section>
      <CTA />
    </div>
  );
}
