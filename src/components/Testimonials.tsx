export default function Testimonials() {
  const outcomes = [
    {
      title: 'Reliable payments',
      description:
        'Payment confirms before the appointment. No “booked but payment failed” surprises like with other apps.',
      icon: '✅',
    },
    {
      title: 'Reminders you control',
      description:
        'Appointment reminders only—no spam or marketing blasts. Your clients get 24h and 1h reminders, nothing else.',
      icon: '🔔',
    },
    {
      title: 'Fewer no-shows',
      description:
        'Deposits and cancellation fees protect your time. Buffers and availability rules prevent double-books.',
      icon: '💰',
    },
    {
      title: 'Client history in one place',
      description:
        'See who’s coming in, past visits, and notes. No spreadsheets.',
      icon: '👥',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
            Why salons and barbers use MeetingVault
          </h2>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto">
            Reliable payments, reminders you control, no spam.
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
