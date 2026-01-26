import { MessageSquare, Shield, LineChart, UserCheck } from "lucide-react";

export const LandingFeatures = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "Plain Language Strategy Creation",
      description: "Write your strategy the same way you would explain it to another trader. Algo interprets trading logic and converts it into structured, executable rules.",
      svgPattern: (
        <svg className="absolute top-0 right-0 w-32 h-32 opacity-5" viewBox="0 0 100 100">
          <path d="M10 50 Q30 20 50 50 T90 50" fill="none" stroke="currentColor" strokeWidth="1" className="text-teal-400" />
          <circle cx="50" cy="50" r="3" fill="currentColor" className="text-cyan-400" />
        </svg>
      )
    },
    {
      icon: Shield,
      title: "Structured Backtesting Environment",
      description: "Each strategy is generated in a controlled environment and prepared for historical testing across selected markets (Forex, crypto, equities).",
      svgPattern: (
        <svg className="absolute top-0 right-0 w-32 h-32 opacity-5" viewBox="0 0 100 100">
          <path d="M50 10 L70 30 L70 70 L50 90 L30 70 L30 30 Z" fill="none" stroke="currentColor" strokeWidth="1" className="text-teal-400" />
          <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="1" className="text-cyan-400" />
        </svg>
      )
    },
    {
      icon: LineChart,
      title: "Transparent Performance Analysis",
      description: "Review detailed reports including trade-by-trade history, drawdown, risk metrics, win rate, and expectancy. Understand why a strategy performs the way it does.",
      svgPattern: (
        <svg className="absolute top-0 right-0 w-32 h-32 opacity-5" viewBox="0 0 100 100">
          <path d="M10 80 L25 60 L40 70 L55 40 L70 50 L85 30" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-400" />
          <circle cx="55" cy="40" r="4" fill="currentColor" className="text-cyan-400" />
        </svg>
      )
    },
    {
      icon: UserCheck,
      title: "Human Oversight by Default",
      description: "You remain involved at every step. Strategies can be reviewed, adjusted, versioned, and re-tested before any further action.",
      svgPattern: (
        <svg className="absolute top-0 right-0 w-32 h-32 opacity-5" viewBox="0 0 100 100">
          <circle cx="50" cy="35" r="15" fill="none" stroke="currentColor" strokeWidth="1" className="text-teal-400" />
          <path d="M30 55 Q50 60 70 55 L65 80 Q50 85 35 80 Z" fill="none" stroke="currentColor" strokeWidth="1" className="text-cyan-400" />
        </svg>
      )
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-900 relative overflow-hidden">
      {/* Futuristic grid background */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="features-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#14b8a6" strokeWidth="0.5" />
              <circle cx="0" cy="0" r="1" fill="#14b8a6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#features-grid)" />
        </svg>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section header with futuristic styling */}
          <div className="text-center mb-16 relative">
            <div className="inline-block relative">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4 relative z-10">
                Key Capabilities
              </h2>
              <div className="absolute inset-0 blur-2xl bg-cyan-500/10 animate-glow" style={{ animationDelay: '0.5s' }} />
            </div>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Tools designed to support disciplined, systematic trading
            </p>
            
            {/* Decorative elements */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-cyan-500" />
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.6s' }} />
              <div className="w-16 h-px bg-gradient-to-l from-transparent to-cyan-500" />
            </div>
          </div>

          {/* Features grid with enhanced cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Outer glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-br from-teal-500/0 to-cyan-500/0 group-hover:from-teal-500/20 group-hover:to-cyan-500/20 rounded-2xl blur-xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
                
                <div className="relative bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 hover:border-teal-500/50 backdrop-blur-sm transition-all duration-300 hover:shadow-[0_0_30px_rgba(20,184,166,0.15)] h-full overflow-hidden">
                  {/* Background SVG pattern */}
                  {feature.svgPattern}
                  
                  {/* Corner accents */}
                  <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-teal-500/20 rounded-tr-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-teal-500/20 rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Icon container with enhanced animation */}
                  <div className="relative w-14 h-14 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4 group-hover:scale-110 group-hover:border-teal-500/40 transition-all duration-300 overflow-hidden">
                    {/* Shimmer effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <feature.icon className="w-7 h-7 relative z-10 group-hover:rotate-6 transition-transform" />
                  </div>
                  
                  <h3 className="text-lg font-display font-bold text-white mb-2 relative z-10">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 relative z-10">
                    {feature.description}
                  </p>
                  
                  {/* Animated bottom accent */}
                  <div className="mt-4 h-px bg-gradient-to-r from-teal-500/0 via-teal-500/50 to-teal-500/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
