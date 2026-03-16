import { FEATURE_LAYERS } from '@/lib/constants';
import Link from 'next/link';

export default function Features() {
  return (
    <section id="features" className="py-16 sm:py-20 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">Four layers for consultations</h2>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Core booking, revenue, workflow, and automation — built for lawyers
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURE_LAYERS.map((layer) => (
            <div key={layer.id} className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-2">{layer.name}</h3>
              <p className="text-slate-400 text-sm mb-4">{layer.description}</p>
              <ul className="space-y-2 text-sm text-slate-300">
                {layer.items.slice(0, 3).map((item, i) => (
                  <li key={i} className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2" />
                    {item}
                  </li>
                ))}
                {layer.items.length > 3 && (
                  <li className="text-slate-500">+{layer.items.length - 3} more</li>
                )}
              </ul>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/features"
            className="inline-flex items-center text-blue-400 font-medium hover:text-blue-300 transition-colors"
          >
            See all features
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
