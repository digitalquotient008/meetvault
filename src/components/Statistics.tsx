export default function Statistics() {
  const stats = [
    {
      metric: '2 minutes',
      description: 'Get started in minutes',
      icon: '⚡',
    },
    {
      metric: 'Built-in CRM',
      description: 'No need for external tools',
      icon: '👥',
    },
    {
      metric: 'Self-hosted',
      description: 'Own your data completely',
      icon: '🔒',
    },
    {
      metric: 'Free to Start',
      description: 'No credit card required',
      icon: '💰',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
            Why lawyers and firms choose MeetVault
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl mb-4">{stat.icon}</div>
              <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">
                {stat.metric}
              </div>
              <p className="text-slate-400 text-lg">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
