import { MessageSquare, Shield, LineChart, UserCheck, Lock } from "lucide-react";

export const LandingFeatures = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "Plain Language Strategy Creation",
      description: "Write your strategy the same way you would explain it to another trader. Algo interprets trading logic and converts it into structured, executable rules."
    },
    {
      icon: Shield,
      title: "Structured Backtesting Environment",
      description: "Each strategy is generated in a controlled environment and prepared for historical testing across selected markets (Forex, crypto, equities)."
    },
    {
      icon: LineChart,
      title: "Transparent Performance Analysis",
      description: "Review detailed reports including trade-by-trade history, drawdown, risk metrics, win rate, and expectancy. Understand why a strategy performs the way it does."
    },
    {
      icon: UserCheck,
      title: "Human Oversight by Default",
      description: "You remain involved at every step. Strategies can be reviewed, adjusted, versioned, and re-tested before any further action."
    },
    {
      icon: Lock,
      title: "Safety-Oriented Design",
      description: "Testing is sandboxed to prevent unintended behavior. Future live execution will include additional safeguards and explicit approvals."
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Key Capabilities
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Tools designed to support disciplined, systematic trading
            </p>
          </div>

          {/* Features grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:border-teal-500/50 backdrop-blur-sm transition-all duration-300 hover:shadow-[0_0_30px_rgba(20,184,166,0.1)]"
              >
                <div className="w-12 h-12 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
