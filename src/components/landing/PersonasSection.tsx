import { Users, TrendingUp, Brain, Clock } from "lucide-react";

export const PersonasSection = () => {
  const personas = [
    {
      icon: Users,
      title: "Consistency Seekers",
      description: "Traders working to overcome emotional or inconsistent execution",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Clock,
      title: "Part-Time Traders",
      description: "Who want structured systems instead of discretionary stress",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Brain,
      title: "Strategy Developers",
      description: "Strategy-focused traders who want to test ideas properly",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: TrendingUp,
      title: "Systematic Investors",
      description: "Exploring systematic approaches without deep technical overhead",
      color: "from-teal-500 to-emerald-500"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-900 relative overflow-hidden">
      {/* Futuristic background */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="personas-dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1.5" fill="#14b8a6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#personas-dots)" />
        </svg>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section header with futuristic styling */}
          <div className="text-center mb-12 relative">
            <div className="inline-block relative">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4 relative z-10">
                Who AlgoAI Is Designed For
              </h2>
              <div className="absolute inset-0 blur-2xl bg-purple-500/10 animate-glow" style={{ animationDelay: '0.3s' }} />
            </div>
            <p className="text-lg text-gray-300">
              Supporting traders focused on discipline, structure, and evidence-based decisions
            </p>
            
            {/* Decorative line */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <div className="w-20 h-px bg-gradient-to-l from-transparent via-purple-500 to-transparent" />
            </div>
          </div>

          {/* Personas grid with enhanced design */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {personas.map((persona, index) => (
              <div 
                key={index}
                className="group text-center p-6 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-teal-500/50 backdrop-blur-sm transition-all duration-300 relative overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient glow on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${persona.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl`} />
                
                {/* Icon container with enhanced animation */}
                <div className="relative mx-auto mb-4">
                  <div className={`absolute inset-0 bg-gradient-to-br ${persona.color} opacity-20 rounded-full blur-md group-hover:blur-lg transition-all`} />
                  <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full bg-teal-500/10 border-2 border-teal-500/30 flex items-center justify-center text-teal-400 mx-auto group-hover:scale-110 group-hover:border-teal-500/50 transition-all duration-300">
                    <persona.icon className="w-6 h-6 md:w-8 md:h-8 group-hover:rotate-6 transition-transform" />
                  </div>
                </div>
                
                <h3 className="text-lg font-display font-bold text-white mb-2 relative z-10">
                  {persona.title}
                </h3>
                <p className="text-sm text-gray-300 relative z-10">
                  {persona.description}
                </p>
                
                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${persona.color} opacity-0 group-hover:opacity-50 transition-opacity`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
