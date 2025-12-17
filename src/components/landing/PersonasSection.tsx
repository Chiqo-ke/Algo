import { Users, TrendingUp, Brain, Clock } from "lucide-react";

export const PersonasSection = () => {
  const personas = [
    {
      icon: Users,
      title: "Consistency Seekers",
      description: "Traders working to overcome emotional or inconsistent execution"
    },
    {
      icon: Clock,
      title: "Part-Time Traders",
      description: "Who want structured systems instead of discretionary stress"
    },
    {
      icon: Brain,
      title: "Strategy Developers",
      description: "Strategy-focused traders who want to test ideas properly"
    },
    {
      icon: TrendingUp,
      title: "Systematic Investors",
      description: "Exploring systematic approaches without deep technical overhead"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Who Algo Agent Is Designed For
            </h2>
            <p className="text-lg text-gray-300">
              Supporting traders focused on discipline, structure, and evidence-based decisions
            </p>
          </div>

          {/* Personas grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {personas.map((persona, index) => (
              <div 
                key={index}
                className="text-center p-6 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-teal-500/50 backdrop-blur-sm transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mx-auto mb-4">
                  <persona.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {persona.title}
                </h3>
                <p className="text-sm text-gray-300">
                  {persona.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
