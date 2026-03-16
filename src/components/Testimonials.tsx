export default function Testimonials() {
  const outcomes = [
    {
      title: 'Reach more customers',
      description:
        'Share a booking link anywhere and let clients book instantly—without back-and-forth emails.',
      icon: '📈',
    },
    {
      title: 'Better ROI on time',
      description:
        'Automate scheduling, reminders, and follow-ups so your team can focus on delivering value.',
      icon: '⏱️',
    },
    {
      title: 'Fewer scheduling mistakes',
      description:
        'Availability rules, buffers, and conflict checks help prevent double-bookings and no-shows.',
      icon: '✅',
    },
    {
      title: 'Stronger client relationships',
      description:
        'Keep context in one place with contact profiles and booking history, so every interaction feels personalized.',
      icon: '👥',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
            Why lawyers and firms use MeetVault
          </h2>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto">
            Book consultations, get paid, run intake and client workflow, and cut coordination overhead in one place.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {outcomes.map((item) => (
            <div
              key={item.title}
              className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-xl">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
