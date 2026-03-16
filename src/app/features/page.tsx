import { FEATURE_LAYERS, FUTURE_FEATURES } from '@/lib/constants';
import CTA from '@/components/CTA';

export const metadata = {
  title: 'Features - MeetVault',
  description: 'Booking, deposits, no-show protection, and client history for salons and barbers. Like Squire, without the headaches.',
};

export default function FeaturesPage() {
  return (
    <div className="bg-slate-950 min-h-screen">
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Booking & payments for salons and barbers
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Core booking, revenue, workflow, and automation—built for the chair. Reliable payments, no spam.
            </p>
          </div>
        </div>
      </section>

      {FEATURE_LAYERS.map((layer) => (
        <section
          key={layer.id}
          className={layer.id === 'revenue' || layer.id === 'automation' ? 'py-20 bg-slate-900' : 'py-20'}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{layer.name}</h2>
            {layer.description && (
              <p className="text-slate-400 text-lg mb-8">{layer.description}</p>
            )}
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {layer.items.map((item, index) => (
                <li
                  key={index}
                  className="bg-slate-800/80 border border-slate-700 rounded-lg p-4 flex items-center"
                >
                  <svg className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-200">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Use Cases
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors">
              <h3 className="text-xl font-semibold text-white mb-3">Solo barbers</h3>
              <p className="text-slate-400">
                One link, deposits to cut no-shows, client history and notes. Free to start. Reminders you control—no spam.
              </p>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors">
              <h3 className="text-xl font-semibold text-white mb-3">Barbershops & salons</h3>
              <p className="text-slate-400">
                Multiple barbers or stylists, each with a booking link. Deposits, cancellation fees, reliable payment confirmation.
              </p>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors">
              <h3 className="text-xl font-semibold text-white mb-3">Nail techs & stylists</h3>
              <p className="text-slate-400">
                Set services and hours, share your link. Get paid upfront or in-shop. Client notes and booking history in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-800/80 rounded-2xl p-8 md:p-12 border border-slate-700">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Roadmap
              </h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                Advanced features coming soon
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FUTURE_FEATURES.map((feature, index) => (
                <div key={index} className="bg-slate-900/80 rounded-lg p-4 flex items-center border border-slate-700">
                  <svg className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTA />
    </div>
  );
}
