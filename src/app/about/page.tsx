import CTA from '@/components/CTA';

export const metadata = {
  title: 'About - MeetVault',
  description: 'MeetVault is booking and payments for salons and barbers. Reliable payments, reminders you control, no spam.',
};

export default function AboutPage() {
  return (
    <div className="bg-slate-950 min-h-screen">
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              About MeetVault
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Booking & payments for salons and barbers
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-slate-400 mb-6 text-lg">
              MeetVault was built for salons and barbers who want booking and payments that work: 
              reliable payment confirmation (no “booked but payment failed”), reminders you control with no spam or 
              marketing blasts, and client history in one place. Free to start.
            </p>
            
            <h2 className="text-3xl font-bold text-white mb-6 mt-12">What Makes Us Different</h2>
            <p className="text-slate-400 mb-6 text-lg">
              We focus on what the chair needs: online booking, deposits and no-show protection, appointment reminders 
              only (no unsolicited promos), and client notes. Payments confirm before the appointment so you don’t get 
              “booked but not paid.” Built for solo barbers and salons. Self-hostable—you own your data.
            </p>
            
            <h2 className="text-3xl font-bold text-white mb-6 mt-12">Our Approach</h2>
            <p className="text-slate-400 mb-6 text-lg">
              We add features based on feedback from barbers and salon owners. Your book drives our roadmap.
            </p>
            
            <h2 className="text-3xl font-bold text-white mb-6 mt-12">Your Data, Your Control</h2>
            <p className="text-slate-400 mb-6 text-lg">
              MeetVault can be self-hosted. You own your data and have full control over your deployment.
            </p>
          </div>
        </div>
      </section>

      <CTA />
    </div>
  );
}
