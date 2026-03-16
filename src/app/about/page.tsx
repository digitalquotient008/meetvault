import CTA from '@/components/CTA';

export const metadata = {
  title: 'About - MeetVault',
  description: 'MeetVault is the client consultation platform for lawyers. One place for booking, payments, intake, and client workflow.',
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
              Client consultation platform for lawyers
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-slate-400 mb-6 text-lg">
              MeetVault was built so lawyers can run client consultations from one platform: book consultations, 
              collect payments and deposits, run intake and document uploads, and keep client history and notes 
              in one place—without juggling multiple tools or expensive subscriptions.
            </p>
            
            <h2 className="text-3xl font-bold text-white mb-6 mt-12">What Makes Us Different</h2>
            <p className="text-slate-400 mb-6 text-lg">
              We combine core booking (calendar, time zones, video links, reminders), revenue (payments, deposits, 
              cancellation fees), workflow (intake, document uploads, client history, notes), and automation 
              (follow-ups, rescheduling, waitlists) in one product. Built for solo and small-firm practice.
            </p>
            
            <h2 className="text-3xl font-bold text-white mb-6 mt-12">Our Approach</h2>
            <p className="text-slate-400 mb-6 text-lg">
              We focus on the layers that matter for legal consultations. As we grow, we add features based on 
              feedback from lawyers and firms. Your practice drives our roadmap.
            </p>
            
            <h2 className="text-3xl font-bold text-white mb-6 mt-12">Your Data, Your Control</h2>
            <p className="text-slate-400 mb-6 text-lg">
              MeetVault can be self-hosted. You own your data and have full control over your deployment. 
              We believe in transparency and giving you the freedom to choose how you run your practice.
            </p>
          </div>
        </div>
      </section>

      <CTA />
    </div>
  );
}
